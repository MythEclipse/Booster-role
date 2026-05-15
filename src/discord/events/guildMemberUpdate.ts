import type { BoosterRoleService } from "../../services/boosterRoleService";

type GuildMemberLike = {
  id: string;
  premiumSince: Date | null;
  guild: { id: string };
};

export async function handleGuildMemberUpdate(oldMember: GuildMemberLike, newMember: GuildMemberLike, service: BoosterRoleService): Promise<void> {
  const hadBoost = Boolean(oldMember.premiumSince);
  const hasBoost = Boolean(newMember.premiumSince);

  if (hadBoost && !hasBoost) {
    await service.removeRoleForLostBoost({ guildId: newMember.guild.id, userId: newMember.id });
  }
}
