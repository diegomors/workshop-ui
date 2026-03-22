import { createClient } from '@/lib/supabase/server'
import { MOCK_RESTAURANTS } from '@/lib/mock-data'
import Link from 'next/link'

export default async function ClientHomePage() {
  const supabase = await createClient()
  const { data: dbRestaurants } = await supabase
    .from('restaurants')
    .select('id, name, description')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const restaurants = (dbRestaurants && dbRestaurants.length > 0)
    ? dbRestaurants
    : MOCK_RESTAURANTS

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Restaurantes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/restaurant/${r.id}`}
            className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-bold text-blue-600">{r.name}</h2>
            {r.description && (
              <p className="text-gray-500 mt-2">{r.description}</p>
            )}
            <span className="inline-block mt-4 text-sm text-blue-500 hover:underline">
              Ver cardápio →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
