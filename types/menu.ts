export type Category = {
  id: string
  restaurant_id: string
  name: string
  sort_order: number
  created_at: string
}

export type Modifier = {
  id: string
  menu_item_id: string
  name: string
  additional_price: number
  created_at: string
}

export type MenuItem = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  modifiers?: Modifier[]
}

export type MenuData = {
  restaurant: { id: string, name: string }
  categories: (Category & {
    menu_items: MenuItem[]
  })[]
}

export type CartModifier = {
  id: string
  name: string
  additional_price: number
}

export type CartItem = {
  id: string // unique combination id
  itemId: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  modifiers: CartModifier[]
  restaurantId: string
}
