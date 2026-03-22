import { getRestaurantMenu } from '@/lib/actions/menu'
import { RestaurantMenu } from './restaurant-menu'

export default async function RestaurantMenuPage({ params }: { params: { id: string } }) {
  const p = await params
  const { data, error } = await getRestaurantMenu(p.id)

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20">
        <h1 className="text-2xl font-bold text-gray-800">Erro ou restaurante não encontrado</h1>
        <p className="text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  const { restaurant, categories } = data

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
      <div className="flex justify-between items-baseline border-b pb-4">
        <h1 className="text-4xl font-extrabold text-blue-600">{restaurant.name}</h1>
        {process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Mock
          </span>
        )}
      </div>
      <RestaurantMenu categories={categories} restaurantId={restaurant.id} />
    </div>
  )
}
