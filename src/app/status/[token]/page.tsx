import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { MaintenanceRequest } from '@/lib/types'
import { StatusBadge } from '@/components/StatusBadge'
import { UrgencyBadge } from '@/components/UrgencyBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getRequest(token: string): Promise<MaintenanceRequest | null> {
  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*, properties(id, name, address, created_at), units(id, property_id, unit_number, created_at)')
    .eq('token', token)
    .single()

  if (error || !data) return null
  return data as MaintenanceRequest
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusSteps = ['submitted', 'in_progress', 'scheduled', 'completed'] as const

function StatusTimeline({ status }: { status: string }) {
  if (status === 'declined') {
    return (
      <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-700">Request Declined</p>
          <p className="text-sm text-gray-500">This request has been reviewed and declined. See notes below for details.</p>
        </div>
      </div>
    )
  }

  const currentIdx = statusSteps.indexOf(status as typeof statusSteps[number])

  return (
    <div className="flex items-center gap-0">
      {statusSteps.map((step, idx) => {
        const isComplete = currentIdx > idx
        const isCurrent = currentIdx === idx
        const labels: Record<string, string> = {
          submitted: 'Submitted',
          in_progress: 'In Progress',
          scheduled: 'Scheduled',
          completed: 'Completed',
        }
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isComplete
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-xs mt-1 text-center leading-tight ${isCurrent ? 'text-blue-600 font-semibold' : isComplete ? 'text-blue-500' : 'text-gray-400'}`} style={{ minWidth: 60 }}>
                {labels[step]}
              </span>
            </div>
            {idx < statusSteps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 ${isComplete ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function StatusPage({ params }: { params: { token: string } }) {
  const request = await getRequest(params.token)

  if (!request) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Request Status</h1>
          <p className="text-gray-500 text-sm mt-1">Track your maintenance request below</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Request Type</p>
              <p className="font-semibold text-gray-900">{request.request_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={request.urgency} />
              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Timeline */}
            <div className="mb-6">
              <StatusTimeline status={request.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tenant</p>
                <p className="text-gray-900">{request.tenant_name}</p>
              </div>
              {request.tenant_phone && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-gray-900">{request.tenant_phone}</p>
                </div>
              )}
              {request.properties && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Property</p>
                  <p className="text-gray-900">{request.properties.name}</p>
                </div>
              )}
              {(request.units?.unit_number || request.unit_number) && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Unit</p>
                  <p className="text-gray-900">{request.units?.unit_number || request.unit_number}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted</p>
                <p className="text-gray-900">{formatDate(request.submitted_at)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-gray-900">{formatDate(request.updated_at)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{request.description}</p>
            </div>

            {/* Landlord Notes */}
            {request.landlord_notes && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes from Landlord</p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-blue-900 text-sm leading-relaxed">{request.landlord_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link href="/submit" className="text-blue-600 hover:underline text-sm">
            Submit another request
          </Link>
        </div>
      </div>
    </div>
  )
}
