/**
 * Server Actions for the admin reports domain.
 * Handles read-only reports: prep time and delivery performance (last 7 days).
 */
'use server'

import { getReportRepository } from '@/lib/repositories/report-repository'
import { PrepTimeRow, DeliveryPerformanceRow } from '@/types/reports'

/**
 * Fetches average prep time per menu item for the last 7 days.
 * Prep time = CONFIRMADO → PRONTO_PARA_RETIRADA.
 * Throws on database error.
 */
export async function getPrepTimeReport(restaurantId: string): Promise<PrepTimeRow[]> {
  const repo = getReportRepository()
  try {
    return await repo.getPrepTimeReport(restaurantId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[reports/getPrepTimeReport] Failed for restaurant ${restaurantId}:`, message)
    throw new Error(message)
  }
}

/**
 * Fetches delivery performance per deliverer for the last 7 days.
 * Delivery time = PRONTO_PARA_RETIRADA → ENTREGUE.
 * Throws on database error.
 */
export async function getDeliveryPerformanceReport(restaurantId: string): Promise<DeliveryPerformanceRow[]> {
  const repo = getReportRepository()
  try {
    return await repo.getDeliveryPerformanceReport(restaurantId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[reports/getDeliveryPerformanceReport] Failed for restaurant ${restaurantId}:`, message)
    throw new Error(message)
  }
}
