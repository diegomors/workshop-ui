'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuItem } from '@/types/menu'
import { reorderMenuItems, toggleMenuItemActive, deleteMenuItem } from '@/lib/actions/menu'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SortableMenuItem({ item, categoryId, onDelete, onToggle }: { item: MenuItem, categoryId: string, onDelete: (id: string) => void, onToggle: (id: string, active: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-white border rounded shadow-sm mb-2 group">
      <div className="flex items-center gap-4 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <span className="text-xl">≡</span>
        </div>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded" />
        )}
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-sm text-gray-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input type="checkbox" checked={item.is_active} onChange={(e) => onToggle(item.id, e.target.checked)} className="cursor-pointer" />
          Ativo
        </label>
        <Link href={`/admin/menu/${categoryId}/${item.id}/edit`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <div className="hidden group-hover:flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>X</Button>
        </div>
      </div>
    </div>
  )
}

export function MenuItemList({ initialItems, categoryId }: { initialItems: MenuItem[], categoryId: string }) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((list) => {
        const oldIndex = list.findIndex(t => t.id === active.id)
        const newIndex = list.findIndex(t => t.id === over.id)
        const newOrder = arrayMove(list, oldIndex, newIndex)
        
        reorderMenuItems(categoryId, newOrder.map(c => c.id)).catch(() => {
          toast.error('Erro ao salvar a ordem')
        })

        return newOrder
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este item?")) {
      const res = await deleteMenuItem(id, categoryId)
      if (res?.error) toast.error(res.error)
      else toast.success("Excluído")
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    setItems(list => list.map(item => item.id === id ? { ...item, is_active: active } : item))
    const res = await toggleMenuItemActive(id, categoryId, active)
    if (res?.error) {
      toast.error('Erro ao alterar status')
    }
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableMenuItem key={item.id} item={item} categoryId={categoryId} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
          {items.length === 0 && (
            <div className="text-center p-8 bg-white border rounded text-gray-500">Nenhum item nesta categoria.</div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}
