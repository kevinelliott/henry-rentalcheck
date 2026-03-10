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

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = (page - 1) * limit

  // Get unique landlord_ids from properties
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('landlord_id, name, address, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // De-duplicate landlord_ids
  const seen = new Set<string>()
  const uniqueLandlords = (data || []).reduce(
    (acc: { landlord_id: string; property_count: number; first_seen: string }[], row) => {
      if (!seen.has(row.landlord_id)) {
        seen.add(row.landlord_id)
        acc.push({
          landlord_id: row.landlord_id,
          property_count: (data || []).filter((d) => d.landlord_id === row.landlord_id).length,
          first_seen: row.created_at,
        })
      }
      return acc
    },
    []
  )

  return NextResponse.json({
    data: uniqueLandlords,
    page,
    limit,
    total: uniqueLandlords.length,
  })
}
