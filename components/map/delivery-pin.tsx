'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

interface DeliveryPinProps {
  position: [number, number]
}

export function DeliveryPin({ position }: DeliveryPinProps) {
  const greenIcon = useMemo(() => L.divIcon({
    className: 'custom-pin delivery-pin',
    html: `<div style="background-color: #22c55e; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  }), [])

  return (
    <Marker position={position} icon={greenIcon} zIndexOffset={500}>
      <Popup>Entregador está aqui</Popup>
    </Marker>
  )
}
