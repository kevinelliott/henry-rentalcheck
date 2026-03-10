import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return true
  return request.headers.get('X-Admin-Key') === adminKey
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const summary = {
    total: data?.length || 0,
    byPlan: {
      free: data?.filter((s) => s.plan === 'free').length || 0,
      starter: data?.filter((s) => s.plan === 'starter').length || 0,
      growth: data?.filter((s) => s.plan === 'growth').length || 0,
    },
    byStatus: {
      active: data?.filter((s) => s.status === 'active').length || 0,
      canceled: data?.filter((s) => s.status === 'canceled').length || 0,
      past_due: data?.filter((s) => s.status === 'past_due').length || 0,
    },
  }

  return NextResponse.json({
    data,
    summary,
  })
}
