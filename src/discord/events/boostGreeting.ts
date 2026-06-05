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
    `🎉 Makasih udah ngeboost <@${userId}>! ` +
    `Sekarang kamu bisa claim custom role pake \`/booster-role claim\` di sini.`;

  await channel.send({ content: message });

  logger.info("Boost greeting sent", { userId, channelId: greetingChannelId });
}
