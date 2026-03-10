import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSession, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
    }

    const hash = process.env.LANDLORD_PASSWORD_HASH
    if (!hash) {
      return NextResponse.json({ error: 'Server not configured. Set LANDLORD_PASSWORD_HASH.' }, { status: 500 })
    }

    const valid = await bcrypt.compare(password, hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
    }

    const token = await createSession()

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
