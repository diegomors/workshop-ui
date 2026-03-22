import { IOrderRepository } from './order-repository-interface'
import { SupabaseOrderRepository } from './supabase-order-repository'
import { MockOrderRepository } from './mock-order-repository'

let orderRepository: IOrderRepository | null = null

export function getOrderRepository(): IOrderRepository {
  if (orderRepository) return orderRepository

  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

  if (useMocks) {
    orderRepository = new MockOrderRepository()
  } else {
    orderRepository = new SupabaseOrderRepository()
  }

  return orderRepository
}
