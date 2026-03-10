import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const MCP_SERVER_INFO = {
  name: 'rentalcheck-mcp',
  version: '1.0.0',
  description: 'RentalCheck MCP server for managing rental property maintenance requests',
}

const TOOLS = [
  {
    name: 'list_requests',
    description: 'List maintenance requests across your properties. Optionally filter by status or urgency.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['submitted', 'acknowledged', 'in_progress', 'resolved'],
          description: 'Filter by request status',
        },
        urgency: {
          type: 'string',
          enum: ['Low', 'Medium', 'High', 'Emergency'],
          description: 'Filter by urgency level',
        },
      },
    },
  },
  {
    name: 'get_request',
    description: 'Fetch a single maintenance request by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'The UUID of the maintenance request',
        },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'update_request_status',
    description: 'Update the status of a maintenance request. Optionally add landlord notes.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'The UUID of the maintenance request',
        },
        status: {
          type: 'string',
          enum: ['submitted', 'acknowledged', 'in_progress', 'resolved'],
          description: 'New status for the request',
        },
        note: {
          type: 'string',
          description: 'Optional note about the status change',
        },
      },
      required: ['requestId', 'status'],
    },
  },
]

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null

  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

async function handleToolCall(
  name: string,
  args: Record<string, string>,
  userId: string
) {
  switch (name) {
    case 'list_requests': {
      const { data: properties } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('user_id', userId)

      if (!properties || properties.length === 0) {
        return { requests: [], count: 0 }
      }

      const propertyIds = properties.map((p: { id: string }) => p.id)
      let query = supabaseAdmin
        .from('maintenance_requests')
        .select('*, property:properties(name, address)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })

      if (args.status) query = query.eq('status', args.status)
      if (args.urgency) query = query.eq('urgency', args.urgency)

      const { data, error } = await query
      if (error) throw new Error(error.message)

      return { requests: data, count: data?.length || 0 }
    }

    case 'get_request': {
      if (!args.requestId) throw new Error('Missing required parameter: requestId')

      const { data, error } = await supabaseAdmin
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .eq('id', args.requestId)
        .single()

      if (error || !data) throw new Error('Request not found')

      const { data: history } = await supabaseAdmin
        .from('request_status_history')
        .select('*')
        .eq('request_id', args.requestId)
        .order('created_at', { ascending: true })

      return { request: data, history: history || [] }
    }

    case 'update_request_status': {
      if (!args.requestId) throw new Error('Missing required parameter: requestId')
      if (!args.status) throw new Error('Missing required parameter: status')

      const { data: current } = await supabaseAdmin
        .from('maintenance_requests')
        .select('status, property_id')
        .eq('id', args.requestId)
        .single()

      if (!current) throw new Error('Request not found')

      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('user_id')
        .eq('id', current.property_id)
        .single()

      if (!property || property.user_id !== userId) throw new Error('Forbidden')

      const { data: updated, error } = await supabaseAdmin
        .from('maintenance_requests')
        .update({ status: args.status, updated_at: new Date().toISOString() })
        .eq('id', args.requestId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      if (args.status !== current.status) {
        await supabaseAdmin.from('request_status_history').insert({
          request_id: args.requestId,
          old_status: current.status,
          new_status: args.status,
          note: args.note || null,
        })
      }

      return { success: true, request: updated }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      { status: 400 }
    )
  }

  const { jsonrpc, method, params, id } = body as {
    jsonrpc: string
    method: string
    params: Record<string, unknown>
    id: unknown
  }

  if (jsonrpc !== '2.0') {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: id || null },
      { status: 400 }
    )
  }

  try {
    switch (method) {
      case 'initialize': {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: MCP_SERVER_INFO,
            capabilities: { tools: {} },
          },
        })
      }

      case 'tools/list': {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        })
      }

      case 'tools/call': {
        const toolName = params?.name as string
        const toolArgs = (params?.arguments || {}) as Record<string, string>

        if (!toolName) {
          return NextResponse.json({
            jsonrpc: '2.0', id,
            error: { code: -32602, message: 'Invalid params: missing tool name' },
          })
        }

        const user = await getAuthenticatedUser(req)
        if (!user) {
          return NextResponse.json({
            jsonrpc: '2.0', id,
            error: { code: -32001, message: 'Unauthorized: missing or invalid Bearer token' },
          })
        }

        try {
          const result = await handleToolCall(toolName, toolArgs, user.id)
          return NextResponse.json({
            jsonrpc: '2.0', id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            },
          })
        } catch (toolError) {
          const errMessage = toolError instanceof Error ? toolError.message : 'Tool execution failed'
          return NextResponse.json({
            jsonrpc: '2.0', id,
            result: {
              content: [{ type: 'text', text: `Error: ${errMessage}` }],
              isError: true,
            },
          })
        }
      }

      default:
        return NextResponse.json({
          jsonrpc: '2.0', id,
          error: { code: -32601, message: `Method not found: ${method}` },
        })
    }
  } catch (err) {
    console.error('MCP server error:', err)
    return NextResponse.json(
      { jsonrpc: '2.0', id: id || null, error: { code: -32603, message: 'Internal error' } },
      { status: 500 }
    )
  }
}
