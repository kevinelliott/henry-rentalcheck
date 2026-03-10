// In-memory MCP usage counter (resets on server restart)
// In production, persist this to your database
export const mcpUsageCounter: Record<string, number> = {
  list_requests: 0,
  get_request: 0,
  update_request_status: 0,
  create_request: 0,
}

export function getMcpUsageStats() {
  return { ...mcpUsageCounter }
}

export function incrementMcpUsage(tool: string) {
  if (mcpUsageCounter[tool] !== undefined) {
    mcpUsageCounter[tool]++
  } else {
    mcpUsageCounter[tool] = 1
  }
}
