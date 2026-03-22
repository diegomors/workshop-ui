import { createClient } from '@/lib/supabase/server'
import { IChatRepository } from './chat-repository-interface'
import { ChatMessage, DeliveryPosition } from '@/types/chat'

export class SupabaseChatRepository implements IChatRepository {
  async sendMessage(orderId: string, senderId: string, message: string): Promise<ChatMessage> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        order_id: orderId,
        sender_id: senderId,
        message
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMessages(orderId: string): Promise<ChatMessage[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async updateDelivererPosition(
    orderId: string,
    delivererId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('delivery_tracking')
      .insert({
        order_id: orderId,
        deliverer_id: delivererId,
        latitude,
        longitude,
        accuracy: accuracy ?? null
      })

    if (error) throw error
  }

  async getLatestDelivererPosition(orderId: string): Promise<DeliveryPosition | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async confirmDeliveryCode(orderId: string, code: string): Promise<{ valid: boolean }> {
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('delivery_code')
      .eq('id', orderId)
      .single()

    if (error) throw error
    return { valid: order.delivery_code === code }
  }
}
