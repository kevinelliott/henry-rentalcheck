import { NextRequest, NextResponse } from 'next/server'
import { getMcpUsageStats } from '@/app/api/mcp/route'

function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return true
  return request.headers.get('X-Admin-Key') === adminKey
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = getMcpUsageStats()
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)

  const topTools = Object.entries(stats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // If no usage yet, return demo data
  const hasUsage = total > 0
  if (!hasUsage) {
    return NextResponse.json({
      total: 142,
      topTools: [
        { name: 'list_requests', count: 87 },
        { name: 'update_request_status', count: 31 },
        { name: 'get_request', count: 18 },
        { name: 'create_request', count: 6 },
      ],
      note: 'Demo data — no live MCP calls recorded yet (counter resets on server restart)',
    })
  }

  return NextResponse.json({
    total,
    topTools,
  })
}
