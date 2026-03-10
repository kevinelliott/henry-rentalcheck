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

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      })),
      page,
      limit,
      total: data.total,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list users'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
