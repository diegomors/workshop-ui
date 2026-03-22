'use client'

import { Order } from '@/types/order'
import { OrderStatusBadge } from './order-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

type OrderCardProps = {
  order: Order
  actions?: Array<{
    label: string
    onClick: (orderId: string) => void
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  }>
}

export function OrderCard({ order, actions }: OrderCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold">
          #{order.id.slice(-4).toUpperCase()}
        </CardTitle>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(order.created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </div>
        
        {order.notes && (
          <div className="text-sm border-l-2 border-yellow-200 pl-2 italic text-muted-foreground">
            "{order.notes}"
          </div>
        )}

        <div className="text-sm font-semibold">
          Total: R$ {order.total.toFixed(2)}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex gap-2 pt-2">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || 'default'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => action.onClick(order.id)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
