'use client'

import { OrderStatusHistory } from '@/types/order'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle } from 'lucide-react'

const statusLabels: Record<string, string> = {
  REALIZADO: 'Pedido Realizado',
  CONFIRMADO: 'Confirmado',
  EM_PREPARO: 'Em Preparo',
  PRONTO_PARA_RETIRADA: 'Pronto para Entrega',
  EM_ROTA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  RETIRADO_PELO_CLIENTE: 'Retirado',
  CANCELADO: 'Cancelado'
}

type OrderTimelineProps = {
  history: OrderStatusHistory[]
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  const sortedHistory = [...history].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-muted border-l-0">
      {sortedHistory.map((item, index) => {
        const isLatest = index === 0
        
        return (
          <div key={item.id} className="relative">
            <span className={`absolute -left-[27px] top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-background border-2 ${isLatest ? 'border-primary' : 'border-muted'}`}>
              {isLatest ? (
                <CheckCircle2 className="h-3 w-3 text-primary" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground fill-muted" />
              )}
            </span>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                {statusLabels[item.to_status] || item.to_status}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
