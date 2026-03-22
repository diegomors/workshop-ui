'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Order } from '@/types/order'
import { calculateDistance, formatDistance } from '@/lib/geo'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle } from 'lucide-react'

// Dynamic imports for Leaflet-dependent components
const MapView = dynamic(() => import('./map-view'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Carregando mapa de navegação...</div>
})

const ClientPin = dynamic(() => import('./client-pin').then(mod => mod.ClientPin), { ssr: false })
const DeliveryPin = dynamic(() => import('./delivery-pin').then(mod => mod.DeliveryPin), { ssr: false })

interface DeliveryMapProps {
  order: Order
}

export function DeliveryMap({ order }: DeliveryMapProps) {
  const [delivererPos, setDelivererPos] = useState<[number, number] | null>(null)
  
  // Track deliverer position
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDelivererPos([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const clientPos: [number, number] | null = order.customer_latitude !== null && order.customer_longitude !== null
    ? [order.customer_latitude!, order.customer_longitude!]
    : null

  const distance = delivererPos && clientPos
    ? calculateDistance(
        { lat: delivererPos[0], lng: delivererPos[1] },
        { lat: clientPos[0], lng: clientPos[1] }
      )
    : null

  const center: [number, number] = delivererPos || clientPos || [-23.5505, -46.6333]

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Map Content */}
      <div className="flex-1 relative">
        <MapView center={center} zoom={15}>
          {clientPos && <ClientPin position={clientPos} />}
          {delivererPos && <DeliveryPin position={delivererPos} />}
        </MapView>

        {/* Floating Distance Overlay */}
        {distance !== null && (
          <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-3 max-w-xs mx-auto text-center pointer-events-auto">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Distância até o Cliente</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{formatDistance(distance)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-t p-4 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Button variant="outline" className="flex-1 h-12 font-bold gap-2 text-slate-700">
          <MessageCircle className="w-5 h-5" />
          Chat
        </Button>
        <Button variant="default" className="flex-1 h-12 font-bold gap-2 bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-5 h-5" />
          Entreguei
        </Button>
      </div>
    </div>
  )
}
