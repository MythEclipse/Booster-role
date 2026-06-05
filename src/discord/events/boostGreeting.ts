import { logger } from "../../logger";

/**
 * Sends a welcome message via the given channel when a member newly
 * acquires the booster eligibility role (i.e. just boosted the server).
 */
export async function sendBoostGreeting(
  channel: { send(input: { content: string }): Promise<unknown> },
  userId: string,
  greetingChannelId: string,
): Promise<void> {
  const message =
    `🎉 Thank you for boosting <@${userId}>! ` +
    `You can now claim a custom role using \`/booster-role claim\` in <#${greetingChannelId}>.`;

  await channel.send({ content: message });

  logger.info("Boost greeting sent", { userId, channelId: greetingChannelId });
}
