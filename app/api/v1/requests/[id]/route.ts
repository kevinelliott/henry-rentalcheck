import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let query = supabaseAdmin
    .from('maintenance_requests')
    .select('*, property:properties(*)')

  if (token) {
    query = query.eq('request_token', token)
  } else {
    query = query.eq('id', id)
  }

  const { data: request, error } = await query.single()

  if (error || !request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const { data: history } = await supabaseAdmin
    .from('request_status_history')
    .select('*')
    .eq('request_id', request.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ request, history: history || [] })
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { status, landlordNotes } = body as { status?: string; landlordNotes?: string }

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }

  if (status !== undefined) {
    const validStatuses = ['submitted', 'acknowledged', 'in_progress', 'resolved']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }
    updates.status = status
  }

  if (landlordNotes !== undefined) {
    updates.landlord_notes = landlordNotes
  }

  // Get current request to check old status
  const { data: currentRequest } = await supabaseAdmin
    .from('maintenance_requests')
    .select('status, property_id')
    .eq('id', id)
    .single()

  if (!currentRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  // Verify ownership
  const { data: property } = await supabaseAdmin
    .from('properties')
    .select('user_id')
    .eq('id', currentRequest.property_id)
    .single()

  if (!property || property.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select('*, property:properties(*)')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Create status history entry if status changed
  if (status && status !== currentRequest.status) {
    await supabaseAdmin.from('request_status_history').insert({
      request_id: id,
      old_status: currentRequest.status,
      new_status: status,
      note: landlordNotes || null,
    })
  }

  return NextResponse.json({ request: updated })
}
