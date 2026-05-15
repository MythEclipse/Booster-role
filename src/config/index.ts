export type AppConfig = {
  discordToken: string;
  discordClientId: string;
  discordGuildId: string;
  databaseUrl: string;
  boosterRoleAnchorRoleId: string | null;
};

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  return {
    discordToken: requireEnv(env, "DISCORD_TOKEN"),
    discordClientId: requireEnv(env, "DISCORD_CLIENT_ID"),
    discordGuildId: requireEnv(env, "DISCORD_GUILD_ID"),
    databaseUrl: env.DATABASE_URL ?? "file:./data/booster-role.sqlite",
    boosterRoleAnchorRoleId: env.BOOSTER_ROLE_ANCHOR_ROLE_ID ?? null
  };
}

function requireEnv(env: Record<string, string | undefined>, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}
