import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.redirect('http://localhost:3000/login')
  response.cookies.delete(COOKIE_NAME)
  return response
}

export async function GET() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
