'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

type PixPaymentProps = {
  clientSecret: string
  onPaid: () => void
  onError: (message: string) => void
}

const PIX_EXPIRATION_MINUTES = 15

export function PixPayment({ clientSecret, onPaid, onError }: PixPaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitted, setSubmitted] = useState(false)
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(PIX_EXPIRATION_MINUTES * 60)

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return

    setLoading(true)
    setExpired(false)
    setTimeLeft(PIX_EXPIRATION_MINUTES * 60)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/checkout/confirmation',
      },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Erro ao processar pagamento Pix.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }, [stripe, elements, onError])

  // Countdown timer
  useEffect(() => {
    if (!submitted || expired) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [submitted, expired])

  // Poll for payment status
  useEffect(() => {
    if (!stripe || !clientSecret || !submitted || expired) return

    const pollInterval = setInterval(async () => {
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
      if (paymentIntent?.status === 'succeeded') {
        clearInterval(pollInterval)
        onPaid()
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [stripe, clientSecret, submitted, expired, onPaid])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (expired) {
    return (
      <div className="flex flex-col items-center py-8 space-y-4">
        <p className="text-red-600 font-medium">QR Code expirado.</p>
        <Button onClick={handleSubmit}>Gerar novo QR Code</Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4">
        <h2 className="font-semibold text-lg">Pague com Pix</h2>
        <p className="text-sm text-gray-500">
          Expira em <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        </p>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-b-2 border-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Aguardando confirmação do pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Pagamento Pix</h2>
      <PaymentElement />
      <Button
        size="lg"
        className="w-full text-lg"
        disabled={!stripe || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Gerando Pix...' : 'Gerar QR Code Pix'}
      </Button>
    </div>
  )
}
