import { ChatMessage, DeliveryPosition } from '@/types/chat'

export interface IChatRepository {
  sendMessage(orderId: string, senderId: string, message: string): Promise<ChatMessage>
  getMessages(orderId: string): Promise<ChatMessage[]>
  updateDelivererPosition(orderId: string, delivererId: string, latitude: number, longitude: number, accuracy?: number): Promise<void>
  getLatestDelivererPosition(orderId: string): Promise<DeliveryPosition | null>
  confirmDeliveryCode(orderId: string, code: string): Promise<{ valid: boolean }>
}
