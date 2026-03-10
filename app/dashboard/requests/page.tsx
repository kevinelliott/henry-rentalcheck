'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel, formatDate } from '@/lib/utils'
import type { MaintenanceRequest, Property } from '@/lib/types'

interface RequestWithProperty extends MaintenanceRequest {
  property: Property
}

export default function RequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RequestWithProperty[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const { data: props } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', session.user.id)

      if (!props || props.length === 0) {
        setLoading(false)
        return
      }

      const propertyIds = props.map((p: { id: string }) => p.id)
      let query = supabase
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })

      const { data: reqs } = await query
      setRequests((reqs || []) as RequestWithProperty[])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = requests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false
    if (urgencyFilter && r.urgency !== urgencyFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} of {requests.length} requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All urgency</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {(statusFilter || urgencyFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setUrgencyFilter('') }}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h2>
            <p className="text-sm text-gray-500">
              {requests.length === 0 ? 'No maintenance requests yet across your properties.' : 'No requests match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{req.unit_number}</td>
                      <td className="px-6 py-4 text-gray-600">{req.property?.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{req.category}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs">
                        <span className="truncate block" title={req.description}>
                          {req.description.length > 60 ? req.description.slice(0, 60) + '…' : req.description}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeClass(req.urgency)}`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(req.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/requests/${req.id}`} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
