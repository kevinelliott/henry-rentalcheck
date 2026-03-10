'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Property } from '@/lib/types'

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Other']
const URGENCY_OPTIONS = ['Low', 'Medium', 'High', 'Emergency']

export default function SubmitPage() {
  const params = useParams()
  const propertyToken = params.propertyToken as string

  const [property, setProperty] = useState<Property | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [requestToken, setRequestToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [tenantName, setTenantName] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('Medium')

  useEffect(() => {
    async function loadProperty() {
      if (propertyToken === 'demo-token') {
        setProperty({ id: 'demo', user_id: 'demo', name: 'Demo Property', address: '123 Demo Street', property_token: 'demo-token', created_at: new Date().toISOString() })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('property_token', propertyToken)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProperty(data)
      }
      setLoading(false)
    }
    loadProperty()
  }, [propertyToken])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyToken,
          tenantName: tenantName.trim(),
          unitNumber: unitNumber.trim(),
          category,
          description: description.trim(),
          urgency,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit request. Please try again.')
        setSubmitting(false)
        return
      }

      setRequestToken(data.requestToken)
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Link not found</h1>
          <p className="text-gray-500 text-sm">
            This maintenance request link is invalid or has expired. Please contact your landlord for the correct link.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Your maintenance request has been received. You can track its status using the link below.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
            <div className="text-sm font-semibold text-indigo-900 mb-2">Track your request</div>
            <Link
              href={`/status/${requestToken}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline break-all"
            >
              {typeof window !== 'undefined' ? window.location.origin : ''}/status/{requestToken}
            </Link>
            <p className="text-xs text-indigo-600 mt-2">Save this link to check the status of your request.</p>
          </div>
          <Link
            href={`/status/${requestToken}`}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            View Request Status →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">🏠</div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{property?.name}</h1>
              <p className="text-sm text-gray-500">{property?.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Submit Maintenance Request</h2>
          <p className="text-sm text-gray-500 mb-6">No account needed. Fill out the form and we&apos;ll take care of the rest.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="tenantName"
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="unitNumber"
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g., 1A, 204, Ground Floor"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Describe the issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please describe the issue in detail — when it started, how severe it is, and any relevant context."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {URGENCY_OPTIONS.map((opt) => (
                  <label key={opt} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={opt}
                      checked={urgency === opt}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="sr-only peer"
                    />
                    <div className={`border-2 rounded-lg p-2.5 text-center transition-all text-xs font-medium peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 ${
                      urgency === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                    } ${opt === 'Emergency' ? 'peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700' : ''}`}>
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
              {urgency === 'Emergency' && (
                <p className="text-xs text-red-600 mt-2">
                  For life-threatening emergencies, call 911 immediately.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
