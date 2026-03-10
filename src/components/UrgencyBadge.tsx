import { RequestUrgency } from '@/lib/types'

const urgencyConfig: Record<RequestUrgency, { label: string; className: string }> = {
  emergency: { label: 'Emergency', className: 'bg-red-100 text-red-800 border border-red-300' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', className: 'bg-green-100 text-green-800' },
}

export function UrgencyBadge({ urgency }: { urgency: RequestUrgency }) {
  const config = urgencyConfig[urgency] ?? urgencyConfig.medium
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
