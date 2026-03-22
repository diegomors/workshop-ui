import { Category, MenuData, MenuItem } from '@/types/menu'
import { MenuItemInput } from '@/lib/validations/menu'

export interface IMenuRepository {
  getCategories(restaurantId: string): Promise<Category[]>
  createCategory(restaurantId: string, name: string): Promise<Category>
  updateCategory(id: string, name: string): Promise<Category>
  deleteCategory(id: string): Promise<void>
  reorderCategories(restaurantId: string, orderedIds: string[]): Promise<void>
  
  getMenuItems(categoryId: string): Promise<MenuItem[]>
  createMenuItem(payload: MenuItemInput): Promise<MenuItem>
  updateMenuItem(id: string, payload: MenuItemInput): Promise<MenuItem>
  toggleMenuItemActive(id: string, isActive: boolean): Promise<void>
  deleteMenuItem(id: string): Promise<void>
  reorderMenuItems(categoryId: string, orderedIds: string[]): Promise<void>
  
  getRestaurantMenu(restaurantId: string): Promise<MenuData>
  getRestaurants(): Promise<Array<{ id: string, name: string, description: string | null }>>
  getRestaurantByOwner(ownerId: string): Promise<{ id: string } | null>
}
