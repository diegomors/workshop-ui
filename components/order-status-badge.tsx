import { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'

type OrderStatusBadgeProps = {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  REALIZADO: { label: 'Novo', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  EM_PREPARO: { label: 'Em Preparo', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PRONTO_PARA_RETIRADA: { label: 'Pronto', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  EM_ROTA: { label: 'Em Rota', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ENTREGUE: { label: 'Entregue', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  RETIRADO_PELO_CLIENTE: { label: 'Retirado', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' }

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
