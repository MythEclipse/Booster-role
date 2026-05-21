import { loadConfig } from "./config";
import { attachBotHandlers } from "./discord/bot";
import { createDiscordClient } from "./discord/client";
import { registerGuildCommandsWithToken } from "./discord/registerCommands";
import { logger } from "./logger";

const config = loadConfig();
logger.info("Registering guild commands", { guildId: config.discordGuildId });
await registerGuildCommandsWithToken(config.discordToken, {
  clientId: config.discordClientId,
  guildId: config.discordGuildId
});
logger.info("Guild commands registered", { guildId: config.discordGuildId });

const client = createDiscordClient();
attachBotHandlers(client, config);

client.once("clientReady", () => {
  logger.info("Discord client ready", { bot: client.user?.tag ?? "unknown bot" });
});

logger.info("Logging in Discord client");
await client.login(config.discordToken);
