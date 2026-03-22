import { createClient } from '@/lib/supabase/server'
import { IRestaurantRepository } from './restaurant-repository-interface'
import { RestaurantPreview } from '@/types/restaurant'
import { calculateDistance } from '@/lib/geo'

export class SupabaseRestaurantRepository implements IRestaurantRepository {
  async getAllActiveRestaurants(): Promise<RestaurantPreview[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, description, logo_url, latitude, longitude, coverage_radius_km')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) throw error
    return data as RestaurantPreview[]
  }

  async getNearbyRestaurants(lat: number, lng: number, radiusKm: number = 2.0): Promise<RestaurantPreview[]> {
    // Note: PostGIS is not used for simplicity. We fetch all active restaurants and filter on server (Bounding Box) or client.
    // For MVP we fetch all and filter in memory since we expect few restaurants initially.
    const all = await this.getAllActiveRestaurants()
    
    return all.filter(restaurant => {
      if (restaurant.latitude === null || restaurant.longitude === null) return false
      const distance = calculateDistance({ lat, lng }, { lat: restaurant.latitude!, lng: restaurant.longitude! })
      return distance <= (restaurant.coverage_radius_km || radiusKm)
    })
  }

  async getOrderLocation(orderId: string): Promise<{ latitude: number | null, longitude: number | null } | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('customer_latitude, customer_longitude')
      .eq('id', orderId)
      .single()

    if (error) throw error
    if (!data) return null
    
    return {
      latitude: data.customer_latitude,
      longitude: data.customer_longitude
    }
  }
}
