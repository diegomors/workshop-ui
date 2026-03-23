'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createStripeConnectLink, getStripeAccountStatus } from '@/lib/actions/payment'
import type { StripeAccountStatus } from '@/types/payment'

type StripeConnectButtonProps = {
  restaurantId: string
  hasStripeAccount: boolean
}

export function StripeConnectButton({ restaurantId, hasStripeAccount }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<StripeAccountStatus | null>(null)

  useEffect(() => {
    if (hasStripeAccount) {
      getStripeAccountStatus(restaurantId).then((result) => {
        if ('data' in result && result.data) setStatus(result.data)
      })
    }
  }, [restaurantId, hasStripeAccount])

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    const result = await createStripeConnectLink(restaurantId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Redirect to Stripe onboarding
    window.location.href = result.data!.url
  }

  if (hasStripeAccount && status) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.isActive ? 'bg-positive-2' : 'bg-warning-2'}`} />
          <span className="text-sm font-medium">
            {status.isActive
              ? 'Conta Stripe ativa — pronta para receber pagamentos'
              : status.detailsSubmitted
                ? 'Conta Stripe em revisão pelo Stripe'
                : 'Onboarding incompleto — clique para completar'}
          </span>
        </div>

        {!status.isActive && (
          <Button variant="outline" onClick={handleConnect} disabled={loading}>
            {loading ? 'Redirecionando...' : 'Completar Configuração'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-negative-2">{error}</p>
      )}
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? 'Redirecionando...' : 'Conectar com Stripe'}
      </Button>
    </div>
  )
}
