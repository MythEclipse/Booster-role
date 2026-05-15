import { describe, expect, test } from "bun:test";
import {
  assertCanManageStoredRole,
  assertCosmeticPermissions,
  assertRoleNameIsAvailable,
  assertRolePositionIsSafe,
  normalizeHexColor,
  validateRoleName
} from "./roleGuards";

const dangerousPermissions = [
  "Administrator",
  "ManageRoles",
  "ManageChannels",
  "BanMembers",
  "KickMembers",
  "MentionEveryone",
  "ManageGuild",
  "ManageWebhooks"
];

describe("role guards", () => {
  test("rejects claiming a name already used by an unmanaged role", () => {
    expect(() =>
      assertRoleNameIsAvailable("VIP", [
        { id: "role-1", name: "VIP" },
        { id: "role-2", name: "Member" }
      ])
    ).toThrow("Role name is already used");
  });

  test("allows managing only the role stored for the requesting user", () => {
    expect(() =>
      assertCanManageStoredRole(
        { guildId: "guild", userId: "user", roleId: "managed-role" },
        { guildId: "guild", userId: "attacker", roleId: "managed-role" }
      )
    ).toThrow("Role is not owned by this user");

    expect(() =>
      assertCanManageStoredRole(
        { guildId: "guild", userId: "user", roleId: "managed-role" },
        { guildId: "guild", userId: "user", roleId: "other-role" }
      )
    ).toThrow("Role is not bot-managed");
  });

  test("rejects dangerous permissions", () => {
    for (const permission of dangerousPermissions) {
      expect(() => assertCosmeticPermissions([permission])).toThrow("Booster roles must be cosmetic");
    }
  });

  test("rejects role positions at or above the anchor role", () => {
    expect(() => assertRolePositionIsSafe(10, 10)).toThrow("Role position is not safe");
    expect(() => assertRolePositionIsSafe(11, 10)).toThrow("Role position is not safe");
    expect(() => assertRolePositionIsSafe(9, 10)).not.toThrow();
  });

  test("validates role names and hex colors", () => {
    expect(validateRoleName("  My Booster Role  ")).toBe("My Booster Role");
    expect(() => validateRoleName("@everyone")).toThrow("Role name is not allowed");
    expect(() => validateRoleName("ab")).toThrow("Role name must be 3-32 characters");
    expect(normalizeHexColor("#aabbcc")).toBe("#AABBCC");
    expect(() => normalizeHexColor("blue")).toThrow("Color must be a hex value");
  });
});
