'use client'

import { useState, useEffect, useCallback } from 'react'
import { MaintenanceRequest } from '@/lib/types'
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '@/lib/utils'

const DEMO_LANDLORD_ID = '00000000-0000-0000-0000-000000000001'

interface RequestWithUnit extends MaintenanceRequest {
  unit?: {
    unit_number: string
    property?: {
      name: string
    }
  }
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestWithUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RequestWithUnit | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)

      const res = await fetch(`/api/v1/requests?${params.toString()}`)
      const json = await res.json()
      setRequests(json.data || [])
    } catch (err) {
      console.error('Failed to fetch requests', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true
    return r.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === 'open').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  }

  function openPanel(req: RequestWithUnit) {
    setSelectedRequest(req)
    setEditStatus(req.status)
    setEditNotes(req.notes || '')
    setSaveSuccess(false)
  }

  function closePanel() {
    setSelectedRequest(null)
    setSaveSuccess(false)
  }

  async function handleSave() {
    if (!selectedRequest) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      })
      if (res.ok) {
        setSaveSuccess(true)
        await fetchRequests()
        // Update selected request
        setSelectedRequest((prev) => prev ? { ...prev, status: editStatus as MaintenanceRequest['status'], notes: editNotes } : null)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this maintenance request? This cannot be undone.')) return
    await fetch(`/api/v1/requests/${id}`, { method: 'DELETE' })
    if (selectedRequest?.id === id) closePanel()
    await fetchRequests()
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage all maintenance requests across your properties
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                Demo landlord
              </span>
              <span className="text-xs text-gray-400 font-mono">{DEMO_LANDLORD_ID.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total requests', value: stats.total, color: 'text-gray-900' },
            { label: 'Open', value: stats.open, color: 'text-yellow-600' },
            { label: 'In progress', value: stats.inProgress, color: 'text-blue-600' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tenant portal links */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-lg">🔗</span>
            <div>
              <div className="text-sm font-semibold text-indigo-900 mb-1">Tenant portal links (demo)</div>
              <div className="space-y-1">
                <div className="text-xs text-indigo-700">
                  Unit 1A: <a href="/tenant/11111111-1111-1111-1111-111111111111" className="underline font-mono" target="_blank">/tenant/11111111-1111-1111-1111-111111111111</a>
                </div>
                <div className="text-xs text-indigo-700">
                  Unit 2B: <a href="/tenant/22222222-2222-2222-2222-222222222222" className="underline font-mono" target="_blank">/tenant/22222222-2222-2222-2222-222222222222</a>
                </div>
                <div className="text-xs text-indigo-700">
                  Unit 101: <a href="/tenant/33333333-3333-3333-3333-333333333333" className="underline font-mono" target="_blank">/tenant/33333333-3333-3333-3333-333333333333</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Main layout: table + panel */}
        <div className={`flex gap-6 ${selectedRequest ? 'items-start' : ''}`}>
          {/* Requests table */}
          <div className={`${selectedRequest ? 'flex-1 min-w-0' : 'w-full'}`}>
            {loading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 text-sm">No maintenance requests found.</p>
                {(statusFilter || priorityFilter || searchQuery) && (
                  <button
                    onClick={() => { setStatusFilter(''); setPriorityFilter(''); setSearchQuery('') }}
                    className="mt-3 text-indigo-600 text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Unit</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Property</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req, i) => (
                      <tr
                        key={req.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedRequest?.id === req.id ? 'bg-indigo-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                        onClick={() => openPanel(req)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-[180px]">{req.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px] mt-0.5">{req.description}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                          {req.unit?.unit_number || '—'}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                          {req.unit?.property?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                          {formatDate(req.submitted_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(req.id) }}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                  Showing {filteredRequests.length} of {requests.length} requests
                </div>
              </div>
            )}
          </div>

          {/* Inline panel */}
          {selectedRequest && (
            <div className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm sticky top-24">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Request details</h3>
                <button
                  onClick={closePanel}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Title</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedRequest.title}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{selectedRequest.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Unit</div>
                    <div className="text-sm text-gray-700">{selectedRequest.unit?.unit_number || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Submitted</div>
                    <div className="text-sm text-gray-700">{formatDate(selectedRequest.submitted_at)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Priority</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Update status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Internal notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this request..."
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } disabled:opacity-60`}
                >
                  {saving ? 'Saving...' : saveSuccess ? '✓ Saved' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
