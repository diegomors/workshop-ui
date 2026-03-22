/**
 * Utility functions for geo-spatial calculations.
 * Uses the Haversine formula to compute distance between two points on Earth.
 */

export type Coordinates = {
  lat: number
  lng: number
}

/**
 * Calculates the distance between two points in kilometers.
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180)
  const dLon = (point2.lng - point1.lng) * (Math.PI / 180)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) * 
    Math.cos(point2.lat * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Formats a distance value to meters or kilometers.
 * If < 1km, format as meters. If >= 1km, format as km with 1 decimal.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000)
    return `${meters}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/**
 * Checks if a point is within a given radius (in km) from another point.
 */
export function isWithinRadius(center: Coordinates, point: Coordinates, radiusKm: number): boolean {
  const distance = calculateDistance(center, point)
  return distance <= radiusKm
}
