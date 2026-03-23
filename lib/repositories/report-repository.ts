import { IReportRepository } from './report-repository-interface'
import { SupabaseReportRepository } from './supabase-report-repository'

let reportRepository: IReportRepository | null = null

/**
 * Factory for the report repository.
 * Always returns the Supabase implementation.
 */
export function getReportRepository(): IReportRepository {
  if (!reportRepository) {
    reportRepository = new SupabaseReportRepository()
  }
  return reportRepository
}
