'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      setEmail(session.user.email || '')
      setUserId(session.user.id)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      setSubscription(sub)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setPortalLoading(false)
    }
  }

  const planLabels: Record<string, string> = {
    free: 'Free',
    starter: 'Starter — $19/mo',
    growth: 'Growth — $49/mo',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and billing</p>
        </div>

        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription</h2>

          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl mb-4">
            <div>
              <div className="text-sm font-semibold text-indigo-900">Current Plan</div>
              <div className="text-lg font-bold text-indigo-700 mt-0.5">
                {subscription ? planLabels[subscription.plan] || subscription.plan : 'Free'}
              </div>
              {subscription && (
                <div className="text-xs text-indigo-600 mt-0.5">
                  Status: {subscription.status}
                </div>
              )}
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
              {subscription?.plan === 'growth' ? 'Growth' : subscription?.plan === 'starter' ? 'Starter' : 'Free'}
            </span>
          </div>

          {(!subscription || subscription.plan === 'free') && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Upgrade to unlock more properties, units, and features.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId: 'price_starter', userId }),
                  }).then(r => r.json()).then(d => d.url && (window.location.href = d.url))}
                  className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Starter — $19/mo
                </button>
                <button
                  onClick={() => fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId: 'price_growth', userId }),
                  }).then(r => r.json()).then(d => d.url && (window.location.href = d.url))}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Growth — $49/mo
                </button>
              </div>
            </div>
          )}

          {subscription && subscription.plan !== 'free' && (
            <button
              onClick={handleBillingPortal}
              disabled={portalLoading}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
