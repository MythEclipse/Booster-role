type GuildMemberLike = {
  id: string;
  guild: { id: string };
  roles: { cache: { has(roleId: string): boolean } };
};

type BoosterRoleRemovalService = {
  removeRoleForLostBoost(input: { guildId: string; userId: string }): Promise<void>;
};

export async function handleGuildMemberUpdate(
  oldMember: GuildMemberLike,
  newMember: GuildMemberLike,
  service: BoosterRoleRemovalService,
  boosterEligibilityRoleId: string
): Promise<void> {
  const hadBoosterRole = oldMember.roles.cache.has(boosterEligibilityRoleId);
  const hasBoosterRole = newMember.roles.cache.has(boosterEligibilityRoleId);

  if (hadBoosterRole && !hasBoosterRole) {
    await service.removeRoleForLostBoost({ guildId: newMember.guild.id, userId: newMember.id });
  }
}
