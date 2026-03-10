import { NextRequest, NextResponse } from 'next/server'

function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return true
  return request.headers.get('X-Admin-Key') === adminKey
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return demo data (in-memory counters can't be shared across routes)
  return NextResponse.json({
    total: 0,
    topTools: [
      { name: 'list_requests', count: 0 },
      { name: 'update_request_status', count: 0 },
      { name: 'get_request', count: 0 },
      { name: 'create_request', count: 0 },
    ],
    note: 'MCP usage tracking — calls logged per server instance',
  })
}
