import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// In-memory MCP usage counter (resets on server restart)
// In production, persist this to your database
const mcpUsageCounter: Record<string, number> = {
  list_requests: 0,
  get_request: 0,
  update_request_status: 0,
  create_request: 0,
}

export function getMcpUsageStats() {
  return { ...mcpUsageCounter }
}

const MCP_SERVER_INFO = {
  name: 'rentalcheck-mcp',
  version: '1.0.0',
  description: 'RentalCheck MCP server for managing rental property maintenance requests',
}

const TOOLS = [
  {
    name: 'list_requests',
    description: 'List maintenance requests. Optionally filter by status and/or priority.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'in-progress', 'resolved', 'closed'],
          description: 'Filter by request status',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Filter by request priority',
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
        id: {
          type: 'string',
          description: 'The UUID of the maintenance request',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_request_status',
    description: 'Update the status of a maintenance request. Optionally add or update internal notes.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The UUID of the maintenance request',
        },
        status: {
          type: 'string',
          enum: ['open', 'in-progress', 'resolved', 'closed'],
          description: 'New status for the request',
        },
        notes: {
          type: 'string',
          description: 'Optional internal notes about the update',
        },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'create_request',
    description: 'Create a new maintenance request for a given unit.',
    inputSchema: {
      type: 'object',
      properties: {
        unit_id: {
          type: 'string',
          description: 'The UUID of the unit',
        },
        title: {
          type: 'string',
          description: 'Short title of the maintenance issue',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority level of the request',
        },
      },
      required: ['unit_id', 'title', 'description', 'priority'],
    },
  },
]

async function handleToolCall(name: string, args: Record<string, string>) {
  // Track usage
  if (mcpUsageCounter[name] !== undefined) {
    mcpUsageCounter[name]++
  }

  switch (name) {
    case 'list_requests': {
      let query = supabaseAdmin
        .from('maintenance_requests')
        .select(`*, unit:units(unit_number, property:properties(name))`)
        .order('submitted_at', { ascending: false })

      if (args.status) query = query.eq('status', args.status)
      if (args.priority) query = query.eq('priority', args.priority)

      const { data, error } = await query
      if (error) throw new Error(error.message)

      return {
        requests: data,
        count: data?.length || 0,
      }
    }

    case 'get_request': {
      if (!args.id) throw new Error('Missing required parameter: id')

      const { data, error } = await supabaseAdmin
        .from('maintenance_requests')
        .select(`*, unit:units(unit_number, property:properties(name, address))`)
        .eq('id', args.id)
        .single()

      if (error) throw new Error('Request not found')
      return { request: data }
    }

    case 'update_request_status': {
      if (!args.id) throw new Error('Missing required parameter: id')
      if (!args.status) throw new Error('Missing required parameter: status')

      const updates: Record<string, string | null> = {
        status: args.status,
      }

      if (args.status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      }

      if (args.notes !== undefined) {
        updates.notes = args.notes
      }

      const { data, error } = await supabaseAdmin
        .from('maintenance_requests')
        .update(updates)
        .eq('id', args.id)
        .select(`*, unit:units(unit_number, property:properties(name))`)
        .single()

      if (error) throw new Error(error.message)
      return { success: true, request: data }
    }

    case 'create_request': {
      if (!args.unit_id) throw new Error('Missing required parameter: unit_id')
      if (!args.title) throw new Error('Missing required parameter: title')
      if (!args.description) throw new Error('Missing required parameter: description')
      if (!args.priority) throw new Error('Missing required parameter: priority')

      const { data, error } = await supabaseAdmin
        .from('maintenance_requests')
        .insert({
          unit_id: args.unit_id,
          title: args.title,
          description: args.description,
          priority: args.priority,
          status: 'open',
        })
        .select(`*, unit:units(unit_number, property:properties(name))`)
        .single()

      if (error) throw new Error(error.message)
      return { success: true, request: data }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      { status: 400 }
    )
  }

  const { jsonrpc, method, params, id } = body

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
            capabilities: {
              tools: {},
            },
          },
        })
      }

      case 'tools/list': {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS,
          },
        })
      }

      case 'tools/call': {
        const toolName = params?.name
        const toolArgs = params?.arguments || {}

        if (!toolName) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params: missing tool name' },
          })
        }

        try {
          const result = await handleToolCall(toolName, toolArgs)
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
          })
        } catch (toolError) {
          const errMessage = toolError instanceof Error ? toolError.message : 'Tool execution failed'
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error: ${errMessage}`,
                },
              ],
              isError: true,
            },
          })
        }
      }

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        })
    }
  } catch (err) {
    console.error('MCP server error:', err)
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: id || null,
        error: { code: -32603, message: 'Internal error' },
      },
      { status: 500 }
    )
  }
}
