export type OrderStatus =
  | 'REALIZADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EM_PREPARO'
  | 'PRONTO_PARA_RETIRADA'
  | 'RETIRADO_PELO_CLIENTE'
  | 'EM_ROTA'
  | 'ENTREGUE'

export type Order = {
  id: string
  restaurant_id: string
  customer_id: string
  status: OrderStatus
  total: number
  service_fee: number
  payment_intent_id?: string | null
  delivery_code?: string | null
  notes?: string | null
  customer_latitude?: number | null
  customer_longitude?: number | null
  created_at: string
  updated_at: string
}

export type OrderItemModifier = {
  name: string
  price: number
}

export type OrderItem = {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  modifiers_json: OrderItemModifier[]
  subtotal: number
  created_at: string
}

export type OrderStatusHistory = {
  id: string
  order_id: string
  from_status: OrderStatus | null
  to_status: OrderStatus
  changed_by: string
  created_at: string
}

export type OrderWithDetails = Order & {
  order_items: OrderItem[]
  status_history: OrderStatusHistory[]
}
