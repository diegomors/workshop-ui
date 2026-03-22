import { MenuItemForm } from '../../menu-item-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditMenuItemPage({ params }: { params: { categoryId: string, itemId: string } }) {
  const p = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('menu_items')
    .select('*, modifiers(*)')
    .eq('id', p.itemId)
    .single()

  if (!item) notFound()

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Editar Item</h1>
      <MenuItemForm categoryId={p.categoryId} item={item} />
    </div>
  )
}
