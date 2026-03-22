'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/index'
import { RestaurantPreview } from '@/types/restaurant'
import { getRestaurantRepository } from '@/lib/repositories/restaurant-repository'

/**
 * Fetches the restaurant ID and user profile for the current authenticated user.
 * Used in admin/staff pages.
 */
export async function getAdminContext(): Promise<{ restaurantId: string; profile: Profile } | null> {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Get restaurant ID
  // If owner, get from restaurants table
  if (profile.role === 'admin') {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    if (restaurant) return { restaurantId: restaurant.id, profile: profile as Profile }
  }

  // If staff, get from restaurant_staff table
  const { data: staff } = await supabase
    .from('restaurant_staff')
    .select('restaurant_id')
    .eq('user_id', user.id)
    .single()

  if (staff) return { restaurantId: staff.restaurant_id, profile: profile as Profile }

  return null
}

/**
 * Fetches restaurants within a radius of a given position.
 */
export async function getNearbyRestaurants(lat: number, lng: number, radiusKm?: number): Promise<RestaurantPreview[]> {
  const repo = getRestaurantRepository()
  try {
    return await repo.getNearbyRestaurants(lat, lng, radiusKm)
  } catch (error: any) {
    console.error(`[restaurant/getNearbyRestaurants] Failed:`, error.message)
    throw new Error(error.message)
  }
}

/**
 * Fetches all active restaurants. Used when GPS is disabled.
 */
export async function getAllActiveRestaurants(): Promise<RestaurantPreview[]> {
  const repo = getRestaurantRepository()
  try {
    return await repo.getAllActiveRestaurants()
  } catch (error: any) {
    console.error(`[restaurant/getAllActiveRestaurants] Failed:`, error.message)
    throw new Error(error.message)
  }
}

/**
 * Gets customer location for a specific order.
 */
export async function getOrderLocation(orderId: string): Promise<{ latitude: number | null, longitude: number | null }> {
  const repo = getRestaurantRepository()
  try {
    const data = await repo.getOrderLocation(orderId)
    if (!data) throw new Error('Order location not found')
    return data
  } catch (error: any) {
    console.error(`[restaurant/getOrderLocation] Failed for order ${orderId}:`, error.message)
    throw new Error(error.message)
  }
}

