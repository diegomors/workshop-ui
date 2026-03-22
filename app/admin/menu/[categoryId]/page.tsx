import { getMenuItems } from '@/lib/actions/menu'
import { MenuItemList } from './menu-item-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CategoryItemsPage({ params }: { params: { categoryId: string } }) {
  // App Router params wait
  // In Next.js 15+ we might need to await params
  const p = await params
  const categoryId = p.categoryId

  const items = await getMenuItems(categoryId)

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Itens da Categoria</h1>
        <Link href={`/admin/menu/${categoryId}/new`}>
          <Button>+ Novo Item</Button>
        </Link>
      </div>
      
      <MenuItemList initialItems={items} categoryId={categoryId} />
    </div>
  )
}
