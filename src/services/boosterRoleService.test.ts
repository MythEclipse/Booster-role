import { describe, expect, test } from "bun:test";
import { BoosterRoleService, type BoosterRoleRecord, type RoleRepository } from "./boosterRoleService";

class MemoryRoleStore {
  private records = new Map<string, BoosterRoleRecord>();

  async findByUser(guildId: string, userId: string): Promise<BoosterRoleRecord | null> {
    return this.records.get(`${guildId}:${userId}`) ?? null;
  }

  async create(record: BoosterRoleRecord): Promise<void> {
    this.records.set(`${record.guildId}:${record.userId}`, record);
  }

  async delete(guildId: string, userId: string): Promise<void> {
    this.records.delete(`${guildId}:${userId}`);
  }
}

class FakeRoleRepository implements RoleRepository {
  roles = new Map<string, { id: string; name: string; permissions: string[]; position: number; color: string | null }>();
  deletedRoleIds: string[] = [];

  constructor(initialRoles = [{ id: "existing-vip", name: "VIP", permissions: [], position: 1, color: null }]) {
    for (const role of initialRoles) {
      this.roles.set(role.id, role);
    }
  }

  async listRoles() {
    return [...this.roles.values()];
  }

  async createRole(input: { name: string; color: string | null; permissions: string[]; position: number }) {
    const id = `created-${this.roles.size + 1}`;
    this.roles.set(id, { id, ...input });
    return { id };
  }

  async updateRole(roleId: string, input: { name?: string; color?: string | null }) {
    const role = this.roles.get(roleId);
    if (!role) throw new Error("Role does not exist");
    this.roles.set(roleId, { ...role, ...input });
  }

  async deleteRole(roleId: string) {
    this.deletedRoleIds.push(roleId);
    this.roles.delete(roleId);
  }
}

describe("BoosterRoleService", () => {
  test("eligible user claims one new cosmetic managed role", async () => {
    const store = new MemoryRoleStore();
    const roles = new FakeRoleRepository();
    const service = new BoosterRoleService(store, roles, { anchorPosition: 10 });

    const claimed = await service.claimRole({ guildId: "guild", userId: "user", name: "My Role", color: "#aabbcc", verifiedBoostCount: 2 });

    expect(claimed.roleId).toBe("created-2");
    expect(roles.roles.get(claimed.roleId)?.permissions).toEqual([]);
    expect(roles.roles.get(claimed.roleId)?.position).toBe(9);
    expect(await store.findByUser("guild", "user")).toEqual(claimed);
  });

  test("rejects claiming an existing unmanaged role name", async () => {
    const service = new BoosterRoleService(new MemoryRoleStore(), new FakeRoleRepository(), { anchorPosition: 10 });

    await expect(service.claimRole({ guildId: "guild", userId: "user", name: "vip", color: null, verifiedBoostCount: 2 })).rejects.toThrow("already used");
  });

  test("rejects duplicate claims instead of creating another role", async () => {
    const store = new MemoryRoleStore();
    const roles = new FakeRoleRepository();
    const service = new BoosterRoleService(store, roles, { anchorPosition: 10 });

    await service.claimRole({ guildId: "guild", userId: "user", name: "First Role", color: null, verifiedBoostCount: 2 });

    await expect(service.claimRole({ guildId: "guild", userId: "user", name: "Second Role", color: null, verifiedBoostCount: 2 })).rejects.toThrow("already has a booster role");
  });

  test("renames only the stored role owned by the user", async () => {
    const store = new MemoryRoleStore();
    const roles = new FakeRoleRepository([]);
    const service = new BoosterRoleService(store, roles, { anchorPosition: 10 });
    const claimed = await service.claimRole({ guildId: "guild", userId: "user", name: "First Role", color: null, verifiedBoostCount: 2 });

    await service.renameRole({ guildId: "guild", userId: "user", name: "Renamed" });

    expect(roles.roles.get(claimed.roleId)?.name).toBe("Renamed");
    await expect(service.renameRole({ guildId: "guild", userId: "attacker", name: "Stolen" })).rejects.toThrow("No booster role found");
  });

  test("removes managed role when eligibility is lost", async () => {
    const store = new MemoryRoleStore();
    const roles = new FakeRoleRepository([]);
    const service = new BoosterRoleService(store, roles, { anchorPosition: 10 });
    const claimed = await service.claimRole({ guildId: "guild", userId: "user", name: "First Role", color: null, verifiedBoostCount: 2 });

    await service.removeRoleForLostBoost({ guildId: "guild", userId: "user" });

    expect(roles.deletedRoleIds).toEqual([claimed.roleId]);
    expect(await store.findByUser("guild", "user")).toBeNull();
  });
});
