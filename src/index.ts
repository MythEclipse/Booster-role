import { loadConfig } from "./config";
import { createDiscordClient } from "./discord/client";

const config = loadConfig();
const client = createDiscordClient();

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag ?? "unknown bot"}`);
});

await client.login(config.discordToken);
