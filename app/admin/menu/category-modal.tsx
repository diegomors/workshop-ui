'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Category } from '@/types/menu'
import { toast } from 'sonner'
import { createCategory, updateCategory } from '@/lib/actions/menu'

export function CategoryModal({
  restaurantId,
  category,
  onOpenChange
}: {
  restaurantId: string
  category?: Category
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(category?.name || '')
  const [loading, setLoading] = useState(false)

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (onOpenChange) onOpenChange(v)
    if (!v && !category) setName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    let res
    if (category) {
      res = await updateCategory(category.id, name)
    } else {
      res = await createCategory(restaurantId, name)
    }
    setLoading(false)

    if (res?.error) {
      toast.error('Erro ao salvar categoria')
    } else {
      toast.success('Categoria salva com sucesso')
      handleOpenChange(false)
    }
  }

  return (
    <>
      {category ? (
        <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>Editar</Button>
      ) : (
        <Button onClick={() => handleOpenChange(true)}>Nova Categoria</Button>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

