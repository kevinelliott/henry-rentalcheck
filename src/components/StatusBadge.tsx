import { RequestStatus } from '@/lib/types'

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
  scheduled: { label: 'Scheduled', className: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', className: 'bg-gray-100 text-gray-600' },
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status] ?? statusConfig.submitted
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
