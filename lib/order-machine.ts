import { OrderStatus } from '@/types/order'
import { UserRole } from '@/types'

export type OrderTransition = {
  from: OrderStatus | 'INITIAL' // INITIAL state for new orders
  to: OrderStatus
  allowedRoles: UserRole[]
}

export const VALID_TRANSITIONS: OrderTransition[] = [
  // New order creation
  { from: 'INITIAL', to: 'REALIZADO', allowedRoles: ['cliente'] },

  // Admin confirming or canceling
  { from: 'REALIZADO', to: 'CONFIRMADO', allowedRoles: ['admin'] },
  { from: 'REALIZADO', to: 'CANCELADO', allowedRoles: ['admin', 'cliente'] },

  // Preparation flow
  { from: 'CONFIRMADO', to: 'EM_PREPARO', allowedRoles: ['admin', 'cozinha'] },
  { from: 'CONFIRMADO', to: 'CANCELADO', allowedRoles: ['admin', 'cliente'] },

  // Ready for pickup or self-pickup
  { from: 'EM_PREPARO', to: 'PRONTO_PARA_RETIRADA', allowedRoles: ['admin', 'cozinha'] },
  { from: 'EM_PREPARO', to: 'RETIRADO_PELO_CLIENTE', allowedRoles: ['admin'] },

  // Delivery flow
  { from: 'PRONTO_PARA_RETIRADA', to: 'EM_ROTA', allowedRoles: ['entregador'] },
  { from: 'PRONTO_PARA_RETIRADA', to: 'RETIRADO_PELO_CLIENTE', allowedRoles: ['admin'] },

  // Completion
  { from: 'EM_ROTA', to: 'ENTREGUE', allowedRoles: ['entregador'] }
]

/**
 * Validates if a transition from currentStatus to newStatus is allowed for the given role.
 */
export function validateOrderTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  role: UserRole
): { isValid: boolean; error?: string } {
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === currentStatus && t.to === newStatus
  )

  if (!transition) {
    return {
      isValid: false,
      error: `Transição não permitida de ${currentStatus} para ${newStatus}`
    }
  }

  if (!transition.allowedRoles.includes(role)) {
    return {
      isValid: false,
      error: `Seu papel (${role}) não tem permissão para esta transição`
    }
  }

  return { isValid: true }
}

/**
 * Gets human-readable status message for the client.
 */
export function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'REALIZADO':
      return 'Pedido enviado! Aguardando confirmação.'
    case 'CONFIRMADO':
      return 'Pedido confirmado! Em breve começa o preparo.'
    case 'CANCELADO':
      return 'Pedido cancelado. Estorno realizado automaticamente.'
    case 'EM_PREPARO':
      return 'Seu pedido está sendo preparado!'
    case 'PRONTO_PARA_RETIRADA':
      return 'Pedido pronto! Entregador a caminho.'
    case 'EM_ROTA':
      return 'Seu pedido saiu para entrega!'
    case 'RETIRADO_PELO_CLIENTE':
      return 'Pedido retirado. Bom apetite!'
    case 'ENTREGUE':
      return 'Pedido entregue! Esperamos que goste.'
    default:
      return 'Acompanhando status...'
  }
}
