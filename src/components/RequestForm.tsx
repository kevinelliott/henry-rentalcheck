'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Property, Unit, RequestType } from '@/lib/types'

const REQUEST_TYPES: RequestType[] = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Other']

export function RequestForm() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [token, setToken] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    property_id: '',
    unit_id: '',
    tenant_name: '',
    tenant_phone: '',
    unit_number: '',
    request_type: '' as RequestType | '',
    description: '',
    urgency: 'medium',
  })

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => setProperties(data || []))
      .catch(() => setProperties([]))
  }, [])

  useEffect(() => {
    if (!form.property_id) {
      setUnits([])
      setForm((f) => ({ ...f, unit_id: '' }))
      return
    }
    fetch(`/api/units?propertyId=${form.property_id}`)
      .then((r) => r.json())
      .then((data) => setUnits(data || []))
      .catch(() => setUnits([]))
  }, [form.property_id])

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.tenant_name.trim()) errs.tenant_name = 'Your name is required.'
    if (!form.request_type) errs.request_type = 'Please select a request type.'
    if (!form.description.trim()) errs.description = 'Please describe the issue.'
    if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrors({ form: data.error || 'Submission failed. Please try again.' })
        return
      }
      const data = await res.json()
      setToken(data.token)
      setSubmitted(true)
    } catch {
      setErrors({ form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your maintenance request has been received. Use the link below to track its status.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Your tracking token</p>
            <p className="font-mono text-sm text-gray-800 break-all">{token}</p>
          </div>
          <button
            onClick={() => router.push(`/status/${token}`)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Track My Request
          </button>
          <button
            onClick={() => {
              setSubmitted(false)
              setToken('')
              setForm({
                property_id: '',
                unit_id: '',
                tenant_name: '',
                tenant_phone: '',
                unit_number: '',
                request_type: '',
                description: '',
                urgency: 'medium',
              })
            }}
            className="mt-3 w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Maintenance Request</h1>
          <p className="text-gray-500 mt-1 text-sm">Fill out the form below and we'll get back to you shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errors.form}
            </div>
          )}

          {/* Property & Unit */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  value={form.property_id}
                  onChange={(e) => set('property_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a property (optional)</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.address ? ` — ${p.address}` : ''}</option>
                  ))}
                </select>
              </div>

              {units.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={form.unit_id}
                    onChange={(e) => set('unit_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select unit (optional)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.unit_number}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Tenant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.tenant_name}
                onChange={(e) => set('tenant_name', e.target.value)}
                placeholder="Jane Smith"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tenant_name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.tenant_name && <p className="text-red-600 text-xs mt-1">{errors.tenant_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.tenant_phone}
                onChange={(e) => set('tenant_phone', e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {!form.unit_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
              <input
                type="text"
                value={form.unit_number}
                onChange={(e) => set('unit_number', e.target.value)}
                placeholder="e.g. Apt 3B"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REQUEST_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('request_type', type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.request_type === type
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.request_type && <p className="text-red-600 text-xs mt-1">{errors.request_type}</p>}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'low', label: 'Low', color: 'green' },
                { value: 'medium', label: 'Medium', color: 'yellow' },
                { value: 'high', label: 'High', color: 'orange' },
                { value: 'emergency', label: 'Emergency', color: 'red' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('urgency', value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.urgency === value
                      ? color === 'green'
                        ? 'bg-green-600 text-white border-green-600'
                        : color === 'yellow'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : color === 'orange'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Please describe the problem in detail — what happened, where it is, and how long it's been an issue..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already submitted?{' '}
          <a href="/status" className="text-blue-500 hover:underline">
            Track your request
          </a>
        </p>
      </div>
    </div>
  )
}
