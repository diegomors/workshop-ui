import { IMenuRepository } from './menu-repository-interface'
import { SupabaseMenuRepository } from './supabase-menu-repository'
import { MockMenuRepository } from './mock-menu-repository'

let instance: IMenuRepository

export function getMenuRepository(): IMenuRepository {
  if (instance) return instance

  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
  
  if (useMocks) {
    console.log('[MenuRepository] Using Mock Implementation')
    instance = new MockMenuRepository()
  } else {
    instance = new SupabaseMenuRepository()
  }
  
  return instance
}
