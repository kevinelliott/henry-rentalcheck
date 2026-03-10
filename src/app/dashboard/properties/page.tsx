'use client'

import { useState, useEffect, useCallback } from 'react'
import { Property, Unit } from '@/lib/types'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Record<string, Unit[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New property form
  const [newPropName, setNewPropName] = useState('')
  const [newPropAddress, setNewPropAddress] = useState('')
  const [addingProp, setAddingProp] = useState(false)
  const [propError, setPropError] = useState('')

  // New unit form (per property)
  const [newUnitNumber, setNewUnitNumber] = useState<Record<string, string>>({})
  const [addingUnit, setAddingUnit] = useState<Record<string, boolean>>({})
  const [unitError, setUnitError] = useState<Record<string, string>>({})

  // Expanded property to show units
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data || [])
    } catch {
      setError('Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  async function fetchUnits(propertyId: string) {
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`)
      const data = await res.json()
      setUnits((u) => ({ ...u, [propertyId]: data || [] }))
    } catch {
      // ignore
    }
  }

  function toggleExpand(propertyId: string) {
    setExpanded((e) => {
      const next = { ...e, [propertyId]: !e[propertyId] }
      if (next[propertyId] && !units[propertyId]) {
        fetchUnits(propertyId)
      }
      return next
    })
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault()
    if (!newPropName.trim()) {
      setPropError('Property name is required.')
      return
    }
    setPropError('')
    setAddingProp(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPropName.trim(), address: newPropAddress.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setPropError(data.error || 'Failed to create property.')
        return
      }
      setNewPropName('')
      setNewPropAddress('')
      fetchProperties()
    } catch {
      setPropError('Network error.')
    } finally {
      setAddingProp(false)
    }
  }

  async function handleDeleteProperty(id: string, name: string) {
    if (!confirm(`Delete property "${name}"? This will also delete all units.`)) return
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      fetchProperties()
      setUnits((u) => {
        const next = { ...u }
        delete next[id]
        return next
      })
    } catch {
      // ignore
    }
  }

  async function handleAddUnit(e: React.FormEvent, propertyId: string) {
    e.preventDefault()
    const unitNum = newUnitNumber[propertyId]?.trim()
    if (!unitNum) {
      setUnitError((errs) => ({ ...errs, [propertyId]: 'Unit number is required.' }))
      return
    }
    setUnitError((errs) => ({ ...errs, [propertyId]: '' }))
    setAddingUnit((a) => ({ ...a, [propertyId]: true }))
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, unit_number: unitNum }),
      })
      if (!res.ok) {
        const data = await res.json()
        setUnitError((errs) => ({ ...errs, [propertyId]: data.error || 'Failed to add unit.' }))
        return
      }
      setNewUnitNumber((n) => ({ ...n, [propertyId]: '' }))
      fetchUnits(propertyId)
    } catch {
      setUnitError((errs) => ({ ...errs, [propertyId]: 'Network error.' }))
    } finally {
      setAddingUnit((a) => ({ ...a, [propertyId]: false }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your rental properties and units</p>
      </div>

      {/* Add property form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Add Property</h2>
        <form onSubmit={handleAddProperty} className="space-y-3">
          {propError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{propError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                placeholder="Sunset Apartments"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={newPropAddress}
                onChange={(e) => setNewPropAddress(e.target.value)}
                placeholder="123 Main St, City, ST"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addingProp}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {addingProp ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>

      {/* Property list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 text-sm">No properties yet. Add one above.</p>
          </div>
        ) : (
          properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Property header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{prop.name}</p>
                  {prop.address && <p className="text-xs text-gray-400 mt-0.5 truncate">{prop.address}</p>}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => toggleExpand(prop.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                  >
                    {expanded[prop.id] ? 'Hide' : 'Units'}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${expanded[prop.id] ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(prop.id, prop.name)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Units section */}
              {expanded[prop.id] && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</h3>

                  {units[prop.id] ? (
                    units[prop.id].length === 0 ? (
                      <p className="text-sm text-gray-400">No units yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {units[prop.id].map((unit) => (
                          <span
                            key={unit.id}
                            className="inline-flex items-center bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-lg"
                          >
                            {unit.unit_number}
                          </span>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400" />
                      Loading...
                    </div>
                  )}

                  {/* Add unit form */}
                  <form onSubmit={(e) => handleAddUnit(e, prop.id)} className="flex items-start gap-2 pt-1">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newUnitNumber[prop.id] || ''}
                        onChange={(e) =>
                          setNewUnitNumber((n) => ({ ...n, [prop.id]: e.target.value }))
                        }
                        placeholder="Unit number (e.g. 1A)"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${unitError[prop.id] ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {unitError[prop.id] && (
                        <p className="text-xs text-red-600 mt-1">{unitError[prop.id]}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={addingUnit[prop.id]}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {addingUnit[prop.id] ? '...' : 'Add Unit'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
