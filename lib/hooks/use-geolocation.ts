'use client'

import { useState, useEffect, useCallback } from 'react'

export type GeolocationState = {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

/**
 * Hook to manage browser geolocation.
 * Requests permission on mount and tracks position changes.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não suportada',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        let errorMessage = 'Falha ao obter localização'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permissão negada para geolocalização'
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
      },
      { enableHighAccuracy: true }
    )
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  return { ...state, requestPermission }
}
