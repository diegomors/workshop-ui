import { getMenuRepository } from '@/lib/repositories/menu-repository'
import Link from 'next/link'

export default async function ClientHomePage() {
  const repo = getMenuRepository()
  const restaurants = await repo.getRestaurants()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Restaurantes</h1>
        {process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Modo Mock Ativado
          </span>
        )}
      </div>

      {(!restaurants || restaurants.length === 0) ? (
        <p className="text-gray-500">Nenhum restaurante disponível no momento.</p>
      ) : (
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
      )}
    </div>
  )
}
