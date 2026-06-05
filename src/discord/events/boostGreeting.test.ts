import { describe, expect, test } from "bun:test";
import { sendBoostGreeting } from "./boostGreeting";

describe("sendBoostGreeting", () => {
  test("sends boost greeting to the given channel", async () => {
    const sent: string[] = [];
    const channel = {
      send: async (input: { content: string }): Promise<void> => {
        sent.push(input.content);
      },
    };

    await sendBoostGreeting(channel, "user-123", "channel-456");

    expect(sent.length).toBe(1);
    expect(sent[0]).toContain("<@user-123>");
    expect(sent[0]).toContain("/booster-role claim");
    expect(sent[0]).toContain("di sini");
  });

  test("handles different user and channel IDs", async () => {
    const sent: string[] = [];
    const channel = {
      send: async (input: { content: string }): Promise<void> => {
        sent.push(input.content);
      },
    };

    await sendBoostGreeting(channel, "other-user", "other-channel");

    expect(sent[0]).toContain("<@other-user>");
    expect(sent[0]).toContain("di sini");
  });
});
