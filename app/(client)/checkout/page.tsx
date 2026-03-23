'use client'

import { useState } from 'react'
import { useCart } from '@/lib/hooks/use-cart'
import { createPaymentIntent } from '@/lib/actions/payment'
import { CheckoutSummary } from './checkout-summary'
import { PaymentMethodSelector } from './payment-method-selector'
import { CardPaymentForm } from './card-payment-form'
import { PixPayment } from './pix-payment'
import { StripeProvider } from '@/lib/stripe/provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { PaymentMethod } from '@/types/payment'

export default function CheckoutPage() {
  const { state: { items, restaurantId }, totalPrice, dispatch } = useCart()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [agreedToCancellation, setAgreedToCancellation] = useState(false)
  const [notes, setNotes] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <p className="text-muted-foreground mb-6 text-lg">Seu carrinho está vazio.</p>
        <Link href="/">
          <Button>Ver Restaurantes</Button>
        </Link>
      </div>
    )
  }

  const subtotal = totalPrice
  // PRD-05: Taxa de serviço = 10% do subtotal, arredondado a 2 casas decimais
  const serviceFee = Math.round(subtotal * 10) / 100
  const total = subtotal + serviceFee

  const handleProceedToPayment = async () => {
    if (!restaurantId) return
    setLoading(true)
    setError(null)

    const checkoutItems = items.map((item) => {
      const modTotal = item.modifiers.reduce((acc, m) => acc + m.additional_price, 0)
      return {
        menuItemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.price,
        modifiers: item.modifiers.map((m) => ({ name: m.name, price: m.additional_price })),
        subtotal: (item.price + modTotal) * item.quantity,
      }
    })

    const result = await createPaymentIntent({
      restaurantId,
      items: checkoutItems,
      notes: notes || null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setClientSecret(result.data!.clientSecret)
    setPaymentIntentId(result.data!.paymentIntentId)
    setLoading(false)
  }

  const handlePaymentSuccess = () => {
    dispatch({ type: 'CLEAR_CART' })
    router.push(`/checkout/confirmation?payment_intent=${paymentIntentId}`)
  }

  const handlePaymentError = (message: string) => {
    setError(message)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <CheckoutSummary
        items={items}
        subtotal={subtotal}
        serviceFee={serviceFee}
        total={total}
      />

      {/* Notes */}
      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-500 mb-1">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Alguma observação sobre o pedido..."
        />
        <p className="text-xs text-neutral-50 mt-1">{notes.length}/500</p>
      </div>

      {/* Cancellation checkbox - PRD-05 US-05.1 */}
      <div className="mt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToCancellation}
            onChange={(e) => setAgreedToCancellation(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-neutral-500">
            Entendo que após o preparo iniciar, o pedido não pode ser cancelado
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-negative-1 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {!clientSecret ? (
        <>
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
          <Button
            size="lg"
            className="w-full mt-6 text-lg"
            disabled={!agreedToCancellation || loading}
            onClick={handleProceedToPayment}
          >
            {loading ? 'Processando...' : 'Pagar'}
          </Button>
        </>
      ) : (
        <div className="mt-6">
          <StripeProvider clientSecret={clientSecret}>
            {paymentMethod === 'card' ? (
              <CardPaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <PixPayment
                clientSecret={clientSecret}
                onPaid={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </StripeProvider>
        </div>
      )}
    </div>
  )
}
