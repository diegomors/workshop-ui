/**
 * Server Actions for the order domain.
 * Handles order creation, status transitions, and queries.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { getOrderRepository } from '@/lib/repositories/order-repository'
import { createOrderSchema, transitionOrderSchema, CreateOrderInput, TransitionOrderInput } from '@/lib/validations/order'
import { validateOrderTransition } from '@/lib/order-machine'
import { Order, OrderStatus, OrderWithDetails, OrderStatusHistory } from '@/types/order'
import { revalidatePath } from 'next/cache'
import { refundPayment } from '@/lib/actions/payment'

type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }
  | { success: true; error?: never }

/**
 * Creates a new order. Called during checkout.
 */
export async function createOrder(payload: CreateOrderInput): Promise<ActionResult<Order>> {
  try {
    const validated = createOrderSchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const repo = getOrderRepository()
    const order = await repo.createOrder(user.id, validated.data)

    revalidatePath('/orders')
    revalidatePath('/admin/orders')

    return { data: order }
  } catch (error: any) {
    console.error('[order/createOrder] Failed:', error.message)
    return { error: error.message }
  }
}

/**
 * Changes order state after validation.
 */
export async function transitionOrder(payload: TransitionOrderInput): Promise<ActionResult<Order>> {
  try {
    const validated = transitionOrderSchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let userId: string
    let role: string

    if (!user) return { error: 'Não autorizado' }
    userId = user.id
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile) return { error: 'Perfil não encontrado' }
    role = profile.role

    const repo = getOrderRepository()
    const currentOrder = await repo.getOrder(validated.data.order_id)
    if (!currentOrder) return { error: 'Pedido não encontrado' }

    // Validate transition
    const validation = validateOrderTransition(
      currentOrder.status,
      validated.data.new_status,
      role as any
    )

    if (!validation.isValid) {
      return { error: validation.error || 'Transição inválida' }
    }

    const updatedOrder = await repo.transitionOrder(
      validated.data.order_id,
      validated.data.new_status,
      userId
    )

    // PRD-05 US-05.5: Refund on cancellation
    if (validated.data.new_status === 'CANCELADO' && currentOrder.payment_intent_id) {
      const refundResult = await refundPayment(currentOrder.payment_intent_id)
      if (refundResult.error) {
        console.error('[order/transitionOrder] Refund failed (manual reconciliation needed):', refundResult.error)
      }
    }

    revalidatePath(`/orders/${validated.data.order_id}`)
    revalidatePath('/orders')
    revalidatePath('/admin/orders')

    return { data: updatedOrder }
  } catch (error: any) {
    console.error('[order/transitionOrder] Failed:', error.message)
    return { error: error.message }
  }
}

/**
 * Fetches order details including items and history.
 */
export async function getOrder(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const repo = getOrderRepository()
    return await repo.getOrder(orderId)
  } catch (error) {
    console.error('[order/getOrder] Failed:', error)
    return null
  }
}

/**
 * Fetches all orders for a restaurant.
 */
export async function getRestaurantOrders(restaurantId: string, statuses?: OrderStatus[]): Promise<Order[]> {
  try {
    const repo = getOrderRepository()
    return await repo.getRestaurantOrders(restaurantId, statuses)
  } catch (error) {
    console.error('[order/getRestaurantOrders] Failed:', error)
    return []
  }
}

/**
 * Fetches current customer's orders.
 */
export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const customerId = user.id

    const repo = getOrderRepository()
    return await repo.getCustomerOrders(customerId)
  } catch (error) {
    console.error('[order/getCustomerOrders] Failed:', error)
    return []
  }
}

/**
 * Fetches status history for an order.
 */
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
  try {
    const repo = getOrderRepository()
    return await repo.getOrderStatusHistory(orderId)
  } catch (error) {
    console.error('[order/getOrderStatusHistory] Failed:', error)
    return []
  }
}
