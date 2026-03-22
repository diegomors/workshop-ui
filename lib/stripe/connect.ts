/**
 * Stripe Connect helpers for restaurant onboarding and split payments.
 */
import { stripe } from './client'

/**
 * Creates a Stripe Connect onboarding link for a restaurant.
 */
export async function createConnectOnboardingLink(
  stripeAccountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  })
  return accountLink.url
}

/**
 * Creates a new Stripe Connect Standard account.
 */
export async function createConnectAccount(): Promise<string> {
  const account = await stripe.accounts.create({
    type: 'standard',
  })
  return account.id
}

/**
 * Checks whether a connected account has completed onboarding.
 */
export async function getConnectAccountStatus(stripeAccountId: string): Promise<{
  isActive: boolean
  detailsSubmitted: boolean
}> {
  const account = await stripe.accounts.retrieve(stripeAccountId)
  return {
    isActive: account.charges_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  }
}

/**
 * Creates a PaymentIntent with automatic split (90% restaurant, 10% Mizz).
 */
export async function createPaymentIntentWithSplit(params: {
  amountInCents: number
  restaurantStripeAccountId: string
  metadata: Record<string, string>
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // 90% goes to the restaurant
  const restaurantAmount = Math.round(params.amountInCents * 0.9)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountInCents,
    currency: 'brl',
    payment_method_types: ['card', 'pix'],
    transfer_data: {
      amount: restaurantAmount,
      destination: params.restaurantStripeAccountId,
    },
    metadata: params.metadata,
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Creates a full refund for a PaymentIntent.
 */
export async function refundPaymentIntent(paymentIntentId: string): Promise<string> {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reverse_transfer: true,
  })
  return refund.id
}
