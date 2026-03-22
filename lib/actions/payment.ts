/**
 * Server Actions for the payment domain.
 * Handles PaymentIntent creation, refunds, and Stripe Connect onboarding.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { createPaymentIntentWithSplit, refundPaymentIntent } from '@/lib/stripe/connect'
import { createConnectAccount, createConnectOnboardingLink, getConnectAccountStatus } from '@/lib/stripe/connect'
import { createPaymentIntentSchema, CreatePaymentIntentInput } from '@/lib/validations/checkout'
import { PaymentIntentResult, StripeAccountStatus } from '@/types/payment'
import { revalidatePath } from 'next/cache'

type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }

/**
 * Creates a Stripe PaymentIntent with split for the given cart items.
 * See PRD-05 US-05.2/US-05.3: payment via card or Pix.
 */
export async function createPaymentIntent(
  payload: CreatePaymentIntentInput
): Promise<ActionResult<PaymentIntentResult>> {
  try {
    const validated = createPaymentIntentSchema.safeParse(payload)
    if (!validated.success) {
      return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // Fetch restaurant stripe_account_id
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('stripe_account_id')
      .eq('id', validated.data.restaurantId)
      .single()

    if (restError || !restaurant) {
      return { error: 'Restaurante não encontrado' }
    }

    if (!restaurant.stripe_account_id) {
      return { error: 'Este restaurante ainda não aceita pedidos online' }
    }

    // Calculate totals
    const subtotal = validated.data.items.reduce((sum, item) => sum + item.subtotal, 0)
    const serviceFee = Math.round(subtotal * 10) / 100
    const total = subtotal + serviceFee
    const amountInCents = Math.round(total * 100)

    const result = await createPaymentIntentWithSplit({
      amountInCents,
      restaurantStripeAccountId: restaurant.stripe_account_id,
      metadata: {
        customer_id: user.id,
        restaurant_id: validated.data.restaurantId,
        subtotal: subtotal.toString(),
        service_fee: serviceFee.toString(),
        notes: validated.data.notes || '',
        items_json: JSON.stringify(validated.data.items),
      },
    })

    return { data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[payment/createPaymentIntent] Failed:', message)
    return { error: 'Erro de conexão. Tente novamente.' }
  }
}

/**
 * Refunds a payment. Called when order transitions to CANCELADO.
 * See PRD-05 US-05.5: refund on cancellation.
 */
export async function refundPayment(
  paymentIntentId: string
): Promise<ActionResult<{ refundId: string }>> {
  try {
    if (!paymentIntentId) {
      return { error: 'ID do pagamento não fornecido' }
    }

    const supabase = await createClient()

    const refundId = await refundPaymentIntent(paymentIntentId)

    // Log refund event
    await supabase.from('payment_events').insert({
      event_type: 'refund.created',
      payload: { payment_intent_id: paymentIntentId, refund_id: refundId },
    })

    return { data: { refundId } }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[payment/refundPayment] Failed:', message)
    // PRD-05: if refund fails, log error but don't block cancellation
    return { error: message }
  }
}

/**
 * Creates a Stripe Connect onboarding link for a restaurant.
 * See PRD-05 US-05.6: restaurant onboarding.
 */
export async function createStripeConnectLink(
  restaurantId: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // Verify user is admin/owner of this restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id, owner_id, stripe_account_id')
      .eq('id', restaurantId)
      .single()

    if (restError || !restaurant) {
      return { error: 'Restaurante não encontrado' }
    }

    if (restaurant.owner_id !== user.id) {
      return { error: 'Sem permissão para configurar este restaurante' }
    }

    let stripeAccountId = restaurant.stripe_account_id

    // Create a new Stripe Connect account if none exists
    if (!stripeAccountId) {
      stripeAccountId = await createConnectAccount()

      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', restaurantId)

      if (updateError) {
        return { error: 'Erro ao salvar conta Stripe' }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : 'http://localhost:3000'

    const returnUrl = `${baseUrl}/admin/settings?stripe_success=true`
    const refreshUrl = `${baseUrl}/admin/settings?stripe_refresh=true`

    const url = await createConnectOnboardingLink(stripeAccountId, returnUrl, refreshUrl)

    revalidatePath('/admin/settings')
    return { data: { url } }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[payment/createStripeConnectLink] Failed:', message)
    return { error: 'Erro ao criar link do Stripe. Tente novamente.' }
  }
}

/**
 * Gets the Stripe Connect account status for a restaurant.
 * See PRD-05 US-05.6.
 */
export async function getStripeAccountStatus(
  restaurantId: string
): Promise<ActionResult<StripeAccountStatus>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('stripe_account_id, owner_id')
      .eq('id', restaurantId)
      .single()

    if (restError || !restaurant) {
      return { error: 'Restaurante não encontrado' }
    }

    if (restaurant.owner_id !== user.id) {
      return { error: 'Sem permissão' }
    }

    if (!restaurant.stripe_account_id) {
      return { data: { isActive: false, detailsSubmitted: false } }
    }

    const status = await getConnectAccountStatus(restaurant.stripe_account_id)
    return { data: status }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[payment/getStripeAccountStatus] Failed:', message)
    return { error: message }
  }
}
