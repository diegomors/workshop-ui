import { IOrderRepository } from './order-repository-interface'
import { SupabaseOrderRepository } from './supabase-order-repository'

let orderRepository: IOrderRepository | null = null

/**
 * Factory for the order repository.
 * Always returns the Supabase implementation.
 */
export function getOrderRepository(): IOrderRepository {
  if (!orderRepository) {
    orderRepository = new SupabaseOrderRepository()
  }
  return orderRepository
}
