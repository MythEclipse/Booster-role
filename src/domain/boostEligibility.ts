export type BoostEligibilityInput = {
  verifiedBoostCount: number | null;
};

export function assertBoostEligibility(input: BoostEligibilityInput): void {
  if (input.verifiedBoostCount === null) {
    throw new Error("Boost eligibility cannot be verified");
  }

  if (input.verifiedBoostCount < 2) {
    throw new Error("User must have at least two server boosts to claim a custom role");
  }
}
