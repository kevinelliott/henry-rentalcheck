'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel, formatDate } from '@/lib/utils'
import type { Property, Unit, MaintenanceRequest } from '@/lib/types'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [copied, setCopied] = useState(false)

  // Add unit state
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [unitNumber, setUnitNumber] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantEmail, setTenantEmail] = useState('')
  const [addingUnit, setAddingUnit] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const { data: prop } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()

      if (!prop) {
        router.replace('/dashboard/properties')
        return
      }

      setProperty(prop)

      const [{ data: unitData }, { data: reqData }] = await Promise.all([
        supabase.from('units').select('*').eq('property_id', id).order('unit_number'),
        supabase
          .from('maintenance_requests')
          .select('*')
          .eq('property_id', id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setUnits(unitData || [])
      setRequests(reqData || [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault()
    setAddingUnit(true)
    await supabase.from('units').insert({
      property_id: id,
      unit_number: unitNumber.trim(),
      tenant_name: tenantName.trim() || null,
      tenant_email: tenantEmail.trim() || null,
    })
    const { data } = await supabase.from('units').select('*').eq('property_id', id).order('unit_number')
    setUnits(data || [])
    setUnitNumber('')
    setTenantName('')
    setTenantEmail('')
    setShowAddUnit(false)
    setAddingUnit(false)
  }

  function copyLink() {
    if (!property) return
    const url = `${window.location.origin}/submit/${property.property_token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!property) return null

  const submitUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/submit/${property.property_token}`

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/properties" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to properties
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{property.address}</p>
        </div>

        {/* Tenant submit link */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">🔗</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-indigo-900 mb-1">Tenant Submit Link</div>
              <p className="text-xs text-indigo-700 mb-3">
                Share this link with your tenants. They can submit maintenance requests without creating an account.
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs text-indigo-800 flex-1 truncate block">
                  /submit/{property.property_token}
                </code>
                <button
                  onClick={copyLink}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Units ({units.length})</h2>
            <button
              onClick={() => setShowAddUnit(!showAddUnit)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Unit
            </button>
          </div>

          {showAddUnit && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <form onSubmit={handleAddUnit} className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Number *</label>
                  <input
                    type="text"
                    required
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g., 1A"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tenant Name</label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Optional"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tenant Email</label>
                  <input
                    type="email"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="Optional"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingUnit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {addingUnit ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUnit(false)}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {units.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">No units yet. Add units to organize your maintenance requests.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b border-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{unit.unit_number}</td>
                    <td className="px-6 py-3 text-gray-600">{unit.tenant_name || <span className="text-gray-400">—</span>}</td>
                    <td className="px-6 py-3 text-gray-600">{unit.tenant_email || <span className="text-gray-400">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent requests */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Requests ({requests.length})</h2>
            <Link href="/dashboard/requests" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm text-gray-500">No requests yet.</p>
              <a href={submitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 block">
                Open tenant portal →
              </a>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{req.unit_number}</td>
                    <td className="px-6 py-3 text-gray-600">{req.category}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeClass(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(req.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/dashboard/requests/${req.id}`} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
