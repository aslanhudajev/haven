/** Align client updates with server webhook / sync-revenuecat-subscription. */
export function resolveMaxMembersForTier(tierMax: number, memberCount: number): number {
  return Math.max(tierMax, memberCount);
}
