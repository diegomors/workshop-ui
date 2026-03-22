export type Restaurant = {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  coverage_radius_km: number
  stripe_account_id: string | null
  created_at: string
}

export type RestaurantPreview = Pick<Restaurant, 'id' | 'name' | 'description' | 'logo_url' | 'latitude' | 'longitude' | 'coverage_radius_km'>
