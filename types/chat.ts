export type ChatMessage = {
  id: string
  order_id: string
  sender_id: string
  message: string
  created_at: string
}

export type DeliveryPosition = {
  id: string
  order_id: string
  deliverer_id: string
  latitude: number
  longitude: number
  accuracy: number | null
  created_at: string
}
