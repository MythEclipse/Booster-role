import { MessageFlags, PermissionFlagsBits } from "discord.js";
import { describe, expect, test } from "bun:test";
import { handleInteraction, type BoosterRoleCommandService, type ChatInputInteractionLike } from "./interactionHandler";

type Reply = { content: string; flags: MessageFlags.Ephemeral };

class FakeInteraction implements ChatInputInteractionLike {
  commandName = "booster-role";
  user = { id: "user" };
  guildId: string | null = "guild";
  memberPermissions: { has(permission: bigint): boolean } | null = null;
  replies: Reply[] = [];

  constructor(private readonly subcommand: string, private readonly values: Record<string, unknown> = {}) {}

  isChatInputCommand(): boolean {
    return true;
  }

  async reply(reply: Reply): Promise<void> {
    this.replies.push(reply);
  }

  options = {
    getSubcommand: () => this.subcommand,
    getString: (name: string) => (this.values[name] as string | null) ?? null,
    getUser: (name: string) => (this.values[name] as { id: string } | null) ?? null,
    getAttachment: (name: string) => (this.values[name] as { contentType: string | null; size: number; url: string } | null) ?? null
  };
}

class FakeService implements BoosterRoleCommandService {
  calls: string[] = [];

  async claimRole(): Promise<{ roleId: string }> {
    this.calls.push("claim");
    return { roleId: "role-1" };
  }

  async renameRole(): Promise<void> {
    this.calls.push("rename");
  }

  async recolorRole(): Promise<void> {
    this.calls.push("recolor");
  }

  async setRoleIcon(): Promise<void> {
    this.calls.push("icon");
  }

  async deleteRole(input?: { userId: string }): Promise<void> {
    this.calls.push(input?.userId ? `delete:${input.userId}` : "delete");
  }
}

describe("handleInteraction", () => {
  test("replies to claim command", async () => {
    const interaction = new FakeInteraction("claim", { name: "Test", color: "#AABBCC" });
    const service = new FakeService();

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(service.calls).toEqual(["claim"]);
    expect(interaction.replies[0]).toEqual({ content: "Booster role created: <@&role-1>", flags: MessageFlags.Ephemeral });
  });

  test("routes update subcommands and replies", async () => {
    for (const subcommand of ["rename", "recolor", "icon"]) {
      const interaction = new FakeInteraction(subcommand, { name: "Test", color: "#AABBCC", image: { contentType: "image/png", size: 100, url: "https://cdn.discordapp.com/icon.png" } });
      const service = new FakeService();

      await handleInteraction(interaction, service, { isBoosting: async () => true });

      expect(service.calls).toEqual([subcommand]);
      expect(interaction.replies[0]?.flags).toBe(MessageFlags.Ephemeral);
    }
  });

  test("routes own delete command", async () => {
    const interaction = new FakeInteraction("delete");
    const service = new FakeService();

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(service.calls).toEqual(["delete:user"]);
    expect(interaction.replies[0]).toEqual({ content: "Booster role deleted.", flags: MessageFlags.Ephemeral });
  });

  test("routes admin delete command for target user", async () => {
    const interaction = new FakeInteraction("admin-delete", { user: { id: "target-user" } });
    interaction.memberPermissions = { has: (permission) => permission === PermissionFlagsBits.Administrator };
    const service = new FakeService();

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(service.calls).toEqual(["delete:target-user"]);
    expect(interaction.replies[0]).toEqual({ content: "Booster role deleted by admin.", flags: MessageFlags.Ephemeral });
  });

  test("rejects admin delete without Administrator permission", async () => {
    const interaction = new FakeInteraction("admin-delete", { user: { id: "target-user" } });
    interaction.memberPermissions = { has: () => false };
    const service = new FakeService();

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(service.calls).toEqual([]);
    expect(interaction.replies[0]).toEqual({ content: "Administrator permission is required", flags: MessageFlags.Ephemeral });
  });

  test("turns service errors into private replies", async () => {
    const interaction = new FakeInteraction("claim", { name: "VIP" });
    const service = new FakeService();
    service.claimRole = async () => {
      throw new Error("Role name is already used");
    };

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(interaction.replies[0]).toEqual({ content: "Role name is already used", flags: MessageFlags.Ephemeral });
  });

  test("hides failed query details from user replies", async () => {
    const interaction = new FakeInteraction("claim", { name: "VIP" });
    const service = new FakeService();
    service.claimRole = async () => {
      throw new Error("Failed query: insert into booster_roles params: secret");
    };

    await handleInteraction(interaction, service, { isBoosting: async () => true });

    expect(interaction.replies[0]).toEqual({ content: "Failed to save booster role. Any created role was cleaned up. Try again.", flags: MessageFlags.Ephemeral });
  });
});
