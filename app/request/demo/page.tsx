import Link from 'next/link'
import { getStatusBadgeClass, getUrgencyBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils'

export const metadata = {
  title: 'Demo — RentalCheck',
  description: 'See how a RentalCheck maintenance request looks in action.',
}

const demoRequest = {
  id: 'demo-request-id',
  property_id: 'demo-property-id',
  unit_number: '2B',
  tenant_name: 'Maria S.',
  category: 'Plumbing',
  description: 'The kitchen faucet has been dripping constantly for the past week. The drip is getting worse and is now quite loud. I\'ve tried tightening the handle but it doesn\'t seem to help. It\'s wasting a lot of water.',
  urgency: 'High' as const,
  status: 'in_progress' as const,
  request_token: 'demo-request-token',
  landlord_notes: 'Plumber is scheduled for Friday March 14th between 10am–2pm. Please ensure someone is home to let them in.',
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  property: {
    id: 'demo-property-id',
    user_id: 'demo-user',
    name: 'Sunset Apartments',
    address: '123 Main Street, San Francisco, CA 94105',
    property_token: 'demo-token',
    created_at: new Date().toISOString(),
  }
}

const demoHistory = [
  {
    id: '1',
    request_id: 'demo',
    old_status: null,
    new_status: 'submitted',
    note: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    request_id: 'demo',
    old_status: 'submitted',
    new_status: 'acknowledged',
    note: 'Received your request. We will arrange a plumber.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    request_id: 'demo',
    old_status: 'acknowledged',
    new_status: 'in_progress',
    note: 'Plumber booked for Friday.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

type Status = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved'
const statusSteps: Status[] = ['submitted', 'acknowledged', 'in_progress', 'resolved']

export default function DemoPage() {
  const currentIndex = statusSteps.indexOf(demoRequest.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-indigo-600 text-white text-center py-2.5 px-4">
        <span className="text-sm">
          This is a demo — see how RentalCheck works.{' '}
          <Link href="/auth/signup" className="underline font-medium hover:text-indigo-200">
            Create your free account →
          </Link>
        </span>
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">🏠</div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Maintenance Request Status</div>
              <h1 className="text-base font-semibold text-gray-900">{demoRequest.property.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Request Status</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(demoRequest.status)}`}>
              {getStatusLabel(demoRequest.status)}
            </span>
          </div>

          {/* Progress steps */}
          <div className="flex items-start gap-0 mb-8">
            {statusSteps.map((step, i) => {
              const stepIndex = i
              const isCompleted = stepIndex <= currentIndex
              const isCurrent = stepIndex === currentIndex
              const historyEntry = demoHistory.find(h => h.new_status === step)

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
          {demoRequest.landlord_notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message from landlord</div>
              <p className="text-sm text-gray-700 leading-relaxed">{demoRequest.landlord_notes}</p>
            </div>
          )}
        </div>

        {/* Request details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Request Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Property</div>
              <div className="text-sm text-gray-900">{demoRequest.property.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Unit</div>
              <div className="text-sm text-gray-900">{demoRequest.unit_number}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</div>
              <div className="text-sm text-gray-900">{demoRequest.category}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Urgency</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeClass(demoRequest.urgency)}`}>
                {demoRequest.urgency}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</div>
            <p className="text-sm text-gray-700 leading-relaxed">{demoRequest.description}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <h3 className="text-base font-semibold text-indigo-900 mb-2">Ready to use RentalCheck?</h3>
          <p className="text-sm text-indigo-700 mb-4">
            Get your own tenant portal and dashboard. Free plan available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/submit/demo-token"
              className="border border-indigo-300 text-indigo-700 hover:bg-indigo-100 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Try Submit Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
