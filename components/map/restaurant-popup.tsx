'use client'

import React from 'react'
import Link from 'next/link'
import { RestaurantPreview } from '@/types/restaurant'
import { formatDistance } from '@/lib/geo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RestaurantPopupProps {
  restaurant: RestaurantPreview
  distanceKm?: number
}

export default function RestaurantPopup({ restaurant, distanceKm }: RestaurantPopupProps) {
  return (
    <div className="flex flex-col gap-2 p-1 min-w-[200px]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-base leading-tight">{restaurant.name}</h3>
        {distanceKm !== undefined && (
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            {formatDistance(distanceKm)}
          </span>
        )}
      </div>
      
      {restaurant.description && (
        <p className="text-sm text-slate-600 line-clamp-2">
          {restaurant.description}
        </p>
      )}

      <Link 
        href={`/restaurant/${restaurant.id}`}
        className={cn(buttonVariants({ size: 'sm' }), "mt-1 w-full font-semibold")}
      >
        Ver Cardápio
      </Link>
    </div>
  )
}
