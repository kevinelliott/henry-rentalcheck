import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

  const [requestsResult, propertiesResult, unitsResult] = await Promise.all([
    supabaseAdmin.from('maintenance_requests').select('id', { count: 'exact' }),
    supabaseAdmin.from('properties').select('id', { count: 'exact' }),
    supabaseAdmin.from('units').select('id', { count: 'exact' }),
  ])

  const mcpStats = getMcpUsageStats()
  const mcpTotal = Object.values(mcpStats).reduce((sum, count) => sum + count, 0)

  return NextResponse.json({
    requests: requestsResult.count || 0,
    properties: propertiesResult.count || 0,
    tenants: unitsResult.count || 0,
    mcp_usage: mcpTotal,
  })
}
