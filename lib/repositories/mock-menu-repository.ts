import { Category, MenuData, MenuItem } from '@/types/menu'
import { MenuItemInput } from '@/lib/validations/menu'
import { IMenuRepository } from './menu-repository-interface'
import { MOCK_MENU, MOCK_RESTAURANTS, MOCK_RESTAURANT_ID } from '@/lib/mock-data'

export class MockMenuRepository implements IMenuRepository {
  async getCategories(restaurantId: string): Promise<Category[]> {
    if (restaurantId === MOCK_RESTAURANT_ID) {
      return MOCK_MENU.categories.map(({ menu_items: _items, ...cat }) => cat)
    }
    return []
  }

  async createCategory(restaurantId: string, name: string): Promise<Category> {
    return {
      id: Math.random().toString(),
      restaurant_id: restaurantId,
      name,
      sort_order: 99,
      created_at: new Date().toISOString()
    }
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    return {
      id,
      restaurant_id: MOCK_RESTAURANT_ID,
      name,
      sort_order: 0,
      created_at: new Date().toISOString()
    }
  }

  async deleteCategory(_id: string): Promise<void> {
    return
  }

  async reorderCategories(_restaurantId: string, _orderedIds: string[]): Promise<void> {
    return
  }

  async getMenuItems(categoryId: string): Promise<MenuItem[]> {
    const category = MOCK_MENU.categories.find(c => c.id === categoryId)
    return category?.menu_items || []
  }

  async createMenuItem(payload: MenuItemInput): Promise<MenuItem> {
    return {
      id: Math.random().toString(),
      ...payload,
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
      price: Number(payload.price),
      is_active: payload.is_active ?? true,
      sort_order: 99,
      created_at: new Date().toISOString(),
      modifiers: (payload.modifiers || []).map(m => ({
        id: Math.random().toString(),
        menu_item_id: 'new',
        name: m.name,
        additional_price: Number(m.additional_price),
        created_at: new Date().toISOString()
      }))
    }
  }

  async updateMenuItem(id: string, payload: MenuItemInput): Promise<MenuItem> {
    return {
      id,
      ...payload,
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
      price: Number(payload.price),
      is_active: payload.is_active ?? true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      modifiers: (payload.modifiers || []).map(m => ({
        id: Math.random().toString(),
        menu_item_id: id,
        name: m.name,
        additional_price: Number(m.additional_price),
        created_at: new Date().toISOString()
      }))
    }
  }

  async toggleMenuItemActive(_id: string, _isActive: boolean): Promise<void> {
    return
  }

  async deleteMenuItem(_id: string): Promise<void> {
    return
  }

  async reorderMenuItems(_categoryId: string, _orderedIds: string[]): Promise<void> {
    return
  }

  async getRestaurantMenu(restaurantId: string): Promise<MenuData> {
    if (restaurantId === MOCK_RESTAURANT_ID) {
      return MOCK_MENU
    }
    // Try other mock restaurants
    const rest = MOCK_RESTAURANTS.find(r => r.id === restaurantId)
    if (rest) {
      return {
        restaurant: { id: rest.id, name: rest.name },
        categories: []
      }
    }
    throw new Error('Restaurante não encontrado')
  }

  async getRestaurants(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    return MOCK_RESTAURANTS
  }

  async getRestaurantByOwner(_ownerId: string): Promise<{ id: string } | null> {
    return { id: MOCK_RESTAURANT_ID }
  }
}
