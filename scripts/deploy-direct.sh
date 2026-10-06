#!/usr/bin/env bash
#
# Direct pnpm + systemd deploy for booster-role (no Nix).
#
# .github/workflows/deploy.yml scps THIS file plus a tarball of the checkout out
# of the commit being deployed and runs it on the VPS as:
#
#     bash /tmp/booster-role-deploy.sh <git-sha> <source-tarball>
#
# The script is shipped from the checkout (never read from the running payload)
# so the deploy logic always matches the commit that is being released.
#
# Why a tarball and not a clone: the runner already holds the exact tree that
# passed typecheck + tests, so what lands on the box is byte-identical to what
# was verified, and the deploy does not depend on the box being able to reach
# GitHub (it only needs the npm registry, which pnpm install needs anyway).
#
# Flow:
#   1. extract the tarball into $RELEASES_DIR/<sha>
#   2. pnpm install --frozen-lockfile there (devDependencies included — the unit
#      runs drizzle-kit + tsx out of node_modules, they are NOT optional)
#   3. sanity-check the tree BEFORE touching $CURRENT (tsx + drizzle-kit present)
#   4. swap it into place: current -> current.previous, release -> current
#   5. systemctl restart + hold `is-active` steady (the bot has no inbound
#      listener, so health is a steady systemd state, not an HTTP probe)
#   6. on failure: restore current.previous, restart, re-check
#   7. prune leftover release dirs (never the active one)
#
# Overrides (defaults are the production values):
#   RELEASES_DIR CURRENT UNIT KEEP_RELEASES SKIP_RESTART=1
#
# Failure modes that are safe by construction: an install or sanity-check
# failure happens before the swap, so $CURRENT is never touched and the running
# service keeps its old code.
set -Eeuo pipefail

RELEASES_DIR="${RELEASES_DIR:-/opt/booster-role/releases}"
CURRENT="${CURRENT:-/opt/booster-role/current}"
PREV="${CURRENT}.previous"
UNIT="${UNIT:-booster-role}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SKIP_RESTART="${SKIP_RESTART:-0}"

log()  { printf '[deploy] %s\n' "$*"; }
die()  { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

SHA="${1:-}"
TARBALL="${2:-}"
[ -n "$SHA" ] || die "usage: $0 <git-sha> <source-tarball>"
[ -n "$TARBALL" ] && [ -f "$TARBALL" ] || die "source tarball not found: ${TARBALL:-<none>}"

# ── privileges ─────────────────────────────────────────────────────────────
# Writes under /opt/booster-role and systemctl need root when the deploy user
# is not root itself; use passwordless sudo when available, plain commands otherwise.
as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif sudo -n true 2>/dev/null; then
    sudo -n "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    "$@"
  fi
}

# ── toolchain ──────────────────────────────────────────────────────────────
# /usr/local/bin/pnpm on the VPS is the corepack shim. Inside a project it
# resolves `packageManager` (pnpm@10.33.2) and may fetch that tarball on first
# use; the download prompt must never block a non-interactive ssh session.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

resolve_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    command -v pnpm
  elif command -v corepack >/dev/null 2>&1; then
    printf 'corepack pnpm'
  else
    die "pnpm not found on PATH (expected corepack/pnpm >= 10)"
  fi
}
PNPM="$(resolve_pnpm)"

command -v node >/dev/null 2>&1 || die "node not found on PATH"
command -v tar  >/dev/null 2>&1 || die "tar not found on PATH"
log "node $(node -v) | $($PNPM --version 2>/dev/null || echo 'pnpm ?') | user $(id -un)"

# ── state captured before we touch anything ────────────────────────────────
[ -e "$CURRENT" ] || die "$CURRENT does not exist — refusing to bootstrap over it"
CURRENT_OWNER="$(stat -c '%u:%g' "$CURRENT" 2>/dev/null || true)"
ACTIVATED=0

rollback() {
  # Deliberately defensive: never let rollback itself abort the script.
  set +e
  trap - ERR
  log "ROLLING BACK"
  if [ -e "$PREV" ] && [ ! -e "$CURRENT" ]; then
    log "restoring $CURRENT from $PREV"
    as_root mv "$PREV" "$CURRENT"
  elif [ -e "$PREV" ] && [ -e "$CURRENT" ]; then
    # current holds the bad release; drop it and put the old one back
    log "replacing $CURRENT with $PREV"
    as_root rm -rf "$CURRENT"
    as_root mv "$PREV" "$CURRENT"
  else
    log "no previous release to restore (nothing to roll back to)"
  fi
  if [ "$SKIP_RESTART" != "1" ]; then
    as_root systemctl restart "$UNIT"
    health_check || log "WARNING: service still unhealthy after rollback"
  fi
}

on_error() {
  local rc="$1" line="$2"
  log "step failed at line $line (exit $rc)"
  if [ "$ACTIVATED" = "1" ]; then
    rollback
  fi
  exit "$rc"
}
trap 'on_error $LINENO' ERR

# The bot makes no inbound listener (Discord is outbound), so health is
# `systemctl is-active` held steady across a restart window. The unit has
# Restart=always RestartSec=5: a process that dies on startup flips back to
# `activating` every 5s, which resets the consecutive-active counter, so six
# consecutive seconds of `active` cannot be faked by a crash loop.
health_check() {
  local i active=0
  log "health-check $UNIT (waiting for 6 consecutive seconds of active)"
  for i in $(seq 1 30); do
    if systemctl is-failed --quiet "$UNIT"; then
      log "$UNIT is in failed state"
      return 1
    fi
    if systemctl is-active --quiet "$UNIT"; then
      active=$((active + 1))
      [ "$active" -ge 6 ] && return 0
    else
      active=0
    fi
    sleep 1
  done
  return 1
}

dump_journal() {
  printf '\n=== %s journal ===\n' "$UNIT"
  journalctl -u "$UNIT" -n 60 --no-pager || true
  printf '=== %s status ===\n' "$UNIT"
  systemctl status "$UNIT" --no-pager -l || true
}

# ── 1. unpack the release ──────────────────────────────────────────────────
RELEASE_DIR="${RELEASES_DIR}/${SHA}"
if [ ! -d "$RELEASES_DIR" ]; then
  as_root mkdir -p "$RELEASES_DIR"
fi
if [ ! -w "$RELEASES_DIR" ]; then
  as_root chown "$(id -u):$(id -g)" "$RELEASES_DIR"
fi
if [ -e "$RELEASE_DIR" ]; then
  log "replacing leftover $RELEASE_DIR"
  as_root rm -rf "$RELEASE_DIR"
fi
mkdir -p "$RELEASE_DIR"
log "unpacking $(basename "$TARBALL") -> $RELEASE_DIR"
tar -xzf "$TARBALL" -C "$RELEASE_DIR"
[ -f "$RELEASE_DIR/package.json" ] || die "$RELEASE_DIR is not a booster-role checkout"

# Carry runtime env across (not tracked by git, so a fresh checkout has none).
if [ -f "$CURRENT/.env" ] && [ ! -f "$RELEASE_DIR/.env" ]; then
  cp "$CURRENT/.env" "$RELEASE_DIR/.env"
  log "copied .env from the live tree"
fi

# Match the owner of the tree we are replacing so the deploy does not leave a
# root-owned payload behind for whoever edits it next (best effort).
if [ -n "$CURRENT_OWNER" ] && [ "$CURRENT_OWNER" != "$(id -u):$(id -g)" ]; then
  as_root chown -R "$CURRENT_OWNER" "$RELEASE_DIR" || log "WARNING: could not chown release"
fi

# ── 2. install ─────────────────────────────────────────────────────────────
# NODE_ENV must NOT be production here: pnpm would then skip devDependencies and
# the unit would boot without drizzle-kit (migrate) or tsx (entry point).
(
  cd "$RELEASE_DIR"
  unset NODE_ENV || true
  log "pnpm install --frozen-lockfile"
  $PNPM install --frozen-lockfile
)

# ── 3. sanity-check before anything is swapped ─────────────────────────────
# Both paths are what /opt/booster-role/bin/booster-role execs. Failing here
# means $CURRENT is still the live tree and the service was never disturbed.
[ -x "$RELEASE_DIR/node_modules/.bin/tsx" ] || \
  die "node_modules/.bin/tsx missing after install — pnpm skipped devDependencies or esbuild builds"
[ -f "$RELEASE_DIR/node_modules/drizzle-kit/bin.cjs" ] || \
  die "node_modules/drizzle-kit/bin.cjs missing after install — the unit cannot migrate"

# ── 4. activate ────────────────────────────────────────────────────────────
log "activating $RELEASE_DIR"
if [ -e "$PREV" ]; then
  as_root rm -rf "$PREV"
fi
as_root mv "$CURRENT" "$PREV"
if ! as_root mv "$RELEASE_DIR" "$CURRENT"; then
  as_root mv "$PREV" "$CURRENT"
  die "could not activate $RELEASE_DIR"
fi
[ -f "$CURRENT/package.json" ] || die "$CURRENT is not the release tree"
ACTIVATED=1

# ── 5. restart ─────────────────────────────────────────────────────────────
if [ "$SKIP_RESTART" = "1" ]; then
  log "SKIP_RESTART=1 — not restarting $UNIT"
else
  log "restarting $UNIT"
  as_root systemctl restart "$UNIT"
fi

# ── 6. health check ────────────────────────────────────────────────────────
if [ "$SKIP_RESTART" = "1" ] || health_check; then
  ACTIVATED=0
  log "healthy — deploy of ${SHA:0:7} complete"
else
  dump_journal
  # `die` below would skip the ERR trap (plain exit), so roll back explicitly.
  rollback
  die "health check failed after deploying ${SHA:0:7}"
fi

# ── 7. prune leftover release dirs ─────────────────────────────────────────
kept=0
while IFS= read -r dir; do
  [ -n "$dir" ] || continue
  [ "$dir" = "$RELEASE_DIR" ] && continue
  kept=$((kept + 1))
  if [ "$kept" -gt "$KEEP_RELEASES" ]; then
    log "pruning old release $(basename "$dir")"
    as_root rm -rf "$dir"
  fi
done < <(ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null || true)

log "done: $CURRENT (${SHA:0:7}), rollback target $PREV"
