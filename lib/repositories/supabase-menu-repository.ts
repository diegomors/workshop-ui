import { createClient } from '@/lib/supabase/server'
import { Category, MenuData, MenuItem } from '@/types/menu'
import { MenuItemInput } from '@/lib/validations/menu'
import { IMenuRepository } from './menu-repository-interface'

export class SupabaseMenuRepository implements IMenuRepository {
  async getCategories(restaurantId: string): Promise<Category[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  async createCategory(restaurantId: string, name: string): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert([{ restaurant_id: restaurantId, name }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async deleteCategory(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async reorderCategories(restaurantId: string, orderedIds: string[]): Promise<void> {
    const supabase = await createClient()
    const updates = orderedIds.map((id, index) => ({
      id,
      restaurant_id: restaurantId,
      sort_order: index
    }))

    const { error } = await supabase.from('categories').upsert(updates)
    if (error) throw new Error(error.message)
  }

  async getMenuItems(categoryId: string): Promise<MenuItem[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        modifiers (*)
      `)
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(error.message)
    return data as MenuItem[]
  }

  async createMenuItem(payload: MenuItemInput): Promise<MenuItem> {
    const supabase = await createClient()
    const { modifiers, ...itemData } = payload

    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .insert([itemData])
      .select()
      .single()

    if (itemError) throw new Error(itemError.message)

    if (modifiers && modifiers.length > 0) {
      const modsToInsert = modifiers.map(mod => ({
        menu_item_id: item.id,
        name: mod.name,
        additional_price: mod.additional_price
      }))
      const { error: modError } = await supabase.from('modifiers').insert(modsToInsert)
      if (modError) throw new Error(modError.message)
    }

    return item
  }

  async updateMenuItem(id: string, payload: MenuItemInput): Promise<MenuItem> {
    const supabase = await createClient()
    const { modifiers, category_id, ...itemData } = payload

    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single()

    if (itemError) throw new Error(itemError.message)

    if (modifiers !== undefined) {
      await supabase.from('modifiers').delete().eq('menu_item_id', id)
      if (modifiers.length > 0) {
        const modsToInsert = modifiers.map(mod => ({
          menu_item_id: id,
          name: mod.name,
          additional_price: mod.additional_price
        }))
        const { error: modError } = await supabase.from('modifiers').insert(modsToInsert)
        if (modError) throw new Error(modError.message)
      }
    }

    return item
  }

  async toggleMenuItemActive(id: string, isActive: boolean): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('menu_items')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async deleteMenuItem(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async reorderMenuItems(categoryId: string, orderedIds: string[]): Promise<void> {
    const supabase = await createClient()
    const updates = orderedIds.map((id, index) => ({
      id,
      category_id: categoryId,
      sort_order: index
    }))

    const { error } = await supabase.from('menu_items').upsert(updates)
    if (error) throw new Error(error.message)
  }

  async getRestaurantMenu(restaurantId: string): Promise<MenuData> {
    const supabase = await createClient()
    const { data: restaurant, error: rError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single()

    if (rError) throw new Error('Restaurante não encontrado')

    const { data: categories, error: cError } = await supabase
      .from('categories')
      .select(`
        id, restaurant_id, name, sort_order, created_at,
        menu_items (
          id, category_id, name, description, price, image_url, is_active, sort_order, created_at,
          modifiers ( id, menu_item_id, name, additional_price, created_at )
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })

    if (cError) throw new Error(cError.message)

    const filteredCategories = (categories as (Category & { menu_items: MenuItem[] })[])
      .map((cat) => ({
        ...cat,
        menu_items: (cat.menu_items || [])
          .filter((item) => item.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
      }))
      .filter((cat) => cat.menu_items.length > 0)

    return {
      restaurant,
      categories: filteredCategories
    }
  }

  async getRestaurants(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, description')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  async getRestaurantByOwner(ownerId: string): Promise<{ id: string } | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', ownerId)
      .single()

    if (error) return null
    return data
  }
}
