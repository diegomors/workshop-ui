'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { MenuItemInput } from '@/lib/validations/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ModifierFields({ form }: { form: UseFormReturn<MenuItemInput> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'modifiers'
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-gray-50 p-4 border border-gray-100 rounded-md">
          <div className="w-full sm:flex-1 space-y-1">
            <Label>Nome</Label>
            <Input {...form.register(`modifiers.${index}.name`)} placeholder="Ex: Sem Cebola, Bacon Extra" />
            {form.formState.errors.modifiers?.[index]?.name && (
              <p className="text-red-500 text-xs">{form.formState.errors.modifiers[index].name?.message}</p>
            )}
          </div>
          <div className="w-full sm:w-32 space-y-1">
            <Label>Preço + (R$)</Label>
            <Input type="number" step="0.01" {...form.register(`modifiers.${index}.additional_price`)} />
            {form.formState.errors.modifiers?.[index]?.additional_price && (
              <p className="text-red-500 text-xs">{form.formState.errors.modifiers[index].additional_price?.message}</p>
            )}
          </div>
          <div className="mt-2 sm:mt-0">
            <Button type="button" variant="destructive" onClick={() => remove(index)}>
              Remover
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={() => append({ name: '', additional_price: 0 })}>
        + Adicionar Modificador
      </Button>
    </div>
  )
}
