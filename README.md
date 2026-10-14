# Booster Role Bot

Discord bot untuk memberi role custom kosmetik ke user yang sedang boost server. Role dibuat oleh bot, tidak boleh mengambil role yang sudah ada, dan otomatis dihapus saat user tidak lagi eligible.

## Tech stack

- Node.js 24 + TypeScript
- discord.js
- PostgreSQL via Drizzle ORM
- Node.js test runner (`node:test`) dengan `expect`

## Prasyarat

- Node.js 24 dan pnpm terinstall
- Bot Discord dengan token dari Developer Portal
- Test guild/server Discord
- Bot punya permission `Manage Roles`
- Posisi role bot harus lebih tinggi dari role custom yang akan dibuat

## Setup

```bash
pnpm install
cp .env.example .env
```

Isi `.env`:

```env
DISCORD_TOKEN=token_bot_discord
DISCORD_CLIENT_ID=client_id_aplikasi_discord
DISCORD_GUILD_ID=id_server_discord
DATABASE_URL=postgresql://asephs:***@100.121.180.82:6432/boost
BOOSTER_ROLE_ANCHOR_ROLE_ID=id_role_pembatas_opsional
BOOSTER_ELIGIBILITY_ROLE_ID=1206431347925852162
LOG_LEVEL=info
```

`BOOSTER_ROLE_ANCHOR_ROLE_ID` dipakai sebagai batas posisi role. Role booster custom harus berada di bawah role ini agar tetap kosmetik dan tidak menyentuh role staff/admin.

## Database

Generate dan jalankan migration setelah schema siap:

```bash
pnpm run db:generate
pnpm run db:migrate
```

Pastikan `DATABASE_URL` mengarah ke database PostgreSQL external (pool PgBouncer imrnes `100.121.180.82:6432`) sebelum menjalankan migration.

## Menjalankan bot

```bash
pnpm run dev
```

Saat startup, bot otomatis register slash command ke guild dari `DISCORD_GUILD_ID`, lalu menangani interaction command. Pastikan bot di-invite dengan scope `applications.commands`.

## Testing

```bash
pnpm test
pnpm test src/domain/roleGuards.test.ts
pnpm run typecheck
pnpm run lint
```

## Keamanan role

Bot ini dirancang supaya aman dari abuse:

- User tidak bisa claim role Discord yang sudah ada.
- Claim selalu membuat role baru yang dikelola bot.
- Rename, recolor, dan delete hanya berlaku untuk role yang tercatat di database sebagai milik user tersebut.
- Role custom dibuat dengan permission kosong.
- Icon/logo role opsional hanya bisa dipasang ke role bot-managed milik user tersebut.
- Attachment icon harus berupa image dan dibatasi ukuran agar tidak disalahgunakan.
- Permission berbahaya seperti `Administrator`, `ManageRoles`, `ManageChannels`, `BanMembers`, `KickMembers`, `MentionEveryone`, `ManageGuild`, dan `ManageWebhooks` ditolak.
- Jika user tidak punya role booster eligibility dari `BOOSTER_ELIGIBILITY_ROLE_ID`, claim ditolak.

## Slash command target

Command utama yang disiapkan:

- `/booster-role claim name color icon` - claim role custom baru, dengan icon opsional.
- `/booster-role rename name` - rename role milik sendiri.
- `/booster-role recolor color` - ubah warna role milik sendiri.
- `/booster-role icon image` - pasang atau ganti logo/icon role milik sendiri.
- `/booster-role delete` - hapus role milik sendiri.
- `/booster-role admin-delete user` - admin dengan permission `Administrator` bisa hapus role custom user lain. User target bisa claim lagi jika masih eligible.

## Catatan eligibility boost

Untuk sekarang, user eligible jika punya role dari `BOOSTER_ELIGIBILITY_ROLE_ID`. Jika role ini hilang dari user, role bot-managed miliknya akan dihapus lewat event `guildMemberUpdate`.

## Releases and container images

Every push to `main` is analysed by [semantic-release](https://semantic-release.gitbook.io/).
The commit prefix decides the version bump — nobody types a version number:

| Commit | Result |
|---|---|
| `feat(scope): …` | minor bump |
| `fix(scope): …` | patch bump |
| `BREAKING CHANGE:` in the footer | major bump |
| `chore`, `ci`, `docs`, `refactor`, `test`, `build` | patch bump, or no release at all |

A release publishes a tag, a GitHub Release and the changelog. The same workflow
then builds and pushes one container image per service to GHCR at exactly that
version, so an image tag always matches a git tag:

This repo publishes 1 image(s):

| Package | Image |
|---|---|
| `booster-role` | `ghcr.io/asepharyana/Booster-role:booster-role:<version>` |


Pull one without touching the registry UI:

```bash
docker pull ghcr.io/asepharyana/<repo>:<service>:<version>
```

### Adding or removing an image

Do not edit `.github/workflows/release.yml` to change which images are built.
The list lives in `.github/docker-images.json`:

```json
{ "images": [
  { "package": "<service>", "context": ".", "file": "Dockerfile" }
] }
```

- `package` becomes the GHCR path component, so it must be lowercase
  `[a-z0-9._-]`. It does not have to match the repo name.
- `context` is the build context directory, `file` the Dockerfile within it.
- `build_args` is an object of `KEY=value` pairs; the pipeline flattens it before
  the matrix, so both the object and a pre-joined `"A=1\nB=2"` string work.
- `"enabled": false` keeps an entry documented but skips building it. **An empty
  or fully disabled list fails the run** rather than publishing nothing.

Every enabled entry must have a `Dockerfile` **and** a `.dockerignore` in its
context, and both must be tracked by git — CI cannot see an untracked file, and a
missing `.dockerignore` silently ships `node_modules/` and `.git` inside the image.

`latest` tracks the newest stable release. Prereleases (`1.2.0-rc.1`) are
tagged but never promote `latest`.

### If a release fails

Check the run, then fix forward with a normal commit — do not re-tag by hand:

```bash
gh run list --workflow=release.yml --limit 5
gh run view <run-id> --log-failed
```

A run that only built images and published no tag is normal for a `chore` push:
there was nothing to release, so no version was derived and no image was tagged.