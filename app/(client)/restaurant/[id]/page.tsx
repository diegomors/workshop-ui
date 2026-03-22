import { getRestaurantMenu } from '@/lib/actions/menu'
import { RestaurantMenu } from './restaurant-menu'
import { MOCK_MENU, MOCK_RESTAURANT_ID } from '@/lib/mock-data'

export default async function RestaurantMenuPage({ params }: { params: { id: string } }) {
  const p = await params
  const isMockId = p.id.startsWith('mock-')

  let restaurant
  let categories

  if (isMockId) {
    // Usa dados mock
    restaurant = MOCK_MENU.restaurant
    categories = MOCK_MENU.categories
  } else {
    const result = await getRestaurantMenu(p.id)
    if (result.error || !result.data) {
      return (
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <h1 className="text-2xl font-bold text-gray-800">Erro ou restaurante não encontrado</h1>
          <p className="text-gray-500 mt-2">{result.error}</p>
        </div>
      )
    }
    restaurant = result.data.restaurant
    categories = result.data.categories
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500 mt-4">Cardápio em construção</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-4xl font-extrabold text-blue-600 border-b pb-4">{restaurant.name}</h1>
      <RestaurantMenu categories={categories} restaurantId={restaurant.id} />
    </div>
  )
}
