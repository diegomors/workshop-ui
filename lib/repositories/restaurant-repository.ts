import { IRestaurantRepository } from '@/lib/repositories/restaurant-repository-interface'
import { SupabaseRestaurantRepository } from '@/lib/repositories/supabase-restaurant-repository'

let instance: IRestaurantRepository

/**
 * Factory for the restaurant repository.
 * Always returns the Supabase implementation.
 */
export function getRestaurantRepository(): IRestaurantRepository {
  if (!instance) {
    instance = new SupabaseRestaurantRepository()
  }
  return instance
}
