import { IOrderRepository } from './order-repository-interface'
import { Order, OrderStatus, OrderStatusHistory, OrderWithDetails } from '@/types/order'
import { CreateOrderInput } from '@/lib/validations/order'
import { MOCK_RESTAURANT_ID } from '@/lib/mock-data'

export class MockOrderRepository implements IOrderRepository {
  private orders: Order[] = [
    {
      id: 'mock-order-1',
      restaurant_id: MOCK_RESTAURANT_ID,
      customer_id: 'mock-customer-id',
      status: 'REALIZADO',
      total: 45.00,
      service_fee: 4.50,
      delivery_code: '1234',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    },
    {
      id: 'mock-order-2',
      restaurant_id: MOCK_RESTAURANT_ID,
      customer_id: 'mock-customer-id',
      status: 'CONFIRMADO',
      total: 32.50,
      service_fee: 3.25,
      delivery_code: '5678',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    }
  ]
  private items: any[] = [
    {
      id: 'item-1',
      order_id: 'mock-order-1',
      menu_item_id: 'mi-1',
      quantity: 1,
      unit_price: 40.50,
      modifiers_json: [],
      subtotal: 40.50,
      created_at: new Date().toISOString()
    }
  ]
  private histories: OrderStatusHistory[] = [
    {
      id: 'h1',
      order_id: 'mock-order-1',
      from_status: null,
      to_status: 'REALIZADO',
      changed_by: 'mock-customer-id',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    },
    {
      id: 'h2',
      order_id: 'mock-order-2',
      from_status: null,
      to_status: 'REALIZADO',
      changed_by: 'mock-customer-id',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'h3',
      order_id: 'mock-order-2',
      from_status: 'REALIZADO',
      to_status: 'CONFIRMADO',
      changed_by: 'mock-admin-id',
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    }
  ]

  async createOrder(customerId: string, payload: CreateOrderInput): Promise<Order> {
    const subtotal = payload.items.reduce((sum, item) => sum + item.subtotal, 0)
    const serviceFee = subtotal * 0.10
    const total = subtotal + serviceFee
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString()

    const order: Order = {
      id: crypto.randomUUID(),
      restaurant_id: payload.restaurant_id,
      customer_id: customerId,
      status: 'REALIZADO',
      total,
      service_fee: serviceFee,
      delivery_code: deliveryCode,
      notes: payload.notes,
      customer_latitude: payload.customer_latitude,
      customer_longitude: payload.customer_longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.orders.push(order)

    payload.items.forEach(item => {
      this.items.push({
        id: crypto.randomUUID(),
        order_id: order.id,
        ...item,
        created_at: new Date().toISOString()
      })
    })

    this.histories.push({
      id: crypto.randomUUID(),
      order_id: order.id,
      from_status: null,
      to_status: 'REALIZADO',
      changed_by: customerId,
      created_at: new Date().toISOString()
    })

    return order
  }

  async transitionOrder(orderId: string, newStatus: OrderStatus, changedBy: string): Promise<Order> {
    const orderIndex = this.orders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) throw new Error('Pedido não encontrado')

    const currentOrder = this.orders[orderIndex]
    const fromStatus = currentOrder.status

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    this.orders[orderIndex] = updatedOrder

    this.histories.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      from_status: fromStatus,
      to_status: newStatus,
      changed_by: changedBy,
      created_at: new Date().toISOString()
    })

    return updatedOrder
  }

  async getOrder(orderId: string): Promise<OrderWithDetails | null> {
    const order = this.orders.find(o => o.id === orderId)
    if (!order) return null

    return {
      ...order,
      order_items: this.items.filter(i => i.order_id === orderId),
      status_history: this.histories.filter(h => h.order_id === orderId)
    }
  }

  async getRestaurantOrders(restaurantId: string, statuses?: OrderStatus[]): Promise<Order[]> {
    let result = this.orders.filter(o => o.restaurant_id === restaurantId)
    if (statuses && statuses.length > 0) {
      result = result.filter(o => statuses.includes(o.status))
    }
    return result.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.orders
      .filter(o => o.customer_id === customerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.histories
      .filter(h => h.order_id === orderId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }
}
