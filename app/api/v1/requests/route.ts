import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  let query = supabaseAdmin
    .from('maintenance_requests')
    .select(`
      *,
      unit:units(
        unit_number,
        tenant_token,
        property:properties(name, address, landlord_id)
      )
    `)
    .order('submitted_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { unit_id, title, description, priority } = body

  if (!unit_id || !title || !description || !priority) {
    return NextResponse.json(
      { error: 'Missing required fields: unit_id, title, description, priority' },
      { status: 400 }
    )
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent']
  if (!validPriorities.includes(priority)) {
    return NextResponse.json(
      { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .insert({
      unit_id,
      title,
      description,
      priority,
      status: 'open',
    })
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

  return NextResponse.json({ data }, { status: 201 })
}
