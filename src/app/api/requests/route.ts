import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/requests — list all (dashboard, requires auth)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const urgency = searchParams.get('urgency')

  let query = supabaseAdmin
    .from('maintenance_requests')
    .select('*, properties(id, name, address, created_at), units(id, property_id, unit_number, created_at)')
    .order('submitted_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (urgency) query = query.eq('urgency', urgency)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/requests — create (public, tenant form)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      property_id,
      unit_id,
      tenant_name,
      tenant_phone,
      unit_number,
      request_type,
      description,
      urgency,
    } = body

    if (!tenant_name?.trim()) {
      return NextResponse.json({ error: 'Tenant name is required.' }, { status: 400 })
    }
    if (!request_type?.trim()) {
      return NextResponse.json({ error: 'Request type is required.' }, { status: 400 })
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
    }

    const validUrgencies = ['low', 'medium', 'high', 'emergency']
    const finalUrgency = validUrgencies.includes(urgency) ? urgency : 'medium'

    const insertData: Record<string, unknown> = {
      tenant_name: tenant_name.trim(),
      request_type: request_type.trim(),
      description: description.trim(),
      urgency: finalUrgency,
      status: 'submitted',
    }

    if (tenant_phone?.trim()) insertData.tenant_phone = tenant_phone.trim()
    if (property_id?.trim()) insertData.property_id = property_id.trim()
    if (unit_id?.trim()) insertData.unit_id = unit_id.trim()
    if (unit_number?.trim()) insertData.unit_number = unit_number.trim()

    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .insert(insertData)
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
