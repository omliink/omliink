// Sprint 4d: shared "premium employers first, then distance within each
// group" comparator, used by both the candidate dashboard listing
// (CandidateDashboard.tsx) and the post-onboarding suggested-missions
// banner (getSuggestedMissionsForCandidate). Missions with an unknown
// distance always sort after ones with a known distance, within their tier.
export function comparePremiumThenDistance<T>(
  a: T,
  b: T,
  getEmployerId: (item: T) => string,
  getDistanceKm: (item: T) => number | null,
  premiumEmployerIds: ReadonlySet<string>
): number {
  const aPremium = premiumEmployerIds.has(getEmployerId(a))
  const bPremium = premiumEmployerIds.has(getEmployerId(b))
  if (aPremium !== bPremium) return aPremium ? -1 : 1

  const aDistance = getDistanceKm(a)
  const bDistance = getDistanceKm(b)
  if (aDistance == null) return bDistance == null ? 0 : 1
  if (bDistance == null) return -1
  return aDistance - bDistance
}
