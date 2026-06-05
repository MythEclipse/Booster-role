import { logger } from "../../logger";

const greetings = [
  (userId: string) =>
    `🎉 Makasih udah ngeboost <@${userId}>! Sekarang kamu bisa claim custom role pake \`/booster-role claim\` di sini.`,
  (userId: string) =>
    `🔥 <@${userId}> baru aja ngeboost! Langsung aja claim custom role kamu pake \`/booster-role claim\` di sini.`,
  (userId: string) =>
    `✨ Thank you <@${userId}> for the boost! Claim custom role kamu pake \`/booster-role claim\` di sini ya.`,
  (userId: string) =>
    `👑 <@${userId}> ngeboost server! Yuk langsung claim custom role pake \`/booster-role claim\` di sini.`,
  (userId: string) =>
    `🎊 Ada booster baru nih, <@${userId}>! Jangan lupa claim custom role kamu pake \`/booster-role claim\` di sini.`,
];

/**
 * Sends a random welcome message via the given channel when a member newly
 * acquires the booster eligibility role (i.e. just boosted the server).
 */
export async function sendBoostGreeting(
  channel: { send(input: { content: string }): Promise<unknown> },
  userId: string,
  greetingChannelId: string,
): Promise<void> {
  const pick = Math.floor(Math.random() * greetings.length);
  const message = greetings[pick](userId);

  await channel.send({ content: message });

  logger.info("Boost greeting sent", { userId, channelId: greetingChannelId, variant: pick });
}
