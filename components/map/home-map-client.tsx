'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useGeolocation } from '@/lib/hooks/use-geolocation'
import { RestaurantPreview } from '@/types/restaurant'
import { calculateDistance } from '@/lib/geo'
import { MapSearchBar } from './map-search-bar'
import { LocationBanner } from './location-banner'
import { MapPin, Search } from 'lucide-react'

// Dynamic import for Leaflet-dependent MapView
const MapView = dynamic(() => import('./map-view'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">Carregando mapa...</div>
})

// Dynamic imports for pins to avoid SSR issues with Leaflet instances
const RestaurantPin = dynamic(() => import('./restaurant-pin').then(mod => mod.RestaurantPin), { ssr: false })
const ClientPin = dynamic(() => import('./client-pin').then(mod => mod.ClientPin), { ssr: false })

interface HomeMapClientProps {
  initialRestaurants: RestaurantPreview[]
}

const DEFAULT_CENTER: [number, number] = [-23.5505, -46.6333] // SP Central
const DEFAULT_ZOOM = 14

export function HomeMapClient({ initialRestaurants }: HomeMapClientProps) {
  const { latitude, longitude, error, requestPermission } = useGeolocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState<RestaurantPreview[]>(initialRestaurants)

  // Filter restaurants based on search query and (optionally) radius
  const filteredRestaurants = useMemo(() => {
    let result = restaurants

    // Filter by name (client-side)
    if (searchQuery.trim()) {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort by distance if location available
    if (latitude !== null && longitude !== null) {
      return [...result].sort((a, b) => {
        if (a.latitude === null || b.latitude === null) return 0
        const distA = calculateDistance({ lat: latitude, lng: longitude }, { lat: a.latitude, lng: a.longitude! })
        const distB = calculateDistance({ lat: latitude, lng: longitude }, { lat: b.latitude, lng: b.longitude! })
        return distA - distB
      })
    }

    return result
  }, [restaurants, searchQuery, latitude, longitude])

  const mapCenter: [number, number] = latitude !== null && longitude !== null 
    ? [latitude, longitude] 
    : DEFAULT_CENTER

  const showLocationBanner = latitude === null || error !== null

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Search Bar Overlay */}
      <MapSearchBar onSearch={setSearchQuery} />

      {/* Map Content */}
      <MapView center={mapCenter} zoom={DEFAULT_ZOOM}>
        {latitude !== null && longitude !== null && (
          <ClientPin position={[latitude, longitude]} />
        )}

        {filteredRestaurants.map(restaurant => {
          if (restaurant.latitude === null || restaurant.longitude === null) return null
          
          let dist: number | undefined
          if (latitude !== null && longitude !== null) {
            dist = calculateDistance(
              { lat: latitude, lng: longitude }, 
              { lat: restaurant.latitude, lng: restaurant.longitude }
            )
          }

          return (
            <RestaurantPin 
              key={restaurant.id} 
              restaurant={restaurant} 
              distanceKm={dist} 
            />
          )
        })}
      </MapView>

      {/* Location Request Banner */}
      {showLocationBanner && (
        <LocationBanner onRequestPermission={requestPermission} />
      )}

      {/* Bottom Floating Stats / Info (Optional) */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-card/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm border border-slate-200 pointer-events-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
            {filteredRestaurants.length} restaurantes encontrados
          </p>
        </div>
      </div>
    </div>
  )
}
