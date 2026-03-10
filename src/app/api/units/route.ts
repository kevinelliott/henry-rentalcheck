import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/units?propertyId=X — list units for property (public, used by tenant form)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId query param is required.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('units')
    .select('*')
    .eq('property_id', propertyId)
    .order('unit_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST /api/units — create unit (auth required)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { property_id, unit_number } = body

    if (!property_id?.trim()) {
      return NextResponse.json({ error: 'property_id is required.' }, { status: 400 })
    }
    if (!unit_number?.trim()) {
      return NextResponse.json({ error: 'unit_number is required.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('units')
      .insert({ property_id: property_id.trim(), unit_number: unit_number.trim() })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
}
