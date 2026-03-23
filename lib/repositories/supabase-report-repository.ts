import { createClient } from '@/lib/supabase/server'
import { IReportRepository } from './report-repository-interface'
import { PrepTimeRow, DeliveryPerformanceRow } from '@/types/reports'

export class SupabaseReportRepository implements IReportRepository {
  /**
   * Fetches average prep time per menu item for the last 7 days.
   * Prep time = CONFIRMADO → PRONTO_PARA_RETIRADA.
   */
  async getPrepTimeReport(restaurantId: string): Promise<PrepTimeRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_prep_time_report', {
      p_restaurant_id: restaurantId,
    })

    if (error) {
      // Fallback: manual query if RPC not available
      console.error('[report/getPrepTimeReport] RPC failed, using fallback query:', error.message)
      return this.getPrepTimeReportFallback(restaurantId)
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      itemName: row.item_name as string,
      totalOrders: Number(row.total_orders),
      avgPrepTimeMin: Number(row.avg_prep_time_min),
    }))
  }

  /**
   * Fetches delivery performance per deliverer for the last 7 days.
   * Delivery time = PRONTO_PARA_RETIRADA → ENTREGUE.
   */
  async getDeliveryPerformanceReport(restaurantId: string): Promise<DeliveryPerformanceRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_delivery_performance_report', {
      p_restaurant_id: restaurantId,
    })

    if (error) {
      console.error('[report/getDeliveryPerformanceReport] RPC failed, using fallback query:', error.message)
      return this.getDeliveryPerformanceReportFallback(restaurantId)
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      delivererName: row.deliverer_name as string,
      totalDeliveries: Number(row.total_deliveries),
      avgDeliveryTimeMin: Number(row.avg_delivery_time_min),
    }))
  }

  /**
   * Fallback query for prep time report using manual joins.
   */
  private async getPrepTimeReportFallback(restaurantId: string): Promise<PrepTimeRow[]> {
    const supabase = await createClient()

    // Get orders for this restaurant in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (ordersError) throw ordersError
    if (!orders || orders.length === 0) return []

    const orderIds = orders.map(o => o.id)

    // Get CONFIRMADO and PRONTO_PARA_RETIRADA transitions
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('order_id, to_status, created_at')
      .in('order_id', orderIds)
      .in('to_status', ['CONFIRMADO', 'PRONTO_PARA_RETIRADA'])

    if (historyError) throw historyError
    if (!history) return []

    // Build map of order_id -> { confirmed_at, ready_at }
    const orderTimes = new Map<string, { confirmed_at?: string; ready_at?: string }>()
    for (const h of history) {
      const entry = orderTimes.get(h.order_id) ?? {}
      if (h.to_status === 'CONFIRMADO') entry.confirmed_at = h.created_at
      if (h.to_status === 'PRONTO_PARA_RETIRADA') entry.ready_at = h.created_at
      orderTimes.set(h.order_id, entry)
    }

    // Filter orders that have both transitions
    const validOrderIds = Array.from(orderTimes.entries())
      .filter(([, times]) => times.confirmed_at && times.ready_at)
      .map(([id]) => id)

    if (validOrderIds.length === 0) return []

    // Get order items with menu item names
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('order_id, menu_item_id, menu_items(name)')
      .in('order_id', validOrderIds)

    if (itemsError) throw itemsError
    if (!orderItems) return []

    // Calculate avg prep time per menu item
    const itemStats = new Map<string, { name: string; totalTime: number; count: number }>()

    for (const oi of orderItems) {
      const times = orderTimes.get(oi.order_id)
      if (!times?.confirmed_at || !times?.ready_at) continue

      const prepTimeMin = (new Date(times.ready_at).getTime() - new Date(times.confirmed_at).getTime()) / 60000
      const menuItem = oi.menu_items as unknown as { name: string } | null
      const itemName = menuItem?.name ?? 'Desconhecido'
      const itemId = oi.menu_item_id

      const stat = itemStats.get(itemId) ?? { name: itemName, totalTime: 0, count: 0 }
      stat.totalTime += prepTimeMin
      stat.count += 1
      itemStats.set(itemId, stat)
    }

    return Array.from(itemStats.values())
      .map(stat => ({
        itemName: stat.name,
        totalOrders: stat.count,
        avgPrepTimeMin: Math.round(stat.totalTime / stat.count * 10) / 10,
      }))
      .sort((a, b) => b.avgPrepTimeMin - a.avgPrepTimeMin)
  }

  /**
   * Fallback query for delivery performance report using manual joins.
   */
  private async getDeliveryPerformanceReportFallback(restaurantId: string): Promise<DeliveryPerformanceRow[]> {
    const supabase = await createClient()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (ordersError) throw ordersError
    if (!orders || orders.length === 0) return []

    const orderIds = orders.map(o => o.id)

    // Get PRONTO_PARA_RETIRADA and ENTREGUE transitions
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('order_id, to_status, changed_by, created_at')
      .in('order_id', orderIds)
      .in('to_status', ['PRONTO_PARA_RETIRADA', 'ENTREGUE'])

    if (historyError) throw historyError
    if (!history) return []

    // Build map of order_id -> { ready_at, delivered_at, delivered_by }
    const orderTimes = new Map<string, { ready_at?: string; delivered_at?: string; delivered_by?: string }>()
    for (const h of history) {
      const entry = orderTimes.get(h.order_id) ?? {}
      if (h.to_status === 'PRONTO_PARA_RETIRADA') entry.ready_at = h.created_at
      if (h.to_status === 'ENTREGUE') {
        entry.delivered_at = h.created_at
        entry.delivered_by = h.changed_by
      }
      orderTimes.set(h.order_id, entry)
    }

    // Group by deliverer
    const delivererStats = new Map<string, { totalTime: number; count: number }>()
    const delivererIds = new Set<string>()

    for (const [, times] of orderTimes) {
      if (!times.ready_at || !times.delivered_at || !times.delivered_by) continue
      const deliveryTimeMin = (new Date(times.delivered_at).getTime() - new Date(times.ready_at).getTime()) / 60000
      delivererIds.add(times.delivered_by)

      const stat = delivererStats.get(times.delivered_by) ?? { totalTime: 0, count: 0 }
      stat.totalTime += deliveryTimeMin
      stat.count += 1
      delivererStats.set(times.delivered_by, stat)
    }

    if (delivererIds.size === 0) return []

    // Get deliverer names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', Array.from(delivererIds))

    if (profilesError) throw profilesError

    const nameMap = new Map<string, string>()
    for (const p of profiles ?? []) {
      nameMap.set(p.id, p.name ?? 'Desconhecido')
    }

    return Array.from(delivererStats.entries())
      .map(([id, stat]) => ({
        delivererName: nameMap.get(id) ?? 'Desconhecido',
        totalDeliveries: stat.count,
        avgDeliveryTimeMin: Math.round(stat.totalTime / stat.count * 10) / 10,
      }))
      .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
  }
}
