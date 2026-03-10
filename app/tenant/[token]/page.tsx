import { supabaseAdmin } from '@/lib/supabase'
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

async function submitRequest(formData: FormData) {
  'use server'
  const unitId = formData.get('unit_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string

  if (!unitId || !title || !description || !priority) return

  await supabaseAdmin.from('maintenance_requests').insert({
    unit_id: unitId,
    title,
    description,
    priority,
    status: 'open',
  })

  revalidatePath(`/tenant/${formData.get('tenant_token')}`)
}

export default async function TenantPortalPage({ params }: Props) {
  const { token } = await params

  // Look up unit by tenant_token
  const { data: unit, error } = await supabaseAdmin
    .from('units')
    .select('*, property:properties(*)')
    .eq('tenant_token', token)
    .single()

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid link</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            This maintenance request link is invalid or has expired. Please contact your landlord for a new link.
          </p>
        </div>
      </div>
    )
  }

  // Fetch existing requests for this unit
  const { data: requests } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*')
    .eq('unit_id', unit.id)
    .order('submitted_at', { ascending: false })

  const property = unit.property as { name: string; address: string } | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unit header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-lg flex-shrink-0">
              🏠
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Unit {unit.unit_number}
                {property && (
                  <span className="text-gray-500 font-normal"> — {property.name}</span>
                )}
              </h1>
              {property && (
                <p className="text-sm text-gray-500 mt-0.5">{property.address}</p>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mt-2">
                Tenant maintenance portal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Submission form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Submit a maintenance request</h2>
          <p className="text-sm text-gray-500 mb-6">
            Describe the issue and we will get back to you as soon as possible.
          </p>

          <form action={submitRequest} className="space-y-4">
            <input type="hidden" name="unit_id" value={unit.id} />
            <input type="hidden" name="tenant_token" value={token} />

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Issue title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g., Leaking kitchen faucet"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Please describe the issue in detail — when it started, how severe it is, and any relevant context."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'Low', desc: 'Not urgent', color: 'peer-checked:bg-gray-100 peer-checked:border-gray-400 peer-checked:text-gray-800' },
                  { value: 'medium', label: 'Medium', desc: 'Can wait a few days', color: 'peer-checked:bg-yellow-50 peer-checked:border-yellow-400 peer-checked:text-yellow-800' },
                  { value: 'high', label: 'High', desc: 'Needs attention soon', color: 'peer-checked:bg-orange-50 peer-checked:border-orange-400 peer-checked:text-orange-800' },
                  { value: 'urgent', label: 'Urgent', desc: 'Needs immediate fix', color: 'peer-checked:bg-red-50 peer-checked:border-red-400 peer-checked:text-red-800' },
                ].map((p) => (
                  <label key={p.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      required
                      className="peer sr-only"
                    />
                    <div className={`border-2 border-gray-200 rounded-lg p-2.5 text-center transition-all ${p.color}`}>
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors mt-2"
            >
              Submit maintenance request
            </button>
          </form>
        </div>

        {/* Existing requests */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Your requests
            {requests && requests.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {requests.length}
              </span>
            )}
          </h2>

          {(!requests || requests.length === 0) ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <p className="text-sm text-gray-500">No maintenance requests submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{req.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(req.priority)}`}>
                        {req.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Submitted {formatDate(req.submitted_at)}</span>
                    {req.resolved_at && (
                      <span className="text-xs text-green-600">Resolved {formatDate(req.resolved_at)}</span>
                    )}
                  </div>
                  {req.notes && (
                    <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-500">Note from landlord: </span>
                      <span className="text-xs text-gray-600">{req.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
