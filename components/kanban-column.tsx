'use client'

import { Order, OrderStatus } from '@/types/order'
import { OrderCard } from './order-card'

type KanbanColumnProps = {
  title: string
  status: OrderStatus
  orders: Order[]
  actions: Array<{
    label: string
    onClick: (orderId: string) => void
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  }>
}

export function KanbanColumn({ title, status, orders, actions }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-4 bg-muted/50 p-4 rounded-xl min-w-[280px] w-full max-w-[350px]">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="bg-background text-foreground text-xs font-bold px-2 py-0.5 rounded-full border border-border">
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <span className="text-xs uppercase font-medium">Sem pedidos</span>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} actions={actions} />
          ))
        )}
      </div>
    </div>
  )
}
