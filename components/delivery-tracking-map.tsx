'use client'

import dynamic from 'next/dynamic'
import { useDeliveryTracking } from '@/lib/hooks/use-delivery-tracking'
import { calculateDistance, formatDistance } from '@/lib/geo'
import { Loader2, Clock } from 'lucide-react'

const MapView = dynamic(() => import('./map/map-view'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
      Carregando mapa...
    </div>
  )
})
const ClientPin = dynamic(() => import('./map/client-pin').then((mod) => mod.ClientPin), { ssr: false })
const DeliveryPin = dynamic(() => import('./map/delivery-pin').then((mod) => mod.DeliveryPin), { ssr: false })

interface DeliveryTrackingMapProps {
  orderId: string
  customerLatitude: number | null
  customerLongitude: number | null
}

/**
 * Real-time delivery tracking map for the client view.
 * Shows deliverer position (green pin) and customer location (blue pin).
 */
export function DeliveryTrackingMap({ orderId, customerLatitude, customerLongitude }: DeliveryTrackingMapProps) {
  const { position, loading, lastUpdateSeconds, isStale } = useDeliveryTracking(orderId)

  const clientPos: [number, number] | null =
    customerLatitude !== null && customerLongitude !== null
      ? [customerLatitude, customerLongitude]
      : null

  const delivererPos: [number, number] | null =
    position ? [position.latitude, position.longitude] : null

  const distance =
    delivererPos && clientPos
      ? calculateDistance(
          { lat: delivererPos[0], lng: delivererPos[1] },
          { lat: clientPos[0], lng: clientPos[1] }
        )
      : null

  const center: [number, number] = delivererPos || clientPos || [-23.5505, -46.6333]

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-primary/10">
      <div className="h-64">
        <MapView center={center} zoom={15}>
          {clientPos && <ClientPin position={clientPos} />}
          {delivererPos && <DeliveryPin position={delivererPos} />}
        </MapView>
      </div>

      {/* Distance overlay */}
      {distance !== null && (
        <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="bg-card/90 backdrop-blur rounded-lg shadow-md border px-3 py-2 max-w-xs mx-auto text-center pointer-events-auto">
            <p className="text-[10px] font-bold text-neutral-50 uppercase tracking-widest">Distância</p>
            <p className="text-lg font-black text-primary">{formatDistance(distance)}</p>
          </div>
        </div>
      )}

      {/* Stale position warning */}
      {isStale && lastUpdateSeconds !== null && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="bg-warning-1 border border-warning-2/30 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-warning-2">
            <Clock className="size-3.5 shrink-0" />
            Última posição: {lastUpdateSeconds}s atrás
          </div>
        </div>
      )}

      {/* No tracking data */}
      {!delivererPos && !loading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/10">
          <div className="bg-card rounded-lg shadow-md px-4 py-3 text-sm text-muted-foreground text-center">
            Aguardando localização do entregador...
          </div>
        </div>
      )}
    </div>
  )
}
