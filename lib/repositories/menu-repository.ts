import { IMenuRepository } from './menu-repository-interface'
import { SupabaseMenuRepository } from './supabase-menu-repository'

let instance: IMenuRepository

/**
 * Factory for the menu repository.
 * Always returns the Supabase implementation.
 */
export function getMenuRepository(): IMenuRepository {
  if (!instance) {
    instance = new SupabaseMenuRepository()
  }
  return instance
}
