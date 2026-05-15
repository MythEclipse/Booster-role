import { describe, expect, test } from "bun:test";
import { assertBoostEligibility } from "./boostEligibility";

describe("boost eligibility", () => {
  test("allows users who are currently boosting", () => {
    expect(() => assertBoostEligibility({ isBoosting: true })).not.toThrow();
  });

  test("rejects users who are not currently boosting", () => {
    expect(() => assertBoostEligibility({ isBoosting: false })).toThrow("User must be currently boosting");
  });
});
