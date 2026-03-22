'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLatestDelivererPosition } from '@/lib/actions/chat'
import { DeliveryPosition } from '@/types/chat'

type UseDeliveryTrackingReturn = {
  position: DeliveryPosition | null
  loading: boolean
  lastUpdateSeconds: number | null
  isStale: boolean // true if last update was > 30s ago
}

/**
 * Hook for real-time delivery tracking via Supabase Realtime.
 * Subscribes to delivery_tracking inserts for the given order.
 */
export function useDeliveryTracking(orderId: string): UseDeliveryTrackingReturn {
  const [position, setPosition] = useState<DeliveryPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdateSeconds, setLastUpdateSeconds] = useState<number | null>(null)
  const supabase = useRef(createClient()).current

  // Load latest position on mount
  useEffect(() => {
    async function load() {
      const data = await getLatestDelivererPosition(orderId)
      if (data) setPosition(data)
      setLoading(false)
    }
    load()
  }, [orderId])

  // Subscribe to realtime position updates
  useEffect(() => {
    const channel = supabase
      .channel(`tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          setPosition(payload.new as DeliveryPosition)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  // Calculate staleness every second
  useEffect(() => {
    if (!position) return

    const interval = setInterval(() => {
      const createdAt = new Date(position.created_at).getTime()
      const now = Date.now()
      setLastUpdateSeconds(Math.floor((now - createdAt) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [position])

  const isStale = lastUpdateSeconds !== null && lastUpdateSeconds > 30

  return { position, loading, lastUpdateSeconds, isStale }
}
