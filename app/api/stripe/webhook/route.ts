import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  const body = await request.text()

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('Stripe webhook error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  console.log('Stripe webhook event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId || !session.subscription || !session.customer) break

        // Determine plan from the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan,
            status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing Stripe webhook:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function getPlanFromPriceId(priceId: string): 'free' | 'starter' | 'growth' {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth'
  return 'free'
}
