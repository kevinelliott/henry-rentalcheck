import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return true
  return request.headers.get('X-Admin-Key') === adminKey
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [requestsResult, propertiesResult, subsResult] = await Promise.all([
    supabaseAdmin.from('maintenance_requests').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('id', { count: 'exact', head: true }),
  ])

  let userCount = 0
  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers()
    userCount = data?.users?.length || 0
  } catch {
    userCount = 0
  }

  return NextResponse.json({
    users: userCount,
    properties: propertiesResult.count || 0,
    requests: requestsResult.count || 0,
    subscriptions: subsResult.count || 0,
    mcpUsage: 0,
  })
}
