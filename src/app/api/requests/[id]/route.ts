import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/requests/[id] — single request (auth required)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*, properties(id, name, address, created_at), units(id, property_id, unit_number, created_at)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/requests/[id] — update status/notes (auth required)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { status, landlord_notes } = body

    const validStatuses = ['submitted', 'in_progress', 'scheduled', 'completed', 'declined']
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
      }
      updates.status = status
    }

    if (landlord_notes !== undefined) {
      updates.landlord_notes = landlord_notes
    }

    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .update(updates)
      .eq('id', params.id)
      .select('*, properties(id, name, address, created_at), units(id, property_id, unit_number, created_at)')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Request not found.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
}
