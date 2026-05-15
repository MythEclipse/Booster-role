import { describe, expect, test } from "bun:test";
import { assertBoostEligibility } from "./boostEligibility";

describe("boost eligibility", () => {
  test("allows users with at least two verified boosts", () => {
    expect(() => assertBoostEligibility({ verifiedBoostCount: 2 })).not.toThrow();
    expect(() => assertBoostEligibility({ verifiedBoostCount: 3 })).not.toThrow();
  });

  test("rejects users below two verified boosts", () => {
    expect(() => assertBoostEligibility({ verifiedBoostCount: 1 })).toThrow("two server boosts");
    expect(() => assertBoostEligibility({ verifiedBoostCount: 0 })).toThrow("two server boosts");
  });

  test("fails closed when boost count is not verifiable", () => {
    expect(() => assertBoostEligibility({ verifiedBoostCount: null })).toThrow("Boost eligibility cannot be verified");
  });
});
