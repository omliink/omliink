const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Great-circle distance between two lat/lng points, in kilometers.
 * Sufficient accuracy for mission/candidate matching at this scale —
 * no need for PostGIS.
 */
export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(a))
  return EARTH_RADIUS_KM * c
}
