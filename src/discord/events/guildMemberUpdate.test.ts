import { describe, expect, test } from "bun:test";
import { handleGuildMemberUpdate } from "./guildMemberUpdate";

class FakeService {
  removed: Array<{ guildId: string; userId: string }> = [];

  async removeRoleForLostBoost(input: { guildId: string; userId: string }): Promise<void> {
    this.removed.push(input);
  }
}

function member(hasRole: boolean) {
  return {
    id: "user",
    guild: { id: "guild" },
    roles: { cache: { has: (roleId: string) => roleId === "booster-role" && hasRole } }
  };
}

describe("handleGuildMemberUpdate", () => {
  test("removes custom role when booster eligibility role is removed", async () => {
    const service = new FakeService();

    await handleGuildMemberUpdate(member(true), member(false), service, "booster-role");

    expect(service.removed).toEqual([{ guildId: "guild", userId: "user" }]);
  });

  test("does nothing while booster eligibility role remains", async () => {
    const service = new FakeService();

    await handleGuildMemberUpdate(member(true), member(true), service, "booster-role");

    expect(service.removed).toEqual([]);
  });
});
