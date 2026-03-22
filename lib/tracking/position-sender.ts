'use client'

import { updateDelivererPosition } from '@/lib/actions/chat'

type PositionSenderOptions = {
  orderId: string
  intervalMs?: number // default 5000
  onError?: (error: string) => void
  onStatusChange?: (active: boolean) => void
}

/**
 * Starts sending the deliverer's GPS position to the server at regular intervals.
 * Returns a cleanup function to stop tracking.
 *
 * Uses navigator.geolocation.watchPosition for continuous updates,
 * then sends to server every intervalMs via the server action.
 */
export function startPositionSender(options: PositionSenderOptions): () => void {
  const { orderId, intervalMs = 5000, onError, onStatusChange } = options

  if (typeof window === 'undefined' || !navigator.geolocation) {
    onError?.('Geolocalização não suportada')
    return () => {}
  }

  let lastPosition: { lat: number; lng: number; accuracy?: number } | null = null
  let stopped = false

  // Watch position continuously
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      lastPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }
      onStatusChange?.(true)
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        onError?.('Ative a localização para rastreamento')
      } else {
        onError?.('Falha ao obter localização')
      }
      onStatusChange?.(false)
    },
    { enableHighAccuracy: true }
  )

  // Send position to server at intervals
  const intervalId = setInterval(async () => {
    if (stopped || !lastPosition) return

    await updateDelivererPosition({
      order_id: orderId,
      latitude: lastPosition.lat,
      longitude: lastPosition.lng,
      accuracy: lastPosition.accuracy
    })
  }, intervalMs)

  // Cleanup function
  return () => {
    stopped = true
    navigator.geolocation.clearWatch(watchId)
    clearInterval(intervalId)
    onStatusChange?.(false)
  }
}
