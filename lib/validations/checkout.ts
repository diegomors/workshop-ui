import { z } from 'zod'

export const checkoutSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    modifiers: z.array(z.object({
      name: z.string(),
      price: z.number().nonnegative()
    })).default([]),
    subtotal: z.number().nonnegative()
  })).min(1, 'O pedido deve ter pelo menos um item'),
  notes: z.string().max(500).optional().nullable()
})

export const createPaymentIntentSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    modifiers: z.array(z.object({
      name: z.string(),
      price: z.number().nonnegative()
    })).default([]),
    subtotal: z.number().nonnegative()
  })).min(1),
  notes: z.string().max(500).optional().nullable()
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
