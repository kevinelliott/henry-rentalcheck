export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Documentation — RentalCheck',
  description: 'Full API reference, MCP server documentation, and integration guides for RentalCheck.',
}

function CodeBlock({ children, language = 'bash' }: { children: string; language?: string }) {
  return (
    <pre className={`bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-800`}>
      <code>{children.trim()}</code>
    </pre>
  )
}

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="block -mt-20 pt-20" />
}

export default function DocsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">

          {/* Sidebar nav */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Getting started</div>
                <ul className="space-y-1">
                  <li><a href="#overview" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Overview</a></li>
                  <li><a href="#quickstart" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Quickstart</a></li>
                  <li><a href="#authentication" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Authentication</a></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">REST API</div>
                <ul className="space-y-1">
                  <li><a href="#get-requests" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">GET /requests</a></li>
                  <li><a href="#post-requests" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">POST /requests</a></li>
                  <li><a href="#get-request-id" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">GET /requests/:id</a></li>
                  <li><a href="#delete-request-id" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">DELETE /requests/:id</a></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">MCP server</div>
                <ul className="space-y-1">
                  <li><a href="#mcp-overview" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Overview</a></li>
                  <li><a href="#mcp-tools" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Tools reference</a></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Guides</div>
                <ul className="space-y-1">
                  <li><a href="#embed" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors block py-0.5">Embed guide</a></li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <span>📚</span>
                <span>Documentation</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">RentalCheck Docs</h1>
              <p className="text-lg text-gray-500">
                Everything you need to integrate, automate, and extend RentalCheck.
              </p>
            </div>

            {/* Getting Started */}
            <section>
              <SectionAnchor id="overview" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                RentalCheck is a maintenance request management platform for landlords. It includes:
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'A no-login tenant portal at /tenant/[token]',
                  'A landlord dashboard at /dashboard',
                  'A REST API at /api/v1/requests',
                  'A Model Context Protocol (MCP) server at /api/mcp',
                  'Stripe-powered billing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>

              <SectionAnchor id="quickstart" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quickstart</h3>
              <ol className="space-y-4 mb-8">
                <li className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">1. Clone and install</span>
                  <CodeBlock language="bash">{`
git clone https://github.com/your-org/rentalcheck
cd rentalcheck
npm install
                  `}</CodeBlock>
                </li>
                <li className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">2. Configure environment</span>
                  <CodeBlock language="bash">{`
cp .env.example .env.local
# Fill in your Supabase and Stripe credentials
                  `}</CodeBlock>
                </li>
                <li className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">3. Run the migration</span>
                  <CodeBlock language="bash">{`
# In Supabase SQL editor, run:
supabase/migrations/001_initial.sql
                  `}</CodeBlock>
                </li>
                <li className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">4. Start the dev server</span>
                  <CodeBlock language="bash">{`
npm run dev
# Open http://localhost:3000
                  `}</CodeBlock>
                </li>
              </ol>

              <SectionAnchor id="authentication" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentication</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The demo uses a hardcoded landlord ID for demonstration. In production, integrate Supabase Auth to associate requests with authenticated users. Tenant portal access is granted via a unique <code className="bg-gray-100 px-1 rounded">tenant_token</code> UUID per unit — no login required.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Admin API routes check the <code className="bg-gray-100 px-1 rounded">X-Admin-Key</code> header against your <code className="bg-gray-100 px-1 rounded">ADMIN_API_KEY</code> environment variable.
              </p>
            </section>

            {/* REST API Reference */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">REST API Reference</h2>
              <p className="text-gray-500 text-sm mb-8">Base URL: <code className="bg-gray-100 px-1 rounded">/api/v1</code></p>

              {/* GET /requests */}
              <SectionAnchor id="get-requests" />
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                  <code className="text-sm font-mono text-gray-800">/api/v1/requests</code>
                </div>
                <p className="text-sm text-gray-600 mb-4">Returns all maintenance requests with their associated unit and property data.</p>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Query parameters</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-2 text-gray-600 font-medium">Param</th>
                        <th className="text-left px-4 py-2 text-gray-600 font-medium">Type</th>
                        <th className="text-left px-4 py-2 text-gray-600 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2 font-mono text-gray-700">status</td>
                        <td className="px-4 py-2 text-gray-500">string</td>
                        <td className="px-4 py-2 text-gray-500">Filter by status: open, in-progress, resolved, closed</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-gray-700">priority</td>
                        <td className="px-4 py-2 text-gray-500">string</td>
                        <td className="px-4 py-2 text-gray-500">Filter by priority: low, medium, high, urgent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Example request</h4>
                <CodeBlock language="bash">{`
curl https://yourapp.com/api/v1/requests?status=open
                `}</CodeBlock>
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Example response</h4>
                <CodeBlock language="json">{`
{
  "data": [
    {
      "id": "f1111111-1111-1111-1111-111111111111",
      "unit_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "title": "Leaking kitchen faucet",
      "description": "The kitchen faucet has been dripping...",
      "priority": "high",
      "status": "open",
      "submitted_at": "2026-03-05T10:00:00Z",
      "resolved_at": null,
      "notes": null,
      "unit": {
        "unit_number": "1A",
        "property": { "name": "Sunset Apartments" }
      }
    }
  ]
}
                `}</CodeBlock>
              </div>

              {/* POST /requests */}
              <SectionAnchor id="post-requests" />
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span>
                  <code className="text-sm font-mono text-gray-800">/api/v1/requests</code>
                </div>
                <p className="text-sm text-gray-600 mb-4">Create a new maintenance request.</p>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Request body</h4>
                <CodeBlock language="json">{`
{
  "unit_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "title": "Broken window latch",
  "description": "The latch on the bedroom window is broken.",
  "priority": "high"
}
                `}</CodeBlock>
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Example curl</h4>
                <CodeBlock language="bash">{`
curl -X POST https://yourapp.com/api/v1/requests \\
  -H "Content-Type: application/json" \\
  -d '{
    "unit_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
    "title": "Broken window latch",
    "description": "The latch is broken.",
    "priority": "high"
  }'
                `}</CodeBlock>
              </div>

              {/* GET /requests/:id */}
              <SectionAnchor id="get-request-id" />
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                  <code className="text-sm font-mono text-gray-800">/api/v1/requests/[id]</code>
                </div>
                <p className="text-sm text-gray-600 mb-4">Fetch a single maintenance request by ID. Also supports <code className="bg-gray-100 px-1 rounded">PATCH</code> to update status and notes.</p>
                <CodeBlock language="bash">{`
curl https://yourapp.com/api/v1/requests/f1111111-1111-1111-1111-111111111111
                `}</CodeBlock>
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">PATCH — Update status</h4>
                <CodeBlock language="bash">{`
curl -X PATCH https://yourapp.com/api/v1/requests/f1111111-1111-1111-1111-111111111111 \\
  -H "Content-Type: application/json" \\
  -d '{ "status": "in-progress", "notes": "Plumber scheduled for Friday" }'
                `}</CodeBlock>
              </div>

              {/* DELETE /requests/:id */}
              <SectionAnchor id="delete-request-id" />
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">DELETE</span>
                  <code className="text-sm font-mono text-gray-800">/api/v1/requests/[id]</code>
                </div>
                <p className="text-sm text-gray-600 mb-4">Permanently delete a maintenance request.</p>
                <CodeBlock language="bash">{`
curl -X DELETE https://yourapp.com/api/v1/requests/f1111111-1111-1111-1111-111111111111
                `}</CodeBlock>
              </div>
            </section>

            {/* MCP Server */}
            <section>
              <SectionAnchor id="mcp-overview" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">MCP Server</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                RentalCheck ships with a stateless Model Context Protocol server at <code className="bg-gray-100 px-1 rounded">/api/mcp</code>. It implements JSON-RPC 2.0 and supports the standard MCP <code className="bg-gray-100 px-1 rounded">initialize</code>, <code className="bg-gray-100 px-1 rounded">tools/list</code>, and <code className="bg-gray-100 px-1 rounded">tools/call</code> methods.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Use it with any MCP-compatible AI client (Claude Desktop, custom agents, etc.) to let AI manage maintenance requests through natural language.
              </p>

              <h4 className="text-sm font-semibold text-gray-700 mb-2">Endpoint</h4>
              <CodeBlock language="bash">{`
POST /api/mcp
Content-Type: application/json
              `}</CodeBlock>

              <SectionAnchor id="mcp-tools" />
              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Tools reference</h3>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-indigo-700">list_requests</code>
                    <span className="text-xs text-gray-400">tool</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">List maintenance requests with optional filters.</p>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parameters</h5>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div><code className="bg-gray-100 px-1 rounded text-xs">status</code> <span className="text-gray-400">(optional)</span> — Filter by status</div>
                    <div><code className="bg-gray-100 px-1 rounded text-xs">priority</code> <span className="text-gray-400">(optional)</span> — Filter by priority</div>
                  </div>
                  <CodeBlock language="json">{`
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_requests",
    "arguments": { "status": "open", "priority": "high" }
  }
}
                  `}</CodeBlock>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-indigo-700">get_request</code>
                    <span className="text-xs text-gray-400">tool</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Fetch a single maintenance request by ID.</p>
                  <CodeBlock language="json">{`
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_request",
    "arguments": { "id": "f1111111-1111-1111-1111-111111111111" }
  }
}
                  `}</CodeBlock>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-indigo-700">update_request_status</code>
                    <span className="text-xs text-gray-400">tool</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Update the status of a maintenance request and optionally add notes.</p>
                  <CodeBlock language="json">{`
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "update_request_status",
    "arguments": {
      "id": "f1111111-1111-1111-1111-111111111111",
      "status": "in-progress",
      "notes": "Plumber scheduled for Friday 2pm"
    }
  }
}
                  `}</CodeBlock>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-indigo-700">create_request</code>
                    <span className="text-xs text-gray-400">tool</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Create a new maintenance request programmatically.</p>
                  <CodeBlock language="json">{`
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create_request",
    "arguments": {
      "unit_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "title": "Broken smoke detector",
      "description": "Smoke detector in bedroom needs new battery / replacement.",
      "priority": "high"
    }
  }
}
                  `}</CodeBlock>
                </div>
              </div>
            </section>

            {/* Embed Guide */}
            <section>
              <SectionAnchor id="embed" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Embed Guide</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                You can embed the tenant portal directly on your own website using an <code className="bg-gray-100 px-1 rounded">{'<iframe>'}</code>. This is useful if you have a property management site and want tenants to submit requests without leaving your site.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic iframe embed</h3>
              <CodeBlock language="html">{`
<!-- Replace TOKEN with the unit's tenant_token UUID -->
<iframe
  src="https://yourapp.com/tenant/11111111-1111-1111-1111-111111111111"
  width="100%"
  height="800"
  style="border: none; border-radius: 12px;"
  title="Maintenance Request Portal"
></iframe>
              `}</CodeBlock>

              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Where to find the tenant token</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Each unit has a unique <code className="bg-gray-100 px-1 rounded">tenant_token</code> UUID. You can find it by querying the units table or by checking the tenant portal URL in your dashboard.
              </p>
              <CodeBlock language="sql">{`
-- Get all tenant tokens
SELECT u.unit_number, p.name as property_name, u.tenant_token
FROM units u
JOIN properties p ON p.id = u.property_id
WHERE p.landlord_id = '00000000-0000-0000-0000-000000000001';
              `}</CodeBlock>

              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Tenant portal URL format</h3>
              <CodeBlock language="text">{`
https://yourapp.com/tenant/{tenant_token}

Example:
https://yourapp.com/tenant/11111111-1111-1111-1111-111111111111
              `}</CodeBlock>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
