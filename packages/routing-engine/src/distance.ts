/**
 * Spatial calculation utilities using Haversine formula.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two geographic coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 1000) / 1000; // rounded to meters in km
}

/**
 * Estimated minimum time in minutes to travel between two coordinates assuming maximum highway speed (120 km/h).
 * Used as an admissible heuristic for A* travel time optimization.
 */
export function estimateAdmissibleTravelTimeMin(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxSpeedKmH: number = 120
): number {
  const distKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  return (distKm / maxSpeedKmH) * 60;
}
