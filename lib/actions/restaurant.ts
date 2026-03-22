'use server'

import { createClient } from '@/lib/supabase/server'
import { getMenuRepository } from '@/lib/repositories/menu-repository'
import { Profile } from '@/types/index'
import { MOCK_RESTAURANT_ID } from '@/lib/mock-data'

/**
 * Fetches the restaurant ID and user profile for the current authenticated user.
 * Used in admin/staff pages.
 */
export async function getAdminContext(): Promise<{ restaurantId: string; profile: Profile } | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
    return {
      restaurantId: MOCK_RESTAURANT_ID,
      profile: {
        id: 'mock-admin-id',
        role: 'admin',
        name: 'Admin Mock',
        phone: '11999999999',
        avatar_url: null,
        created_at: new Date().toISOString()
      }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Get restaurant ID
  // If owner, get from restaurants table
  if (profile.role === 'admin') {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    if (restaurant) return { restaurantId: restaurant.id, profile: profile as Profile }
  }

  // If staff, get from restaurant_staff table
  const { data: staff } = await supabase
    .from('restaurant_staff')
    .select('restaurant_id')
    .eq('user_id', user.id)
    .single()

  if (staff) return { restaurantId: staff.restaurant_id, profile: profile as Profile }

  return null
}
