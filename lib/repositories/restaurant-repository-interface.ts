import { RestaurantPreview } from '@/types/restaurant'

export interface IRestaurantRepository {
  /**
   * Fetches all active restaurants.
   */
  getAllActiveRestaurants(): Promise<RestaurantPreview[]>

  /**
   * Fetches restaurants within a given radius using the Haversine formula.
   */
  getNearbyRestaurants(lat: number, lng: number, radiusKm?: number): Promise<RestaurantPreview[]>

  /**
   * Fetches the location of the customer for a specific order.
   */
  getOrderLocation(orderId: string): Promise<{ latitude: number | null, longitude: number | null } | null>
}
