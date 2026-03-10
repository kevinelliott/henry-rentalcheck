import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: properties } = await supabaseAdmin
    .from('properties')
    .select('id')
    .eq('user_id', user.id)

  if (!properties || properties.length === 0) {
    return NextResponse.json({ requests: [] })
  }

  const propertyIds = properties.map((p: { id: string }) => p.id)

  const { data: requests, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*, property:properties(*)')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ requests })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { propertyToken, tenantName, unitNumber, category, description, urgency } = body as Record<string, string>

  if (!propertyToken || !tenantName || !unitNumber || !category || !description || !urgency) {
    return NextResponse.json({ error: 'Missing required fields: propertyToken, tenantName, unitNumber, category, description, urgency' }, { status: 400 })
  }

  const validUrgency = ['Low', 'Medium', 'High', 'Emergency']
  if (!validUrgency.includes(urgency)) {
    return NextResponse.json({ error: `Invalid urgency. Must be one of: ${validUrgency.join(', ')}` }, { status: 400 })
  }

  const { data: property, error: propError } = await supabaseAdmin
    .from('properties')
    .select('id')
    .eq('property_token', propertyToken)
    .single()

  if (propError || !property) {
    return NextResponse.json({ error: 'Invalid property token' }, { status: 404 })
  }

  const { data: request, error: insertError } = await supabaseAdmin
    .from('maintenance_requests')
    .insert({
      property_id: property.id,
      unit_number: unitNumber,
      tenant_name: tenantName,
      category,
      description,
      urgency,
      status: 'submitted',
    })
    .select('id, request_token')
    .single()

  if (insertError || !request) {
    return NextResponse.json({ error: insertError?.message || 'Insert failed' }, { status: 500 })
  }

  await supabaseAdmin.from('request_status_history').insert({
    request_id: request.id,
    old_status: null,
    new_status: 'submitted',
  })

  return NextResponse.json({ requestToken: request.request_token }, { status: 201 })
}
