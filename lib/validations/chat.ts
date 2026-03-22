import { z } from 'zod'

export const sendMessageSchema = z.object({
  order_id: z.string().uuid(),
  message: z.string().min(1, 'Mensagem não pode ser vazia').max(500, 'Mensagem não pode exceder 500 caracteres')
})

export const updatePositionSchema = z.object({
  order_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional()
})

export const confirmDeliverySchema = z.object({
  order_id: z.string().uuid(),
  code: z.string().length(4, 'Código deve ter 4 dígitos').regex(/^\d{4}$/, 'Código deve conter apenas números')
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>
export type ConfirmDeliveryInput = z.infer<typeof confirmDeliverySchema>
