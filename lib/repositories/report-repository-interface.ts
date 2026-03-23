import { PrepTimeRow, DeliveryPerformanceRow } from '@/types/reports'

export interface IReportRepository {
  getPrepTimeReport(restaurantId: string): Promise<PrepTimeRow[]>
  getDeliveryPerformanceReport(restaurantId: string): Promise<DeliveryPerformanceRow[]>
}
