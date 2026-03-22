'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

type CardPaymentFormProps = {
  clientSecret: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function CardPaymentForm({ onSuccess, onError }: CardPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.origin + '/checkout/confirmation',
      },
    })

    if (error) {
      // PRD-05: specific error messages
      if (error.code === 'card_declined') {
        onError('Pagamento não aprovado. Verifique os dados ou tente outro cartão.')
      } else if (error.code === 'insufficient_funds') {
        onError('Saldo insuficiente. Tente outro cartão.')
      } else {
        onError(error.message || 'Erro no pagamento. Tente novamente.')
      }
      setLoading(false)
      return
    }

    // Payment succeeded (no redirect needed)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-semibold text-lg">Dados do Cartão</h2>
      <PaymentElement />
      <Button
        type="submit"
        size="lg"
        className="w-full text-lg"
        disabled={!stripe || loading}
      >
        {loading ? 'Processando pagamento...' : 'Confirmar Pagamento'}
      </Button>
    </form>
  )
}
