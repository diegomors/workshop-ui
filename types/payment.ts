export type PaymentEvent = {
  id: string
  order_id: string
  event_type: string
  stripe_event_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export type PaymentMethod = 'card' | 'pix'

export type PixPaymentData = {
  qrCode: string
  qrCodeUrl: string
  expiresAt: string
}

export type PaymentIntentResult = {
  clientSecret: string
  paymentIntentId: string
}

export type StripeAccountStatus = {
  isActive: boolean
  detailsSubmitted: boolean
}
