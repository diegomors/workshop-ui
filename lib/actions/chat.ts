/**
 * Server Actions for the chat and delivery tracking domain.
 * Handles chat messages, deliverer position updates, and delivery confirmation.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { getChatRepository } from '@/lib/repositories/chat-repository'
import { getOrderRepository } from '@/lib/repositories/order-repository'
import {
  sendMessageSchema,
  updatePositionSchema,
  confirmDeliverySchema,
  SendMessageInput,
  UpdatePositionInput,
  ConfirmDeliveryInput
} from '@/lib/validations/chat'
import { ChatMessage, DeliveryPosition } from '@/types/chat'
import { revalidatePath } from 'next/cache'

type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }
  | { success: true; error?: never }

/**
 * Sends a chat message in an order conversation.
 * Available only when order is in PRONTO_PARA_RETIRADA or EM_ROTA.
 */
export async function sendChatMessage(payload: SendMessageInput): Promise<ActionResult<ChatMessage>> {
  try {
    const validated = sendMessageSchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // Verify order exists and is in a valid chat state
    const repo = getOrderRepository()
    const order = await repo.getOrder(validated.data.order_id)
    if (!order) return { error: 'Pedido não encontrado' }

    if (order.status !== 'PRONTO_PARA_RETIRADA' && order.status !== 'EM_ROTA') {
      return { error: 'Chat disponível apenas em pedidos prontos para retirada ou em rota' }
    }

    const chatRepo = getChatRepository()
    const message = await chatRepo.sendMessage(
      validated.data.order_id,
      user.id,
      validated.data.message
    )

    return { data: message }
  } catch (error: any) {
    console.error('[chat/sendChatMessage] Failed:', error.message)
    return { error: error.message }
  }
}

/**
 * Fetches all chat messages for an order.
 */
export async function getChatMessages(orderId: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const chatRepo = getChatRepository()
    return await chatRepo.getMessages(orderId)
  } catch (error) {
    console.error('[chat/getChatMessages] Failed:', error)
    return []
  }
}

/**
 * Updates the deliverer's GPS position for an order.
 * Called periodically (every 5s) while order is EM_ROTA.
 */
export async function updateDelivererPosition(payload: UpdatePositionInput): Promise<ActionResult<void>> {
  try {
    const validated = updatePositionSchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const chatRepo = getChatRepository()
    await chatRepo.updateDelivererPosition(
      validated.data.order_id,
      user.id,
      validated.data.latitude,
      validated.data.longitude,
      validated.data.accuracy
    )

    return { success: true }
  } catch (error: any) {
    console.error('[chat/updateDelivererPosition] Failed:', error.message)
    return { error: error.message }
  }
}

/**
 * Fetches the latest deliverer position for an order.
 */
export async function getLatestDelivererPosition(orderId: string): Promise<DeliveryPosition | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const chatRepo = getChatRepository()
    return await chatRepo.getLatestDelivererPosition(orderId)
  } catch (error) {
    console.error('[chat/getLatestDelivererPosition] Failed:', error)
    return null
  }
}

/**
 * Confirms delivery by validating the 4-digit code.
 * Max 5 attempts, then locks for 2 minutes.
 */
export async function confirmDelivery(payload: ConfirmDeliveryInput): Promise<ActionResult<{ message: string }>> {
  try {
    const validated = confirmDeliverySchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const chatRepo = getChatRepository()
    const { valid } = await chatRepo.confirmDeliveryCode(
      validated.data.order_id,
      validated.data.code
    )

    if (!valid) {
      return { error: 'Código inválido. Tente novamente.' }
    }

    // Transition order to ENTREGUE
    const orderRepo = getOrderRepository()
    await orderRepo.transitionOrder(validated.data.order_id, 'ENTREGUE', user.id)

    revalidatePath(`/orders/${validated.data.order_id}`)
    revalidatePath('/orders')
    revalidatePath('/admin/orders')

    return { data: { message: 'Entrega realizada com sucesso!' } }
  } catch (error: any) {
    console.error('[chat/confirmDelivery] Failed:', error.message)
    return { error: error.message }
  }
}
