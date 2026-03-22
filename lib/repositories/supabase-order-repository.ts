import { createClient } from '@/lib/supabase/server'
import { IOrderRepository } from './order-repository-interface'
import { Order, OrderStatus, OrderStatusHistory, OrderWithDetails } from '@/types/order'
import { CreateOrderInput } from '@/lib/validations/order'

export class SupabaseOrderRepository implements IOrderRepository {
  async createOrder(customerId: string, payload: CreateOrderInput): Promise<Order> {
    const supabase = await createClient()

    // 1. Calculate service fee (10%)
    const subtotal = payload.items.reduce((sum, item) => sum + item.subtotal, 0)
    const serviceFee = subtotal * 0.10
    const total = subtotal + serviceFee

    // 2. Generate delivery code (4 random digits)
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString()

    // Use a transaction (Supabase RPC or manual sequential inserts)
    // For simplicity here, we'll do sequential inserts. Production should use an RPC 'create_order_complete'.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: payload.restaurant_id,
        customer_id: customerId,
        status: 'REALIZADO',
        total,
        service_fee: serviceFee,
        delivery_code: deliveryCode,
        notes: payload.notes,
        customer_latitude: payload.customer_latitude,
        customer_longitude: payload.customer_longitude
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 3. Insert items
    const orderItems = payload.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      modifiers_json: item.modifiers,
      subtotal: item.subtotal
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // 4. Initial status history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        to_status: 'REALIZADO',
        changed_by: customerId
      })

    if (historyError) throw historyError

    return order
  }

  async transitionOrder(orderId: string, newStatus: OrderStatus, changedBy: string): Promise<Order> {
    const supabase = await createClient()

    // We do a SELECT before UPDATE to get current status (optimistic UI)
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (fetchError) throw fetchError

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .eq('status', currentOrder.status) // Optimistic update
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        throw new Error('Pedido já foi atualizado por outro usuário')
      }
      throw updateError
    }

    // Insert into history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: currentOrder.status,
        to_status: newStatus,
        changed_by: changedBy
      })

    if (historyError) throw historyError

    return updatedOrder
  }

  async getOrder(orderId: string): Promise<OrderWithDetails | null> {
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        order_status_history (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') return null
      throw orderError
    }

    return {
      ...order,
      order_items: order.order_items,
      status_history: order.order_status_history
    }
  }

  async getRestaurantOrders(restaurantId: string, statuses?: OrderStatus[]): Promise<Order[]> {
    const supabase = await createClient()

    let query = supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }
}
