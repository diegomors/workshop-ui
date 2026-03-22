import { MenuItemForm } from '../menu-item-form'

export default async function NewMenuItemPage({ params }: { params: { categoryId: string } }) {
  const p = await params
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Novo Item</h1>
      <MenuItemForm categoryId={p.categoryId} />
    </div>
  )
}
