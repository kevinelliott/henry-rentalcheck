'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Property } from '@/lib/types'

interface PropertyWithStats extends Property {
  unitCount: number
  openRequestCount: number
}

export default function PropertiesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyWithStats[]>([])

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

      if (!props) {
        setLoading(false)
        return
      }

      // Fetch unit counts and open request counts for each property
      const enriched: PropertyWithStats[] = await Promise.all(
        props.map(async (property: Property) => {
          const [{ count: unitCount }, { count: openRequestCount }] = await Promise.all([
            supabase.from('units').select('*', { count: 'exact', head: true }).eq('property_id', property.id),
            supabase
              .from('maintenance_requests')
              .select('*', { count: 'exact', head: true })
              .eq('property_id', property.id)
              .neq('status', 'resolved'),
          ])
          return {
            ...property,
            unitCount: unitCount || 0,
            openRequestCount: openRequestCount || 0,
          }
        })
      )

      setProperties(enriched)
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-sm text-gray-500 mt-1">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">🏠</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h2>
            <p className="text-sm text-gray-500 mb-6">Add your first property to get started with maintenance request tracking.</p>
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Open Requests</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🏠</div>
                        <span className="font-medium text-gray-900">{property.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{property.address}</td>
                    <td className="px-6 py-4 text-gray-700">{property.unitCount}</td>
                    <td className="px-6 py-4">
                      {property.openRequestCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {property.openRequestCount} open
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          All clear
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/properties/${property.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
