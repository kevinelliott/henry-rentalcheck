'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MaintenanceRequest, RequestStatus } from '@/lib/types'
import { StatusBadge } from '@/components/StatusBadge'
import { UrgencyBadge } from '@/components/UrgencyBadge'
import Link from 'next/link'

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [request, setRequest] = useState<MaintenanceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [status, setStatus] = useState<RequestStatus>('submitted')
  const [notes, setNotes] = useState('')

  const fetchRequest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setRequest(data)
      setStatus(data.status)
      setNotes(data.landlord_notes || '')
    } catch {
      setError('Failed to load request.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, landlord_notes: notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update request.')
        return
      }
      const data = await res.json()
      setRequest(data)
      setSuccess('Request updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="text-center py-24">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to dashboard</Link>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Request Details</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{request.request_type} Repair</h1>
            <p className="text-gray-500 text-sm mt-1">
              Submitted by <span className="font-medium text-gray-700">{request.tenant_name}</span> on {formatDate(request.submitted_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {request.tenant_phone && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
              <p className="text-gray-800">{request.tenant_phone}</p>
            </div>
          )}
          {request.properties && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Property</p>
              <p className="text-gray-800">{request.properties.name}</p>
              {request.properties.address && (
                <p className="text-xs text-gray-400">{request.properties.address}</p>
              )}
            </div>
          )}
          {(request.unit_number || request.units?.unit_number) && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Unit</p>
              <p className="text-gray-800">{request.units?.unit_number || request.unit_number}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
            <p className="text-gray-800">{formatDate(request.updated_at)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
            {request.description}
          </div>
        </div>

        {/* Tenant status link */}
        <div className="mt-4">
          <a
            href={`/status/${request.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View tenant status page
          </a>
        </div>
      </div>

      {/* Update panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-800">Update Request</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{success}</div>
        )}

        {/* Status selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  status === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes for Tenant
            <span className="text-gray-400 font-normal ml-1">(visible to tenant)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any notes or updates for the tenant. E.g., 'A technician will visit on Friday between 2–4pm.'"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
