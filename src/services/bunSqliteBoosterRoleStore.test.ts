import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { BunSqliteBoosterRoleStore } from "./bunSqliteBoosterRoleStore";

describe("BunSqliteBoosterRoleStore", () => {
  test("creates schema and stores booster role records", async () => {
    const db = new Database(":memory:");
    const store = new BunSqliteBoosterRoleStore(db);
    const record = {
      guildId: "guild",
      userId: "user",
      roleId: "role",
      name: "Test Role",
      color: "#AABBCC",
      icon: null,
      createdAt: 1,
      updatedAt: 1
    };

    await store.create(record);

    expect(await store.findByUser("guild", "user")).toEqual(record);
    await store.delete("guild", "user");
    expect(await store.findByUser("guild", "user")).toBeNull();
  });
});
