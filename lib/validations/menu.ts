import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  restaurant_id: z.string().uuid(),
})

export const modifierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome do modificador é obrigatório"),
  additional_price: z.coerce.number().min(0, "O preço deve ser igual ou maior que zero"),
})

export const menuItemSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "O preço deve ser igual ou maior que zero"),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  modifiers: z.array(modifierSchema).default([]),
})


export type CategoryInput = z.infer<typeof categorySchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type ModifierInput = z.infer<typeof modifierSchema>
