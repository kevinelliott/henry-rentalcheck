import { supabaseAdmin } from '@/lib/supabase'
import { MaintenanceRequest } from '@/lib/types'
import { StatusBadge } from '@/components/StatusBadge'
import { UrgencyBadge } from '@/components/UrgencyBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getRequests(status?: string, urgency?: string): Promise<MaintenanceRequest[]> {
  let query = supabaseAdmin
    .from('maintenance_requests')
    .select('*, properties(id, name, address, created_at)')
    .order('submitted_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (urgency) query = query.eq('urgency', urgency)

  const { data, error } = await query
  if (error) return []
  return data as MaintenanceRequest[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatCard({ label, value, sublabel, color }: { label: string; value: number; sublabel?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { status?: string; urgency?: string }
}) {
  const allRequests = await getRequests()
  const filteredRequests = await getRequests(searchParams.status, searchParams.urgency)

  // Stats
  const open = allRequests.filter((r) => !['completed', 'declined'].includes(r.status))
  const emergency = allRequests.filter((r) => r.urgency === 'emergency' && !['completed', 'declined'].includes(r.status))
  const completed = allRequests.filter((r) => r.status === 'completed')
  const submitted = allRequests.filter((r) => r.status === 'submitted')

  // Property breakdown
  const propertyMap: Record<string, { name: string; count: number }> = {}
  for (const r of open) {
    if (r.properties) {
      if (!propertyMap[r.properties.id]) propertyMap[r.properties.id] = { name: r.properties.name, count: 0 }
      propertyMap[r.properties.id].count++
    }
  }
  const propertyBreakdown = Object.values(propertyMap).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage maintenance requests across all your properties</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Requests" value={open.length} sublabel="active" color="text-blue-600" />
        <StatCard label="Needs Attention" value={submitted.length} sublabel="newly submitted" color="text-orange-500" />
        <StatCard label="Emergency" value={emergency.length} sublabel="urgent open" color="text-red-600" />
        <StatCard label="Completed" value={completed.length} sublabel="all time" color="text-green-600" />
      </div>

      {/* Property breakdown */}
      {propertyBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Requests by Property</h2>
          <div className="flex flex-wrap gap-2">
            {propertyBreakdown.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                <span className="font-semibold">{p.name}</span>
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {p.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <h2 className="font-semibold text-gray-800">All Requests</h2>
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="flex items-center gap-1">
              {(['', 'submitted', 'in_progress', 'scheduled', 'completed', 'declined'] as const).map((s) => {
                const labels: Record<string, string> = {
                  '': 'All',
                  submitted: 'Submitted',
                  in_progress: 'In Progress',
                  scheduled: 'Scheduled',
                  completed: 'Completed',
                  declined: 'Declined',
                }
                const isActive = (searchParams.status || '') === s
                return (
                  <Link
                    key={s}
                    href={`/dashboard?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(searchParams.urgency ? { urgency: searchParams.urgency } : {}) })}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {labels[s]}
                  </Link>
                )
              })}
            </div>
            {/* Urgency filter */}
            <div className="flex items-center gap-1">
              {(['', 'emergency', 'high', 'medium', 'low'] as const).map((u) => {
                const labels: Record<string, string> = { '': 'All', emergency: 'Emergency', high: 'High', medium: 'Medium', low: 'Low' }
                const isActive = (searchParams.urgency || '') === u
                return (
                  <Link
                    key={u}
                    href={`/dashboard?${new URLSearchParams({ ...(searchParams.status ? { status: searchParams.status } : {}), ...(u ? { urgency: u } : {}) })}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${isActive && u ? 'bg-red-600 text-white' : isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {labels[u]}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Property / Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{req.tenant_name}</p>
                      {req.tenant_phone && <p className="text-xs text-gray-400">{req.tenant_phone}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {req.properties ? (
                        <div>
                          <p className="text-gray-700">{req.properties.name}</p>
                          {req.unit_number && <p className="text-xs text-gray-400">{req.unit_number}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{req.request_type}</td>
                    <td className="px-4 py-3.5">
                      <UrgencyBadge urgency={req.urgency} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">{formatDate(req.submitted_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/dashboard/requests/${req.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline whitespace-nowrap"
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
