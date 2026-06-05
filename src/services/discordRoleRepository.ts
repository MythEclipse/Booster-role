import type { ColorResolvable, Guild, Role, RoleColorsResolvable } from "discord.js";
import type { ExistingRole } from "../domain/roleGuards";

export type RoleRepository = {
  listRoles(): Promise<ExistingRole[]>;
  createRole(input: { name: string; color: string | null; colors?: { primaryColor: string; secondaryColor?: string; tertiaryColor?: string } | null; permissions: string[]; position: number }): Promise<{ id: string }>;
  updateRole(roleId: string, input: { name?: string; color?: string | null; colors?: { primaryColor: string; secondaryColor?: string; tertiaryColor?: string } | null; icon?: string | null }): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  deleteRole(roleId: string): Promise<void>;
};

export class DiscordRoleRepository implements RoleRepository {
  constructor(private readonly guild: Guild) {}

  async listRoles() {
    await this.guild.roles.fetch();
    return this.guild.roles.cache.map((role) => ({ id: role.id, name: role.name }));
  }

  async createRole(input: { name: string; color: string | null; colors?: { primaryColor: string; secondaryColor?: string; tertiaryColor?: string } | null; permissions: string[]; position: number }): Promise<{ id: string }> {
    const colors = input.colors ?? (input.color ? { primaryColor: input.color as ColorResolvable } : undefined);
    const role = await this.guild.roles.create({
      name: input.name,
      colors: colors as RoleColorsResolvable | undefined,
      permissions: 0n
    });

    await role.setPosition(await this.resolvePosition(input.position));
    return { id: role.id };
  }

  async updateRole(roleId: string, input: { name?: string; color?: string | null; colors?: { primaryColor: string; secondaryColor?: string; tertiaryColor?: string } | null; icon?: string | null }): Promise<void> {
    const role = await this.fetchRole(roleId);
    await role.edit({
      name: input.name,
      colors: input.colors === undefined ? undefined : input.colors as RoleColorsResolvable,
      icon: input.icon === undefined ? undefined : input.icon
    });
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const member = await this.guild.members.fetch(userId);
    await member.roles.add(roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const member = await this.guild.members.fetch(userId);
    await member.roles.remove(roleId);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.fetchRole(roleId);
    await role.delete();
  }

  private async resolvePosition(fallbackPosition: number): Promise<number> {
    return Math.max(fallbackPosition, 1);
  }

  private async fetchRole(roleId: string): Promise<Role> {
    const role = await this.guild.roles.fetch(roleId);
    if (!role) throw new Error("Discord role not found");
    return role;
  }
}
