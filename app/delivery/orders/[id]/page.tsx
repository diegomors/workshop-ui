'use client'

import { useState, useEffect, use } from 'react'
import dynamic from 'next/dynamic'
import { getOrder } from '@/lib/actions/order'
import { Order } from '@/types/order'
import { calculateDistance, formatDistance } from '@/lib/geo'
import { startPositionSender } from '@/lib/tracking/position-sender'
import { Button } from '@/components/ui/button'
import { DeliveryCodeModal } from '@/components/delivery-code-modal'
import { TrackingIndicator } from '@/components/tracking-indicator'
import { MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Carregando mapa de navegação...</div>
})

const ClientPin = dynamic(() => import('@/components/map/client-pin').then(mod => mod.ClientPin), { ssr: false })
const DeliveryPin = dynamic(() => import('@/components/map/delivery-pin').then(mod => mod.DeliveryPin), { ssr: false })

type DeliveryOrderPageProps = {
  params: Promise<{ id: string }>
}

export default function DeliveryOrderPage({ params }: DeliveryOrderPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [delivererPos, setDelivererPos] = useState<[number, number] | null>(null)
  const [trackingActive, setTrackingActive] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)

  // Load order
  useEffect(() => {
    async function load() {
      const data = await getOrder(id)
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [id])

  // Start position tracking & sending when order is EM_ROTA
  useEffect(() => {
    if (!order || order.status !== 'EM_ROTA') return

    // Track local position for map display
    let watchId: number | null = null
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setDelivererPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true }
      )
    }

    // Send position to server every 5 seconds
    const stopSending = startPositionSender({
      orderId: order.id,
      intervalMs: 5000,
      onStatusChange: setTrackingActive,
      onError: (err) => toast.error(err)
    })

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      stopSending()
    }
  }, [order?.id, order?.status])

  const handleDeliverySuccess = () => {
    setIsCodeModalOpen(false)
    toast.success('Entrega confirmada!')
    router.push('/delivery')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Pedido não encontrado</p>
      </div>
    )
  }

  const clientPos: [number, number] | null = order.customer_latitude != null && order.customer_longitude != null
    ? [order.customer_latitude, order.customer_longitude]
    : null

  const distance = delivererPos && clientPos
    ? calculateDistance(
        { lat: delivererPos[0], lng: delivererPos[1] },
        { lat: clientPos[0], lng: clientPos[1] }
      )
    : null

  const center: [number, number] = delivererPos || clientPos || [-23.5505, -46.6333]
  const isEnRoute = order.status === 'EM_ROTA'

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b shadow-sm z-[1001] flex items-center justify-between">
        <h1 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <div className="flex items-center gap-3">
          {isEnRoute && <TrackingIndicator isActive={trackingActive} />}
          <div className="px-2.5 py-1 bg-warning-1 text-warning-2 text-xs font-black rounded-full uppercase tracking-wider">
            {order.status}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView center={center} zoom={15}>
          {clientPos && <ClientPin position={clientPos} />}
          {delivererPos && <DeliveryPin position={delivererPos} />}
        </MapView>

        {/* Distance overlay */}
        {distance !== null && (
          <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-card/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-3 max-w-xs mx-auto text-center pointer-events-auto">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Distância até o Cliente</p>
              <p className="text-2xl font-black text-primary mt-1">{formatDistance(distance)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-card border-t p-4 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link href={`/delivery/orders/${order.id}/chat`} className="flex-1">
          <Button variant="outline" className="w-full h-12 font-bold gap-2 text-slate-700">
            <MessageCircle className="w-5 h-5" />
            Chat
          </Button>
        </Link>
        {isEnRoute && (
          <Button
            variant="default"
            className="flex-1 h-12 font-bold gap-2 bg-positive-2 hover:bg-positive-2/90"
            onClick={() => setIsCodeModalOpen(true)}
          >
            <CheckCircle className="w-5 h-5" />
            Entreguei
          </Button>
        )}
      </div>

      <DeliveryCodeModal
        orderId={order.id}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSuccess={handleDeliverySuccess}
      />
    </div>
  )
}
