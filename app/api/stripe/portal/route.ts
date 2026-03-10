import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId } = body as { userId?: string }

  if (!userId) {
    return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 })
  }

  // Get customer ID from subscriptions table
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  const stripe = getStripe()

  if (!stripe || !subscription?.stripe_customer_id) {
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create billing portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
