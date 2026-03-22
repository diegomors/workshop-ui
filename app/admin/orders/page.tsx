import { getAdminContext } from '@/lib/actions/restaurant'
import { getRestaurantOrders } from '@/lib/actions/order'
import { OrderKanban } from '@/components/order-kanban'
import { redirect } from 'next/navigation'

/**
 * Admin/Kitchen Orders Page — Kanban View.
 * Displays orders in columns based on their current status.
 */
export default async function AdminOrdersPage() {
  const context = await getAdminContext()

  if (!context) {
    redirect('/login')
  }

  const { restaurantId, profile } = context

  // Fetch initial orders for the Kanban
  const initialOrders = await getRestaurantOrders(restaurantId, [
    'REALIZADO',
    'CONFIRMADO',
    'EM_PREPARO',
    'PRONTO_PARA_RETIRADA',
    'EM_ROTA'
  ])

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie o fluxo de preparo e entrega em tempo real.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <OrderKanban 
          initialOrders={initialOrders} 
          restaurantId={restaurantId}
          userRole={profile.role}
        />
      </div>
    </div>
  )
}
