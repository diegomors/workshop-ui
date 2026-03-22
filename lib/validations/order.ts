import { z } from 'zod'

export const orderStatusEnum = z.enum([
  'REALIZADO',
  'CONFIRMADO',
  'CANCELADO',
  'EM_PREPARO',
  'PRONTO_PARA_RETIRADA',
  'RETIRADO_PELO_CLIENTE',
  'EM_ROTA',
  'ENTREGUE'
])

export const orderItemModifierSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative()
})

export const orderItemInputSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  modifiers: z.array(orderItemModifierSchema).default([]),
  subtotal: z.number().nonnegative()
})

export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  customer_latitude: z.number().optional().nullable(),
  customer_longitude: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, 'O pedido deve ter pelo menos um item')
})

export const transitionOrderSchema = z.object({
  order_id: z.string().uuid(),
  new_status: orderStatusEnum
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>
export type OrderItemInput = z.infer<typeof orderItemInputSchema>
