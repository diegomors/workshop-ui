'use server'

/**
 * Server Actions for the digital menu domain.
 * Handles CRUD for categories, menu items, and modifiers.
 */

import { revalidatePath } from 'next/cache'
import { categorySchema, menuItemSchema, MenuItemInput } from '@/lib/validations/menu'
import { Category, MenuData, MenuItem } from '@/types/menu'
import { getMenuRepository } from '@/lib/repositories/menu-repository'

/**
 * Fetches all categories for a restaurant, ordered by sort_order.
 * Throws on database error.
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  const repo = getMenuRepository()
  try {
    return await repo.getCategories(restaurantId)
  } catch (error: any) {
    console.error(`[menu/getCategories] Failed for restaurant ${restaurantId}:`, error.message)
    throw new Error(error.message)
  }
}

/**
 * Creates a new category for a restaurant.
 */
export async function createCategory(restaurantId: string, name: string) {
  const validation = categorySchema.safeParse({ name, restaurant_id: restaurantId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const repo = getMenuRepository()
  try {
    const data = await repo.createCategory(restaurantId, name)
    revalidatePath('/admin/menu')
    return { data }
  } catch (error: any) {
    console.error(`[menu/createCategory] Failed for restaurant ${restaurantId}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Updates an existing category name.
 */
export async function updateCategory(id: string, name: string) {
  const repo = getMenuRepository()
  try {
    const data = await repo.updateCategory(id, name)
    revalidatePath('/admin/menu')
    return { data }
  } catch (error: any) {
    console.error(`[menu/updateCategory] Failed for category ${id}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Deletes a category.
 */
export async function deleteCategory(id: string) {
  const repo = getMenuRepository()
  try {
    await repo.deleteCategory(id)
    revalidatePath('/admin/menu')
    return { success: true }
  } catch (error: any) {
    console.error(`[menu/deleteCategory] Failed for category ${id}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Reorders categories for a restaurant.
 */
export async function reorderCategories(restaurantId: string, orderedIds: string[]) {
  const repo = getMenuRepository()
  try {
    await repo.reorderCategories(restaurantId, orderedIds)
    revalidatePath('/admin/menu')
    return { success: true }
  } catch (error: any) {
    console.error(`[menu/reorderCategories] Failed for restaurant ${restaurantId}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Fetches all menu items for a category.
 */
export async function getMenuItems(categoryId: string): Promise<MenuItem[]> {
  const repo = getMenuRepository()
  try {
    return await repo.getMenuItems(categoryId)
  } catch (error: any) {
    console.error(`[menu/getMenuItems] Failed for category ${categoryId}:`, error.message)
    throw new Error(error.message)
  }
}

/**
 * Creates a new menu item with modifiers.
 */
export async function createMenuItem(payload: MenuItemInput) {
  const validation = menuItemSchema.safeParse(payload)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const repo = getMenuRepository()
  try {
    const data = await repo.createMenuItem(validation.data)
    revalidatePath(`/admin/menu/${validation.data.category_id}`)
    return { data }
  } catch (error: any) {
    console.error('[menu/createMenuItem] Failed to create item:', error.message)
    return { error: error.message }
  }
}

/**
 * Updates a menu item and its modifiers.
 */
export async function updateMenuItem(id: string, payload: MenuItemInput) {
  const validation = menuItemSchema.safeParse(payload)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const repo = getMenuRepository()
  try {
    const data = await repo.updateMenuItem(id, validation.data)
    revalidatePath(`/admin/menu/${validation.data.category_id}`)
    return { data }
  } catch (error: any) {
    console.error(`[menu/updateMenuItem] Failed to update item ${id}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Toggles the active status of a menu item.
 */
export async function toggleMenuItemActive(id: string, categoryId: string, isActive: boolean) {
  const repo = getMenuRepository()
  try {
    await repo.toggleMenuItemActive(id, isActive)
    revalidatePath(`/admin/menu/${categoryId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[menu/toggleMenuItemActive] Failed for item ${id}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Deletes a menu item.
 */
export async function deleteMenuItem(id: string, categoryId: string) {
  const repo = getMenuRepository()
  try {
    await repo.deleteMenuItem(id)
    revalidatePath(`/admin/menu/${categoryId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[menu/deleteMenuItem] Failed for item ${id}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Reorders menu items within a category.
 */
export async function reorderMenuItems(categoryId: string, orderedIds: string[]) {
  const repo = getMenuRepository()
  try {
    await repo.reorderMenuItems(categoryId, orderedIds)
    revalidatePath(`/admin/menu/${categoryId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[menu/reorderMenuItems] Failed for category ${categoryId}:`, error.message)
    return { error: error.message }
  }
}

/**
 * Fetches the full menu for a restaurant, optimized for the client-side view.
 * Returns only active items and non-empty categories.
 */
export async function getRestaurantMenu(restaurantId: string): Promise<{ data?: MenuData, error?: string }> {
  const repo = getMenuRepository()
  try {
    const data = await repo.getRestaurantMenu(restaurantId)
    return { data }
  } catch (error: any) {
    console.error(`[menu/getRestaurantMenu] Failed for restaurant ${restaurantId}:`, error.message)
    return { error: error.message }
  }
}
