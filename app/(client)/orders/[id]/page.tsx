'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrder, transitionOrder } from '@/lib/actions/order'
import { OrderWithDetails, OrderStatus } from '@/types/order'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderTimeline } from '@/components/order-timeline'
import { getStatusMessage } from '@/lib/order-machine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CancelOrderModal } from '@/components/cancel-order-modal'

type OrderTrackingProps = {
  params: Promise<{ id: string }>
}

export default function OrderTracking({ params }: OrderTrackingProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadOrder() {
      const data = await getOrder(id)
      setOrder(data)
      setLoading(false)
    }

    loadOrder()

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        async () => {
          // Re-fetch everything on any update (status change)
          const data = await getOrder(id)
          if (data) {
            setOrder(data)
            toast.info(getStatusMessage(data.status))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, supabase])

  const handleCancelConfirm = async () => {
    setCancelling(true)
    const result = await transitionOrder({ order_id: id, new_status: 'CANCELADO' })
    setCancelling(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pedido cancelado com sucesso.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
        <Link href="/orders" className="text-primary hover:underline mt-4 inline-block">
          Voltar para meus pedidos
        </Link>
      </div>
    )
  }

  const canCancel = order.status === 'REALIZADO' || order.status === 'CONFIRMADO'

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8 mb-20 animate-in fade-in duration-500">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" />
        Voltar para Meus Pedidos
      </Link>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(-4).toUpperCase()}</h1>
          <OrderStatusBadge status={order.status} className="scale-110" />
        </div>
        <p className="text-lg font-medium text-primary">
          {getStatusMessage(order.status)}
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden border-2 border-primary/10">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-sm uppercase tracking-wider text-primary">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <OrderTimeline history={order.status_history} />
          </CardContent>
        </Card>

        {order.delivery_code && (order.status === 'PRONTO_PARA_RETIRADA' || order.status === 'EM_ROTA') && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
            <CardContent className="p-6 text-center space-y-2">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Código de Entrega</span>
              <div className="text-4xl font-black tracking-[0.5em] text-yellow-900 dark:text-yellow-200 pl-[0.5em]">
                {order.delivery_code}
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                Informe este código ao entregador para confirmar o recebimento.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {order.order_items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{item.quantity}x Item do Cardápio</p>
                    {item.modifiers_json.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {item.modifiers_json.map(m => m.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-bold whitespace-nowrap">R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 bg-muted/30 border-t flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ {(order.total - order.service_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxa de Serviço</span>
              <span>R$ {order.service_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span className="text-primary">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {canCancel && (
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={cancelling}
          >
            {cancelling ? <Loader2 className="animate-spin" /> : 'Cancelar Pedido'}
          </Button>
        )}
      </div>

      <CancelOrderModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        orderId={id}
      />
    </div>
  )
}
