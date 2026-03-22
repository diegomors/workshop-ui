'use client'

import { Order } from '@/types/order'
import { OrderCard } from './order-card'
import Link from 'next/link'

type OrderListProps = {
  orders: Order[]
  title: string
  emptyMessage?: string
}

export function OrderList({ orders, title, emptyMessage = 'Nenhum pedido encontrado' }: OrderListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      
      {orders.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center border-2 border-dashed rounded-xl">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <OrderCard 
                order={order}
                actions={[]} // Simple list, no buttons in card
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
