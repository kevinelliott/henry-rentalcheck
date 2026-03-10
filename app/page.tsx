import Link from 'next/link'

const features = [
  {
    icon: '🔗',
    title: 'Tenant Portal',
    description: 'Tenants submit maintenance requests via a unique URL. No login, no app download needed — just share the link.',
  },
  {
    icon: '📡',
    title: 'Real-time Tracking',
    description: 'Both landlords and tenants see live status updates from submitted to resolved, with full history.',
  },
  {
    icon: '⚡',
    title: 'REST API & MCP',
    description: 'Full REST API and Model Context Protocol server. Integrate with any tool or AI agent.',
  },
  {
    icon: '🚨',
    title: 'Priority Management',
    description: 'Classify requests as Emergency, High, Medium, or Low. Focus on what matters most first.',
  },
  {
    icon: '🏢',
    title: 'Multi-property',
    description: 'Manage unlimited properties and units from a single dashboard. Organized by property and unit.',
  },
  {
    icon: '💳',
    title: 'Stripe Billing',
    description: 'Built-in subscription management powered by Stripe. Upgrade, downgrade, or cancel anytime.',
  },
]

const comparisonRows = [
  { feature: 'No-login tenant portal', rentalcheck: true, appfolio: false, buildinglink: false, textemail: false },
  { feature: 'Request status tracking', rentalcheck: true, appfolio: true, buildinglink: true, textemail: false },
  { feature: 'REST API', rentalcheck: true, appfolio: true, buildinglink: false, textemail: false },
  { feature: 'MCP server', rentalcheck: true, appfolio: false, buildinglink: false, textemail: false },
  { feature: 'Free tier', rentalcheck: true, appfolio: false, buildinglink: false, textemail: true },
  { feature: 'Modern UI', rentalcheck: true, appfolio: false, buildinglink: false, textemail: false },
]

function Check({ yes }: { yes: boolean }) {
  if (yes) return <span className="text-green-500 font-bold text-lg">✓</span>
  return <span className="text-gray-300 font-bold text-lg">✗</span>
}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-8">
          <span>✨</span>
          <span>Now with MCP server support</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Stop managing maintenance{' '}
          <span className="text-indigo-600">over text</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          45 million renters in the US. Most maintenance requests still happen over text. Stop it.
          RentalCheck gives tenants a no-login portal and landlords a real dashboard to track everything.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors shadow-sm"
          >
            Start Free
          </Link>
          <Link
            href="/request/demo"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            View Demo
          </Link>
        </div>
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
            No credit card required
          </span>
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
            Free plan available
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            Setup in under 5 minutes
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to manage{' '}
            <span className="text-indigo-600">maintenance requests</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            From tenant submission to final resolution, RentalCheck covers the full lifecycle.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How we compare
            </h2>
            <p className="text-lg text-gray-500">See why landlords choose RentalCheck over the alternatives.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-indigo-600">RentalCheck</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">AppFolio</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">BuildingLink</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">Text/Email</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-6 text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center"><Check yes={row.rentalcheck} /></td>
                    <td className="py-3 px-4 text-center"><Check yes={row.appfolio} /></td>
                    <td className="py-3 px-4 text-center"><Check yes={row.buildinglink} /></td>
                    <td className="py-3 px-4 text-center"><Check yes={row.textemail} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ready to modernize your{' '}
          <span className="text-indigo-600">maintenance workflow?</span>
        </h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Join landlords who've already made the switch. Start for free — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors shadow-sm"
          >
            Start Free
          </Link>
          <Link
            href="/pricing"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <span className="font-semibold text-gray-900">RentalCheck</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
              <Link href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
            </div>
            <div className="text-sm text-gray-400">© 2026 RentalCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
