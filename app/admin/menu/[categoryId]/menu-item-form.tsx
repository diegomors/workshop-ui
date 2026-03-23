'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { menuItemSchema, MenuItemInput } from '@/lib/validations/menu'
import { Category, MenuItem } from '@/types/menu'
import { createMenuItem, updateMenuItem } from '@/lib/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModifierFields } from '@/components/modifier-fields'
import { ImageUpload } from '@/components/image-upload'
import { toast } from 'sonner'
import Link from 'next/link'

export function MenuItemForm({ categoryId, item }: { categoryId: string, item?: MenuItem }) {
  const router = useRouter()
  const form = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      category_id: categoryId,
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      image_url: item?.image_url || '',
      is_active: item?.is_active ?? true,
      modifiers: item?.modifiers || [],
    }
  })


  async function onSubmit(data: MenuItemInput) {
    let res
    if (item) {
      res = await updateMenuItem(item.id, data)
    } else {
      res = await createMenuItem(data)
    }

    if (res?.error) {
      toast.error('Erro ao salvar item')
    } else {
      toast.success('Item salvo com sucesso')
      router.push(`/admin/menu/${categoryId}`)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 border rounded shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Item</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && <p className="text-negative-2 text-sm">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input type="number" step="0.01" {...form.register('price')} />
            {form.formState.errors.price && <p className="text-negative-2 text-sm">{form.formState.errors.price.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...form.register('is_active')} />
            <Label htmlFor="is_active">Item Ativo (Visível para clientes)</Label>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Foto do Item</Label>
          <ImageUpload
            currentUrl={form.watch('image_url') || ''}
            onUpload={(url) => form.setValue('image_url', url)}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Modificadores (Adicionais)</h3>
        <ModifierFields form={form} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Link href={`/admin/menu/${categoryId}`}>
          <Button variant="outline" type="button">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={form.formState.isSubmitting}>Salvar</Button>
      </div>
    </form>
  )
}
