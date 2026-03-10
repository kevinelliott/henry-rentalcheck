'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel, formatDate, formatDateTime } from '@/lib/utils'
import type { MaintenanceRequest, Property, RequestStatusHistory } from '@/lib/types'

interface RequestWithProperty extends MaintenanceRequest {
  property: Property
}

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<RequestWithProperty | null>(null)
  const [history, setHistory] = useState<RequestStatusHistory[]>([])
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const { data: req } = await supabase
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .eq('id', id)
        .single()

      if (!req) {
        router.replace('/dashboard/requests')
        return
      }

      setRequest(req as RequestWithProperty)
      setStatus(req.status)
      setNotes(req.landlord_notes || '')

      const { data: hist } = await supabase
        .from('request_status_history')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: true })

      setHistory(hist || [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleSave() {
    if (!request) return
    setSaving(true)
    setSaved(false)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const oldStatus = request.status
    const statusChanged = status !== oldStatus

    await supabase
      .from('maintenance_requests')
      .update({ status, landlord_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (statusChanged) {
      await supabase.from('request_status_history').insert({
        request_id: id,
        old_status: oldStatus,
        new_status: status,
        note: notes || null,
      })
    }

    // Refresh
    const { data: req } = await supabase
      .from('maintenance_requests')
      .select('*, property:properties(*)')
      .eq('id', id)
      .single()
    const { data: hist } = await supabase
      .from('request_status_history')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: true })

    setRequest(req as RequestWithProperty)
    setHistory(hist || [])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!request) return null

  const statusSteps: Array<MaintenanceRequest['status']> = ['submitted', 'acknowledged', 'in_progress', 'resolved']

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/requests" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to requests
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Maintenance Request</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeClass(request.urgency)}`}>
                  {request.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Property</div>
                  <div className="text-sm text-gray-900">{request.property?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Unit</div>
                  <div className="text-sm text-gray-900">{request.unit_number}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tenant</div>
                  <div className="text-sm text-gray-900">{request.tenant_name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</div>
                  <div className="text-sm text-gray-900">{request.category}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Submitted</div>
                  <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</div>
                <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status Timeline</h2>
              <div className="flex items-center gap-0 mb-6">
                {statusSteps.map((step, i) => {
                  const currentIndex = statusSteps.indexOf(request.status as MaintenanceRequest['status'])
                  const stepIndex = i
                  const isCompleted = stepIndex <= currentIndex
                  const isCurrent = stepIndex === currentIndex
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        <div className={`text-xs mt-1 font-medium ${isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {getStatusLabel(step)}
                        </div>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${stepIndex < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {history.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">History</div>
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-700">
                          {entry.old_status ? (
                            <><span className="font-medium">{getStatusLabel(entry.old_status)}</span> → <span className="font-medium">{getStatusLabel(entry.new_status)}</span></>
                          ) : (
                            <span className="font-medium">Created as {getStatusLabel(entry.new_status)}</span>
                          )}
                        </div>
                        {entry.note && <div className="text-xs text-gray-500 mt-0.5">{entry.note}</div>}
                        <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: status management */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Manage Request</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this request..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Notes are visible to the tenant on the status page.</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    saved
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } disabled:opacity-50`}
                >
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tenant Status Link</div>
              <Link
                href={`/status/${request.request_token}`}
                target="_blank"
                className="text-xs text-indigo-600 hover:text-indigo-700 break-all"
              >
                /status/{request.request_token}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
