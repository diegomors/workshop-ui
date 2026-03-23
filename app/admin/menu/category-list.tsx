'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Category } from '@/types/menu'
import { reorderCategories, deleteCategory } from '@/lib/actions/menu'
import { toast } from 'sonner'
import { CategoryModal } from '@/app/admin/menu/category-modal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SortableCategoryItem({ category, restaurantId, onDelete }: { category: Category, restaurantId: string, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-card border rounded shadow-sm mb-2 group">
      <div className="flex items-center gap-4 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab text-neutral-50 hover:text-neutral-200">
          <span className="text-xl">≡</span>
        </div>
        <div className="font-semibold">{category.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/admin/menu/${category.id}`}>
          <Button variant="outline" size="sm">Itens</Button>
        </Link>
        {/* We use inline CategoryModal for editing instead of triggering outside, but simpler to just use it inline */}
        <div className="hidden group-hover:flex items-center gap-2">
          <CategoryModal restaurantId={restaurantId} category={category} />
          <Button variant="destructive" size="sm" onClick={() => onDelete(category.id)}>X</Button>
        </div>
      </div>
    </div>
  )
}

export function CategoryList({ initialCategories, restaurantId }: { initialCategories: Category[], restaurantId: string }) {
  const [categories, setCategories] = useState(initialCategories)

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id)
        const newIndex = items.findIndex(t => t.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Save back to DB
        reorderCategories(restaurantId, newOrder.map(c => c.id)).catch(() => {
          toast.error('Erro ao salvar a ordem')
        })

        return newOrder
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Excluir categoria e todos os itens?")) {
      const res = await deleteCategory(id)
      if (res?.error) toast.error(res.error)
      else toast.success("Excluída")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CategoryModal restaurantId={restaurantId} />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map(cat => (
            <SortableCategoryItem key={cat.id} category={cat} restaurantId={restaurantId} onDelete={handleDelete} />
          ))}
          {categories.length === 0 && (
            <div className="text-center p-8 bg-card border rounded text-muted-foreground">Nenhuma categoria criada.</div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}
