export const metadata = {
  title: 'Features — RentalCheck',
  description: 'Explore all the features that make RentalCheck the best maintenance request management tool for landlords.',
}

const features = [
  {
    icon: '🔗',
    title: 'No-login tenant portal',
    description: 'Every unit gets a unique shareable URL. Tenants click the link and submit maintenance requests instantly — no app download, no account creation, no friction.',
    highlight: true,
  },
  {
    icon: '📡',
    title: 'Real-time status tracking',
    description: 'Both landlords and tenants can see live status updates as requests move from open → in-progress → resolved. Full transparency at every stage.',
    highlight: false,
  },
  {
    icon: '🚨',
    title: 'Priority triage system',
    description: 'Classify every request as urgent, high, medium, or low. Color-coded badges make it easy to see at a glance what needs immediate attention.',
    highlight: false,
  },
  {
    icon: '⚡',
    title: 'REST API access',
    description: 'A fully documented REST API lets you read, create, update, and delete maintenance requests programmatically. Integrate with any tool in your stack.',
    highlight: false,
  },
  {
    icon: '🤖',
    title: 'MCP server',
    description: 'A Model Context Protocol server lets AI agents interact with your maintenance data natively. Ask your AI assistant to list, update, or create requests.',
    highlight: true,
  },
  {
    icon: '💳',
    title: 'Stripe billing',
    description: 'Subscription management is built-in and powered by Stripe. Upgrade or downgrade plans instantly, manage billing from a hosted portal, no code required.',
    highlight: false,
  },
  {
    icon: '🏢',
    title: 'Multi-property support',
    description: 'Add unlimited properties and units. Each property and unit has its own tenant portal link and appears separately in your dashboard filters.',
    highlight: false,
  },
  {
    icon: '📝',
    title: 'Notes system',
    description: 'Attach internal notes to any maintenance request. Document what was done, who was contacted, or what parts were ordered — all in one place.',
    highlight: false,
  },
  {
    icon: '📧',
    title: 'Email-ready architecture',
    description: 'The API and data model are built to support email notifications. Hook up your email provider of choice to notify tenants on status changes.',
    highlight: false,
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card {
          animation: fadeUp 0.5s ease-out both;
        }

        .feature-card:nth-child(1) { animation-delay: 0.05s; }
        .feature-card:nth-child(2) { animation-delay: 0.1s; }
        .feature-card:nth-child(3) { animation-delay: 0.15s; }
        .feature-card:nth-child(4) { animation-delay: 0.2s; }
        .feature-card:nth-child(5) { animation-delay: 0.25s; }
        .feature-card:nth-child(6) { animation-delay: 0.3s; }
        .feature-card:nth-child(7) { animation-delay: 0.35s; }
        .feature-card:nth-child(8) { animation-delay: 0.4s; }
        .feature-card:nth-child(9) { animation-delay: 0.45s; }

        .feature-card:hover {
          transform: scale(1.02);
          border-color: #a5b4fc;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
        }
      `}</style>

      {/* Page header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <span>✨</span>
          <span>All features included in free plan</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-5 tracking-tight">
          Built for landlords who{' '}
          <span className="text-indigo-600">want clarity</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          RentalCheck packs everything you need to manage maintenance requests without the bloat. Here is what you get.
        </p>
      </section>

      {/* Features bento grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`feature-card bg-white border rounded-xl shadow-sm p-6 transition-all duration-200 cursor-default ${
                feature.highlight
                  ? 'border-indigo-200 bg-indigo-50/30'
                  : 'border-gray-200'
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                {feature.highlight && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature detail: tenant portal */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <span>🔗</span>
                <span>Tenant portal</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The simplest way for tenants to{' '}
                <span className="text-indigo-600">report issues</span>
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Forget email chains and missed calls. Each unit gets a permanent, unique URL that tenants can bookmark. They open it, fill out a simple form, and you get notified instantly.
              </p>
              <ul className="space-y-3">
                {[
                  'No app download or account required',
                  'Works on any device or browser',
                  'Tenants can check their request status anytime',
                  'Submit title, description, and priority',
                  'Embed via iframe on your own website',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="text-xs font-medium text-gray-400 mb-4 uppercase tracking-wide">Tenant portal preview</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Unit</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">Unit 1A — Sunset Apartments</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Issue title</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">e.g., Leaking kitchen faucet</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Description</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 h-16">Describe the issue...</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2">Priority</div>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Urgent'].map((p, i) => (
                      <span key={p} className={`px-2 py-1 rounded-md text-xs font-medium ${i === 2 ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'bg-gray-100 text-gray-500'}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium" disabled>
                  Submit request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature detail: MCP */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm">
                <div className="text-gray-400 text-xs mb-4">// AI agent using RentalCheck MCP</div>
                <div className="text-green-400 mb-1">{'> list_requests({ status: "open" })'}</div>
                <div className="text-gray-300 mb-3 pl-2">{'[{ id: "f1...", title: "Leaking faucet", priority: "high" }, ...]'}</div>
                <div className="text-green-400 mb-1">{'> update_request_status({'}</div>
                <div className="text-green-400 mb-1 pl-4">{'  id: "f1...", status: "in-progress",'}</div>
                <div className="text-green-400 mb-1 pl-4">{'  notes: "Plumber scheduled for Friday"'}</div>
                <div className="text-green-400 mb-3">{'})' }</div>
                <div className="text-gray-300 pl-2">{'{ success: true, request: { status: "in-progress" } }'}</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <span>🤖</span>
                <span>MCP server</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Let AI agents manage{' '}
                <span className="text-indigo-600">maintenance for you</span>
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                RentalCheck ships with a built-in Model Context Protocol server. Connect it to Claude, GPT-4, or any MCP-compatible AI and let your agent list, create, and update maintenance requests through natural language.
              </p>
              <ul className="space-y-3">
                {[
                  'list_requests — filter by status and priority',
                  'get_request — fetch a single request by ID',
                  'update_request_status — change status and add notes',
                  'create_request — submit a new request programmatically',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">→</span>
                    <code className="text-xs">{item}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start managing maintenance the smart way
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Free plan available. No credit card needed. Up and running in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Get started free
            </a>
            <a
              href="/pricing"
              className="border border-indigo-400 text-white hover:bg-indigo-700 px-8 py-3 rounded-lg text-base font-medium transition-colors"
            >
              See pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
