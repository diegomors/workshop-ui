'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { RestaurantPreview } from '@/types/restaurant'
import RestaurantPopup from '@/components/map/restaurant-popup'

import { useMemo } from 'react'

interface RestaurantPinProps {
  restaurant: RestaurantPreview
  distanceKm?: number
  onClick?: () => void
}

export function RestaurantPin({ restaurant, distanceKm, onClick }: RestaurantPinProps) {
  const orangeIcon = useMemo(() => L.divIcon({
    className: 'custom-pin restaurant-pin',
    html: `<div style="background-color: #f97316; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  }), [])

  if (restaurant.latitude === null || restaurant.longitude === null) return null

  return (
    <Marker 
      position={[restaurant.latitude, restaurant.longitude]} 
      icon={orangeIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <RestaurantPopup restaurant={restaurant} distanceKm={distanceKm} />
      </Popup>
    </Marker>
  )
}
