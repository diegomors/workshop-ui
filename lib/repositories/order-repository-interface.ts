import { Order, OrderItem, OrderStatus, OrderStatusHistory, OrderWithDetails } from '@/types/order'
import { CreateOrderInput } from '@/lib/validations/order'

export interface IOrderRepository {
  createOrder(customerId: string, payload: CreateOrderInput): Promise<Order>
  transitionOrder(orderId: string, newStatus: OrderStatus, changedBy: string): Promise<Order>
  getOrder(orderId: string): Promise<OrderWithDetails | null>
  getRestaurantOrders(restaurantId: string, statuses?: OrderStatus[]): Promise<Order[]>
  getCustomerOrders(customerId: string): Promise<Order[]>
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>
}
