import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/properties — list all (public, used by tenant form)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST /api/properties — create (auth required)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, address } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Property name is required.' }, { status: 400 })
    }

    const insertData: Record<string, string> = { name: name.trim() }
    if (address?.trim()) insertData.address = address.trim()

    const { data, error } = await supabaseAdmin
      .from('properties')
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
