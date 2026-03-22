'use client'

import { useState } from 'react'
import { Category, MenuItem } from '@/types/menu'
import { ItemDetailModal } from './item-detail-modal'

type CategoryWithItems = Category & { menu_items: MenuItem[] }

export function RestaurantMenu({ categories, restaurantId }: { categories: CategoryWithItems[], restaurantId: string }) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category.id} className="space-y-4">
          <h2 className="text-2xl font-bold bg-gray-100 p-2 rounded-md">{category.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.menu_items.map((item: MenuItem) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-white border rounded shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.description && <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>}
                  <p className="mt-2 font-bold text-gray-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </p>
                </div>
                {item.image_url && (
                  <div className="flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          restaurantId={restaurantId}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
