import { supabase } from '@/lib/supabase'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils'
import type { MaintenanceRequest, Property, RequestStatusHistory } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ requestToken: string }>
}

const statusSteps: Array<MaintenanceRequest['status']> = ['submitted', 'acknowledged', 'in_progress', 'resolved']

export default async function StatusPage({ params }: Props) {
  const { requestToken } = await params

  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .select('*, property:properties(*)')
    .eq('request_token', requestToken)
    .single()

  if (error || !request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Request not found</h1>
          <p className="text-gray-500 text-sm">
            This request link is invalid or has been removed. Please check your link and try again.
          </p>
        </div>
      </div>
    )
  }

  const { data: history } = await supabase
    .from('request_status_history')
    .select('*')
    .eq('request_id', request.id)
    .order('created_at', { ascending: true })

  const property = request.property as Property | null
  const currentIndex = statusSteps.indexOf(request.status as MaintenanceRequest['status'])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">🏠</div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Maintenance Request Status</div>
              <h1 className="text-base font-semibold text-gray-900">{property?.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status timeline */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Request Status</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
              {getStatusLabel(request.status)}
            </span>
          </div>

          {/* Progress steps */}
          <div className="flex items-start gap-0 mb-8">
            {statusSteps.map((step, i) => {
              const stepIndex = i
              const isCompleted = stepIndex <= currentIndex
              const isCurrent = stepIndex === currentIndex
              const historyEntry = (history as RequestStatusHistory[] || []).find(h => h.new_status === step)

              return (
                <div key={step} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <div className={`text-xs mt-1.5 font-medium text-center ${isCompleted ? 'text-indigo-700' : 'text-gray-400'}`}>
                      {getStatusLabel(step)}
                    </div>
                    {historyEntry && (
                      <div className="text-xs text-gray-400 text-center mt-0.5" style={{ fontSize: '10px' }}>
                        {formatDateTime(historyEntry.created_at)}
                      </div>
                    )}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-4 mx-1 ${stepIndex < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Landlord notes */}
          {request.landlord_notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message from landlord</div>
              <p className="text-sm text-gray-700 leading-relaxed">{request.landlord_notes}</p>
            </div>
          )}
        </div>

        {/* Request details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Request Details</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Property</div>
              <div className="text-sm text-gray-900">{property?.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Unit</div>
              <div className="text-sm text-gray-900">{request.unit_number}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</div>
              <div className="text-sm text-gray-900">{request.category}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Urgency</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeClass(request.urgency)}`}>
                {request.urgency}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</div>
            <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Submitted on {formatDateTime(request.created_at)} · Powered by RentalCheck
        </p>
      </div>
    </div>
  )
}
