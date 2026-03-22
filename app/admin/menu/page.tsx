import { getCategories } from '@/lib/actions/menu'
import { CategoryList } from '@/app/admin/menu/category-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MOCK_CATEGORIES, MOCK_RESTAURANT_ID } from '@/lib/mock-data'
import { Category } from '@/types/menu'

export default async function AdminMenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rest } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single()
  
  // Fallback para dados mock se não encontrar restaurante no banco
  const restaurantId = rest?.id ?? MOCK_RESTAURANT_ID
  
  let categories: Category[]
  try {
    categories = await getCategories(restaurantId)
  } catch {
    categories = []
  }

  // Se não há categorias no banco, usar mock
  if (categories.length === 0 && !rest) {
    categories = MOCK_CATEGORIES
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categorias do Cardápio</h1>
        {!rest && (
          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md">
            Dados de demonstração
          </span>
        )}
      </div>
      <CategoryList initialCategories={categories} restaurantId={restaurantId} />
    </div>
  )
}
