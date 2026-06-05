import { logger } from "../logger";
import type { Client, Guild } from "discord.js";
import type { BoosterRoleStore } from "./boosterRoleService";
import type { RoleRepository } from "./boosterRoleService";

export type CleanupServiceOptions = {
  intervalMs: number;
  boosterEligibilityRoleId: string;
  anchorRoleId: string | null;
};

/**
 * Periodically scans all guilds for booster roles whose owners are no longer
 * boosting (missed due to bot downtime). Removes orphan custom roles and
 * database records.
 */
export function startBoostCleanup(
  client: Client,
  store: BoosterRoleStore,
  repoFactory: (guild: Guild) => RoleRepository,
  options: CleanupServiceOptions,
): { stop: () => void } {
  const timer = setInterval(() => {
    runCleanup(client, store, repoFactory, options).catch((err) => {
      logger.error("Boost cleanup cycle failed", { error: String(err) });
    });
  }, options.intervalMs);

  // Run once immediately on startup too
  runCleanup(client, store, repoFactory, options).catch((err) => {
    logger.error("Boost initial cleanup failed", { error: String(err) });
  });

  return {
    stop: () => clearInterval(timer),
  };
}

async function runCleanup(
  client: Client,
  store: BoosterRoleStore,
  repoFactory: (guild: Guild) => RoleRepository,
  options: CleanupServiceOptions,
): Promise<void> {
  const guilds = client.guilds.cache;

  for (const guild of guilds.values()) {
    try {
      await cleanupGuild(guild, store, repoFactory(guild), options);
    } catch (err) {
      logger.error("Boost cleanup failed for guild", {
        guildId: guild.id,
        error: String(err),
      });
    }
  }
}

async function cleanupGuild(
  guild: Guild,
  store: BoosterRoleStore,
  roles: RoleRepository,
  options: CleanupServiceOptions,
): Promise<void> {
  // Fetch fresh member data to check current booster eligibility
  await guild.members.fetch();

  const records = await store.findByGuild(guild.id);

  for (const record of records) {
    const member = guild.members.cache.get(record.userId);

    // Member left the server entirely → remove role + record
    if (!member) {
      logger.info("Boost cleanup: member left guild, removing role", {
        guildId: guild.id,
        userId: record.userId,
        roleId: record.roleId,
      });
      await roles.deleteRole(record.roleId);
      await store.delete(guild.id, record.userId);
      continue;
    }

    // Member still here but no longer has the booster eligibility role
    const hasBoosterRole = member.roles.cache.has(options.boosterEligibilityRoleId);
    if (!hasBoosterRole) {
      logger.info("Boost cleanup: member lost boost, removing role", {
        guildId: guild.id,
        userId: record.userId,
        roleId: record.roleId,
      });
      await roles.deleteRole(record.roleId);
      await store.delete(guild.id, record.userId);
    }
  }
}
