import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select(`
      *,
      unit:units(
        unit_number,
        tenant_token,
        property:properties(name, address, landlord_id)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, string | null> = {}

  if (body.status !== undefined) {
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }
    updates.status = body.status
    if (body.status === 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      unit:units(
        unit_number,
        property:properties(name, address)
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  const { error } = await supabaseAdmin
    .from('maintenance_requests')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Request deleted successfully' })
}
