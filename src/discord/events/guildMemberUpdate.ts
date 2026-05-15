import type { GuildMember } from "discord.js";
import type { BoosterRoleService } from "../../services/boosterRoleService";

export async function handleGuildMemberUpdate(oldMember: GuildMember, newMember: GuildMember, service: BoosterRoleService): Promise<void> {
  const hadBoost = Boolean(oldMember.premiumSince);
  const hasBoost = Boolean(newMember.premiumSince);

  if (hadBoost && !hasBoost) {
    await service.removeRoleForLostBoost({ guildId: newMember.guild.id, userId: newMember.id });
  }
}
