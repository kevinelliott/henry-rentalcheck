'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel } from '@/lib/utils'
import type { MaintenanceRequest, Property } from '@/lib/types'

interface RequestWithProperty extends MaintenanceRequest {
  property: Property
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [requests, setRequests] = useState<RequestWithProperty[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setProperties(props || [])

      if (props && props.length > 0) {
        const propertyIds = props.map((p: Property) => p.id)
        const { data: reqs } = await supabase
          .from('maintenance_requests')
          .select('*, property:properties(*)')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(5)

        setRequests((reqs || []) as RequestWithProperty[])
      }

      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const openRequests = requests.filter(r => r.status !== 'resolved')
  const urgentRequests = requests.filter(r => r.urgency === 'Emergency' || r.urgency === 'High')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of your properties and requests</p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Property
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="text-sm text-gray-500 mb-1">Total Properties</div>
            <div className="text-3xl font-bold text-gray-900">{properties.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="text-sm text-gray-500 mb-1">Total Units</div>
            <div className="text-3xl font-bold text-gray-900">—</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="text-sm text-gray-500 mb-1">Open Requests</div>
            <div className="text-3xl font-bold text-gray-900">{openRequests.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="text-sm text-gray-500">Urgent/Emergency</div>
            </div>
            <div className="text-3xl font-bold text-red-600">{urgentRequests.length}</div>
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Requests</h2>
            <Link href="/dashboard/requests" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-3xl mb-3">📋</div>
              <p className="text-sm text-gray-500 mb-4">No maintenance requests yet.</p>
              {properties.length === 0 ? (
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Add your first property →
                </Link>
              ) : (
                <p className="text-xs text-gray-400">Share your property link with tenants to receive requests.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/requests/${req.id}`} className="text-gray-900 hover:text-indigo-600 font-medium">
                          {req.property?.name || '—'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{req.unit_number}</td>
                      <td className="px-6 py-4 text-gray-600">{req.category}</td>
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
                      <td className="px-6 py-4 text-gray-400">{timeAgo(req.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Properties quick view */}
        {properties.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Your Properties</h2>
              <Link href="/dashboard/properties" className="text-sm text-indigo-600 hover:text-indigo-700">
                Manage all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.slice(0, 3).map((property) => (
                <Link
                  key={property.id}
                  href={`/dashboard/properties/${property.id}`}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🏠</div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{property.name}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{property.address}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
