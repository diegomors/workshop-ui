import { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'

type OrderStatusBadgeProps = {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  REALIZADO: { label: 'Novo', className: 'bg-info-1 text-info-2' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-info-1 text-info-2' },
  EM_PREPARO: { label: 'Em Preparo', className: 'bg-warning-1 text-warning-2' },
  PRONTO_PARA_RETIRADA: { label: 'Pronto', className: 'bg-positive-1 text-positive-2' },
  EM_ROTA: { label: 'Em Rota', className: 'bg-info-1 text-info-2' },
  ENTREGUE: { label: 'Entregue', className: 'bg-neutral-20 text-neutral-500' },
  RETIRADO_PELO_CLIENTE: { label: 'Retirado', className: 'bg-neutral-20 text-neutral-500' },
  CANCELADO: { label: 'Cancelado', className: 'bg-negative-1 text-negative-2' }
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-neutral-20 text-neutral-500' }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}
