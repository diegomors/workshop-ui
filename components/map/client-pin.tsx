'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

interface ClientPinProps {
  position: [number, number]
}

export function ClientPin({ position }: ClientPinProps) {
  const blueIcon = useMemo(() => L.divIcon({
    className: 'custom-pin client-pin',
    html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  }), [])

  return (
    <Marker position={position} icon={blueIcon} zIndexOffset={1000}>
      <Popup>Você está aqui</Popup>
    </Marker>
  )
}
