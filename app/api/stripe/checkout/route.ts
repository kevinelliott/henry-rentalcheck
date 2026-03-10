import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { priceId, userId } = body

  if (!priceId || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields: priceId, userId' },
      { status: 400 }
    )
  }

  if (!stripe) {
    return NextResponse.json({ url: '/pricing?demo=true' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
