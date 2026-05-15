export type ExistingRole = {
  id: string;
  name: string;
};

import { forbiddenRolePermissions } from "../config/permissions";

export type ManagedRoleIdentity = {
  guildId: string;
  userId: string;
  roleId: string;
};

const forbiddenPermissions = new Set<string>(forbiddenRolePermissions);
const reservedRoleNames = new Set(["@everyone", "here", "everyone"]);

export function assertRoleNameIsAvailable(name: string, existingRoles: ExistingRole[]): void {
  const normalizedName = normalizeName(name);
  const hasUnmanagedRoleName = existingRoles.some((role) => normalizeName(role.name) === normalizedName);

  if (hasUnmanagedRoleName) {
    throw new Error("Role name is already used by an existing server role");
  }
}

export function assertCanManageStoredRole(stored: ManagedRoleIdentity, requested: ManagedRoleIdentity): void {
  if (stored.guildId !== requested.guildId) {
    throw new Error("Role is not bot-managed in this guild");
  }

  if (stored.userId !== requested.userId) {
    throw new Error("Role is not owned by this user");
  }

  if (stored.roleId !== requested.roleId) {
    throw new Error("Role is not bot-managed for this user");
  }
}

export function assertCosmeticPermissions(permissions: string[]): void {
  const hasDangerousPermission = permissions.some((permission) => forbiddenPermissions.has(permission));

  if (hasDangerousPermission) {
    throw new Error("Booster roles must be cosmetic and cannot grant elevated permissions");
  }
}

export function assertRolePositionIsSafe(targetPosition: number, anchorPosition: number): void {
  if (targetPosition >= anchorPosition) {
    throw new Error("Role position is not safe for a cosmetic booster role");
  }
}

export function validateRoleName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length < 3 || trimmedName.length > 32) {
    throw new Error("Role name must be 3-32 characters");
  }

  if (reservedRoleNames.has(normalizeName(trimmedName)) || trimmedName.includes("@")) {
    throw new Error("Role name is not allowed");
  }

  return trimmedName;
}

export function normalizeHexColor(color: string): `#${string}` {
  const normalizedColor = color.trim().toUpperCase();

  if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
    throw new Error("Color must be a hex value like #AABBCC");
  }

  return normalizedColor as `#${string}`;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}
