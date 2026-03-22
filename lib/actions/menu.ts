'use server'

/**
 * Server Actions for the digital menu domain.
 * Handles CRUD for categories, menu items, and modifiers.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { categorySchema, menuItemSchema, MenuItemInput } from '@/lib/validations/menu'
import { Category, MenuData, MenuItem } from '@/types/menu'

/**
 * Fetches all categories for a restaurant, ordered by sort_order.
 * Throws on database error.
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`[menu/getCategories] Failed for restaurant ${restaurantId}:`, error.message)
    throw new Error(error.message)
  }
  return data
}

/**
 * Creates a new category for a restaurant.
 */
export async function createCategory(restaurantId: string, name: string) {
  const validation = categorySchema.safeParse({ name, restaurant_id: restaurantId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .insert([{ restaurant_id: restaurantId, name }])
    .select()
    .single()

  if (error) {
    console.error(`[menu/createCategory] Failed for restaurant ${restaurantId}:`, error.message)
    return { error: error.message }
  }
  revalidatePath('/admin/menu')
  return { data }
}

/**
 * Updates an existing category name.
 */
export async function updateCategory(id: string, name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`[menu/updateCategory] Failed for category ${id}:`, error.message)
    return { error: error.message }
  }
  revalidatePath('/admin/menu')
  return { data }
}

/**
 * Deletes a category.
 */
export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    console.error(`[menu/deleteCategory] Failed for category ${id}:`, error.message)
    return { error: error.message }
  }
  revalidatePath('/admin/menu')
  return { success: true }
}

/**
 * Reorders categories for a restaurant.
 */
export async function reorderCategories(restaurantId: string, orderedIds: string[]) {
  const supabase = await createClient()
  const updates = orderedIds.map((id, index) => ({
    id,
    restaurant_id: restaurantId,
    sort_order: index
  }))

  const { error } = await supabase.from('categories').upsert(updates)
  if (error) {
    console.error(`[menu/reorderCategories] Failed for restaurant ${restaurantId}:`, error.message)
    return { error: error.message }
  }
  revalidatePath('/admin/menu')
  return { success: true }
}

/**
 * Fetches all menu items for a category.
 */
export async function getMenuItems(categoryId: string): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      modifiers (*)
    `)
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`[menu/getMenuItems] Failed for category ${categoryId}:`, error.message)
    throw new Error(error.message)
  }
  return data as MenuItem[]
}

/**
 * Creates a new menu item with modifiers.
 */
export async function createMenuItem(payload: MenuItemInput) {
  const validation = menuItemSchema.safeParse(payload)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { modifiers, ...itemData } = validation.data

  const { data: item, error: itemError } = await supabase
    .from('menu_items')
    .insert([itemData])
    .select()
    .single()

  if (itemError) {
    console.error('[menu/createMenuItem] Failed to create item:', itemError.message)
    return { error: itemError.message }
  }

  if (modifiers && modifiers.length > 0) {
    const modsToInsert = modifiers.map(mod => ({
      menu_item_id: item.id,
      name: mod.name,
      additional_price: mod.additional_price
    }))
    const { error: modError } = await supabase.from('modifiers').insert(modsToInsert)
    if (modError) {
      console.error('[menu/createMenuItem] Failed to create modifiers:', modError.message)
      return { error: modError.message }
    }
  }

  revalidatePath(`/admin/menu/${itemData.category_id}`)
  return { data: item }
}

/**
 * Updates a menu item and its modifiers.
 */
export async function updateMenuItem(id: string, payload: MenuItemInput) {
  const validation = menuItemSchema.safeParse(payload)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { modifiers, category_id, ...itemData } = validation.data

  const { data: item, error: itemError } = await supabase
    .from('menu_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single()

  if (itemError) {
    console.error(`[menu/updateMenuItem] Failed to update item ${id}:`, itemError.message)
    return { error: itemError.message }
  }

  if (modifiers !== undefined) {
    // Standard approach: delete and recreate for arrays
    await supabase.from('modifiers').delete().eq('menu_item_id', id)
    if (modifiers.length > 0) {
      const modsToInsert = modifiers.map(mod => ({
        menu_item_id: id,
        name: mod.name,
        additional_price: mod.additional_price
      }))
      const { error: modError } = await supabase.from('modifiers').insert(modsToInsert)
      if (modError) {
        console.error(`[menu/updateMenuItem] Failed to update modifiers for item ${id}:`, modError.message)
        return { error: modError.message }
      }
    }
  }

  revalidatePath(`/admin/menu/${category_id}`)
  return { data: item }
}

/**
 * Toggles the active status of a menu item.
 */
export async function toggleMenuItemActive(id: string, categoryId: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    console.error(`[menu/toggleMenuItemActive] Failed for item ${id}:`, error.message)
    return { error: error.message }
  }
  revalidatePath(`/admin/menu/${categoryId}`)
  return { success: true }
}

/**
 * Deletes a menu item.
 */
export async function deleteMenuItem(id: string, categoryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) {
    console.error(`[menu/deleteMenuItem] Failed for item ${id}:`, error.message)
    return { error: error.message }
  }
  revalidatePath(`/admin/menu/${categoryId}`)
  return { success: true }
}

/**
 * Reorders menu items within a category.
 */
export async function reorderMenuItems(categoryId: string, orderedIds: string[]) {
  const supabase = await createClient()
  const updates = orderedIds.map((id, index) => ({
    id,
    category_id: categoryId,
    sort_order: index
  }))

  const { error } = await supabase.from('menu_items').upsert(updates)
  if (error) {
    console.error(`[menu/reorderMenuItems] Failed for category ${categoryId}:`, error.message)
    return { error: error.message }
  }
  revalidatePath(`/admin/menu/${categoryId}`)
  return { success: true }
}

/**
 * Fetches the full menu for a restaurant, optimized for the client-side view.
 * Returns only active items and non-empty categories.
 */
export async function getRestaurantMenu(restaurantId: string): Promise<{ data?: MenuData, error?: string }> {
  const supabase = await createClient()
  const { data: restaurant, error: rError } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('id', restaurantId)
    .single()

  if (rError) {
    console.error(`[menu/getRestaurantMenu] Restaurant ${restaurantId} not found:`, rError.message)
    return { error: 'Restaurante não encontrado' }
  }

  // Fetch categories with nested menu items and modifiers in a single query
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

  if (cError) {
    console.error(`[menu/getRestaurantMenu] Failed to fetch menu for restaurant ${restaurantId}:`, cError.message)
    return { error: cError.message }
  }

  // Transform and filter data according to business rules
  const filteredCategories = (categories as (Category & { menu_items: MenuItem[] })[])
    .map((cat) => ({
      ...cat,
      menu_items: (cat.menu_items || [])
        .filter((item) => item.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
    }))
    .filter((cat) => cat.menu_items.length > 0)

  return {
    data: {
      restaurant,
      categories: filteredCategories
    }
  }
}

