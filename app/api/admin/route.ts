import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return true // demo mode: allow all requests if not configured
  const headerKey = request.headers.get('X-Admin-Key')
  return headerKey === adminKey
}

export async function GET(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY
  const mode = adminKey ? 'live' : 'demo'

  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch summary stats
  const [requestsResult, propertiesResult, unitsResult, subscriptionsResult] = await Promise.all([
    supabaseAdmin.from('maintenance_requests').select('id, status, priority', { count: 'exact' }),
    supabaseAdmin.from('properties').select('id', { count: 'exact' }),
    supabaseAdmin.from('units').select('id', { count: 'exact' }),
    supabaseAdmin.from('subscriptions').select('plan, status'),
  ])

  const requests = requestsResult.data || []
  const statusBreakdown = {
    open: requests.filter((r) => r.status === 'open').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
    closed: requests.filter((r) => r.status === 'closed').length,
  }

  const subs = subscriptionsResult.data || []
  const planBreakdown = {
    free: subs.filter((s) => s.plan === 'free').length,
    starter: subs.filter((s) => s.plan === 'starter').length,
    growth: subs.filter((s) => s.plan === 'growth').length,
  }

  return NextResponse.json({
    mode,
    stats: {
      requests: requestsResult.count || 0,
      properties: propertiesResult.count || 0,
      tenants: unitsResult.count || 0,
      subscriptions: subs.length,
    },
    statusBreakdown,
    planBreakdown,
    generatedAt: new Date().toISOString(),
  })
}
