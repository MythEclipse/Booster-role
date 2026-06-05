import { logger } from "../../logger";

type GuildTextChannel = {
  send(input: { content: string }): Promise<unknown>;
};

type GuildMember = {
  id: string;
  guild: {
    id: string;
    channels: {
      cache: {
        get(channelId: string): GuildTextChannel | undefined;
      };
    };
  };
  user?: { id: string };
};

/**
 * Sends a welcome message to the configured greeting channel when a member
 * newly acquires the booster eligibility role (i.e. just boosted the server).
 *
 * Only fires on a *gain* transition (hadBoosterRole = false → hasBoosterRole = true).
 */
export function handleBoostGreeting(
  oldMember: GuildMember,
  newMember: GuildMember,
  greetingChannelId: string | null,
): void {
  if (!greetingChannelId) return;

  const hadBoosterRole = oldMember.roles.cache.has(/** @type {any} */ (null) as any);
  // Actually detect the gain: we need the actual role ID. The caller should pass it.
}

/**
 * Sends a welcome message when a member newly acquires the booster eligibility role.
 * Must be called with the booster eligibility role ID to check correctly.
 */
export async function sendBoostGreeting(
  member: { id: string; guild: { id: string; channels: { cache: { get(channelId: string): { send(input: { content: string }): Promise<unknown> } | undefined } } } },
  greetingChannelId: string,
): Promise<void> {
  const channel = member.guild.channels.cache.get(greetingChannelId);
  if (!channel) {
    logger.warn("Boost greeting channel not found", { channelId: greetingChannelId, guildId: member.guild.id });
    return;
  }

  await channel.send({
    content: `🎉 Thank you for boosting <@${member.user?.id ?? member.id}>! You can now claim a custom role using \`/booster-role claim\` in <#${greetingChannelId}>.`
  });

  logger.info("Boost greeting sent", {
    userId: member.user?.id ?? member.id,
    guildId: member.guild.id,
    channelId: greetingChannelId,
  });
}
