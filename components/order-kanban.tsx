'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types/order'
import { KanbanColumn } from './kanban-column'
import { transitionOrder } from '@/lib/actions/order'
import { toast } from 'sonner'
import { UserRole } from '@/types/index'
import { Loader2 } from 'lucide-react'

type OrderKanbanProps = {
  initialOrders: Order[]
  restaurantId: string
  userRole: UserRole
}

export function OrderKanban({ initialOrders, restaurantId, userRole }: OrderKanbanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Columns filtration
  const groupedOrders = useMemo(() => {
    return {
      REALIZADO: orders.filter((o) => o.status === 'REALIZADO'),
      CONFIRMADO: orders.filter((o) => o.status === 'CONFIRMADO'),
      EM_PREPARO: orders.filter((o) => o.status === 'EM_PREPARO'),
      PRONTO_PARA_RETIRADA: orders.filter((o) => o.status === 'PRONTO_PARA_RETIRADA'),
      EM_ROTA: orders.filter((o) => o.status === 'EM_ROTA')
    }
  }, [orders])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const { eventType, new: newOrder, old: oldOrder } = payload

          if (eventType === 'INSERT') {
            setOrders((prev) => [newOrder as Order, ...prev])
            playNotificationSound()
            toast.info(`Novo pedido recebido: #${(newOrder as Order).id.slice(-4).toUpperCase()}`)
          } else if (eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === (newOrder as Order).id ? (newOrder as Order) : o))
            )
          } else if (eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== (oldOrder as Order).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId, supabase])

  const handleTransition = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setLoading(true)
    const result = await transitionOrder({ order_id: orderId, new_status: newStatus })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Status atualizado com sucesso!')
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5) // A4

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.5)
    } catch (e) {
      console.warn('Could not play notification sound:', e)
    }
  }

  // Define column visibility and actions by role
  const isAdmin = userRole === 'admin'
  const isCozinha = userRole === 'cozinha'

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 transition-colors">
      {/* Column REALIZADO (Admin only) */}
      {isAdmin && (
        <KanbanColumn
          title="Novos"
          status="REALIZADO"
          orders={groupedOrders.REALIZADO}
          actions={[
            { label: 'Confirmar', onClick: (id) => handleTransition(id, 'CONFIRMADO'), variant: 'default' },
            { label: 'Cancelar', onClick: (id) => handleTransition(id, 'CANCELADO'), variant: 'outline' }
          ]}
        />
      )}

      {/* Column CONFIRMADO (Admin/Cozinha) */}
      <KanbanColumn
        title="Confirmados"
        status="CONFIRMADO"
        orders={groupedOrders.CONFIRMADO}
        actions={[
          { label: 'Iniciar Preparo', onClick: (id) => handleTransition(id, 'EM_PREPARO'), variant: 'secondary' },
          { label: 'Cancelar', onClick: (id) => handleTransition(id, 'CANCELADO'), variant: 'outline' }
        ]}
      />

      {/* Column EM_PREPARO (Admin/Cozinha) */}
      <KanbanColumn
        title="Em Preparo"
        status="EM_PREPARO"
        orders={groupedOrders.EM_PREPARO}
        actions={[
          { label: 'Pronto!', onClick: (id) => handleTransition(id, 'PRONTO_PARA_RETIRADA'), variant: 'default' }
        ]}
      />

      {/* Column PRONTO_PARA_RETIRADA (Admin/Cozinha) */}
      <KanbanColumn
        title="Prontos"
        status="PRONTO_PARA_RETIRADA"
        orders={groupedOrders.PRONTO_PARA_RETIRADA}
        actions={[
          { label: 'Cliente Retirou', onClick: (id) => handleTransition(id, 'RETIRADO_PELO_CLIENTE'), variant: 'outline' }
        ]}
      />

      {/* Column EM_ROTA (View only for Admin/Cozinha) */}
      <KanbanColumn
        title="Em Rota"
        status="EM_ROTA"
        orders={groupedOrders.EM_ROTA}
        actions={[]}
      />

      {loading && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="animate-spin size-8 text-primary" />
        </div>
      )}
    </div>
  )
}
