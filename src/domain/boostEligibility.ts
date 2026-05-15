export type BoostEligibilityInput = {
  isBoosting: boolean;
};

export function assertBoostEligibility(input: BoostEligibilityInput): void {
  if (!input.isBoosting) {
    throw new Error("User must be currently boosting to claim a custom role");
  }
}
