import { getCategories } from '@/lib/actions/menu'
import { CategoryList } from '@/app/admin/menu/category-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMenuRepository } from '@/lib/repositories/menu-repository'
import { Category } from '@/types/menu'

export default async function AdminMenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const repo = getMenuRepository()
  
  // No admin, se estiver em modo mock, ignoramos o owner_id do Supabase
  const rest = await repo.getRestaurantByOwner(user.id)
  
  if (!rest) {
    return <div className="p-4">Restaurante não encontrado para este usuário.</div>
  }

  const categories = await getCategories(rest.id)

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categorias do Cardápio</h1>
        {process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md font-medium">
            Modo de Demonstração (MOCK)
          </span>
        )}
      </div>
      <CategoryList initialCategories={categories} restaurantId={rest.id} />
    </div>
  )
}
