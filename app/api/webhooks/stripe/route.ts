/**
 * Stripe webhook handler.
 * Processes payment events and creates orders.
 * See PRD-05 US-05.4: webhook confirmation.
 */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@supabase/ssr'
import type Stripe from 'stripe'

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook/stripe] Invalid signature:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Idempotency check: skip if event already processed
  const { data: existingEvent } = await supabase
    .from('payment_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        // Log the event
        await supabase.from('payment_events').insert({
          event_type: event.type,
          stripe_event_id: event.id,
          payload: paymentIntent as unknown as Record<string, unknown>,
        })

        // Create the order from metadata
        const items = JSON.parse(metadata.items_json || '[]')
        const subtotal = items.reduce(
          (sum: number, item: { subtotal: number }) => sum + item.subtotal,
          0
        )
        const serviceFee = Math.round(subtotal * 10) / 100
        const total = subtotal + serviceFee
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString()

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: metadata.restaurant_id,
            customer_id: metadata.customer_id,
            status: 'REALIZADO',
            total,
            service_fee: serviceFee,
            payment_intent_id: paymentIntent.id,
            delivery_code: deliveryCode,
            notes: metadata.notes || null,
          })
          .select()
          .single()

        if (orderError) {
          console.error('[webhook/stripe] Failed to create order:', orderError.message)
          return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
        }

        // Insert order items
        const orderItems = items.map(
          (item: { menuItemId: string; quantity: number; unitPrice: number; modifiers: { name: string; price: number }[]; subtotal: number }) => ({
            order_id: order.id,
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            modifiers_json: item.modifiers,
            subtotal: item.subtotal,
          })
        )

        await supabase.from('order_items').insert(orderItems)

        // Initial status history
        await supabase.from('order_status_history').insert({
          order_id: order.id,
          to_status: 'REALIZADO',
          changed_by: metadata.customer_id,
        })

        // Update payment_events with order_id
        await supabase
          .from('payment_events')
          .update({ order_id: order.id })
          .eq('stripe_event_id', event.id)

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await supabase.from('payment_events').insert({
          event_type: event.type,
          stripe_event_id: event.id,
          payload: paymentIntent as unknown as Record<string, unknown>,
        })

        console.warn('[webhook/stripe] Payment failed:', paymentIntent.id)
        break
      }

      default:
        // Log unhandled events for debugging
        await supabase.from('payment_events').insert({
          event_type: event.type,
          stripe_event_id: event.id,
          payload: event.data.object as unknown as Record<string, unknown>,
        })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook/stripe] Processing error:', message)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
