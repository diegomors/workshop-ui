import { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'

type OrderStatusBadgeProps = {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  REALIZADO: { label: 'Novo', className: 'bg-primary/15 text-primary dark:bg-primary/15 dark:text-primary' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  EM_PREPARO: { label: 'Em Preparo', className: 'bg-warning-1 text-warning-2 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PRONTO_PARA_RETIRADA: { label: 'Pronto', className: 'bg-positive-1 text-positive-2 dark:bg-green-900/30 dark:text-green-400' },
  EM_ROTA: { label: 'Em Rota', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ENTREGUE: { label: 'Entregue', className: 'bg-neutral-20 text-neutral-500 dark:bg-neutral-30 dark:text-neutral-50' },
  RETIRADO_PELO_CLIENTE: { label: 'Retirado', className: 'bg-neutral-20 text-neutral-500 dark:bg-neutral-30 dark:text-neutral-50' },
  CANCELADO: { label: 'Cancelado', className: 'bg-negative-1 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-neutral-20 text-neutral-500' }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}
