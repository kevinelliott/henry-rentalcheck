import Link from 'next/link'

export const metadata = {
  title: 'Pricing — RentalCheck',
  description: 'Simple, transparent pricing for landlords of all sizes. Start free, scale as you grow.',
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for individual landlords just getting started.',
    highlight: false,
    cta: 'Get started free',
    ctaHref: '/dashboard',
    features: [
      '1 property',
      '5 units',
      '20 maintenance requests/month',
      'No-login tenant portal',
      'REST API access',
      'Status tracking',
      'Priority triage',
      'Community support',
    ],
    notIncluded: [
      'MCP server',
      'Priority support',
      'White-label',
      'SLA guarantee',
    ],
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For growing landlords managing multiple properties.',
    highlight: true,
    popular: true,
    cta: 'Start free trial',
    ctaHref: '/dashboard',
    features: [
      '5 properties',
      '25 units',
      'Unlimited maintenance requests',
      'No-login tenant portal',
      'REST API access',
      'MCP server',
      'Status tracking',
      'Priority triage',
      'Notes system',
      'Priority email support',
    ],
    notIncluded: [
      'White-label',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For professional property managers and large portfolios.',
    highlight: false,
    cta: 'Contact sales',
    ctaHref: '/dashboard',
    features: [
      'Unlimited properties',
      'Unlimited units',
      'Unlimited maintenance requests',
      'No-login tenant portal',
      'REST API access',
      'MCP server',
      'Status tracking',
      'Priority triage',
      'Notes system',
      'White-label portal',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
    ],
    notIncluded: [],
  },
]

const comparison = [
  { feature: 'No-login tenant portal', rentalcheck: true, buildingos: false, maintenancepro: false },
  { feature: 'MCP server', rentalcheck: true, buildingos: false, maintenancepro: false },
  { feature: 'REST API', rentalcheck: 'Full', buildingos: 'Partial', maintenancepro: false },
  { feature: 'Starting price', rentalcheck: '$0', buildingos: '$49', maintenancepro: '$79' },
  { feature: 'Multi-property', rentalcheck: true, buildingos: true, maintenancepro: true },
  { feature: 'Priority triage', rentalcheck: true, buildingos: true, maintenancepro: false },
  { feature: 'Free plan', rentalcheck: true, buildingos: false, maintenancepro: false },
]

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade or downgrade your plan at any time from your billing settings. Upgrades take effect immediately; downgrades take effect at the start of the next billing cycle.',
  },
  {
    q: 'What happens when I hit the free plan request limit?',
    a: 'On the free plan, once you reach 20 maintenance requests in a calendar month, new submissions will be queued. Upgrade to Starter for unlimited requests.',
  },
  {
    q: 'Is there a long-term contract?',
    a: 'No. RentalCheck is billed month-to-month. You can cancel anytime and will retain access until the end of your billing period.',
  },
  {
    q: 'Do tenants need to pay anything?',
    a: 'Never. The tenant portal is completely free for tenants. They just click the link you share with them.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via Stripe. We do not store card details — all payment data is handled securely by Stripe.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If you are unsatisfied within the first 14 days of a paid plan, contact us and we will issue a full refund, no questions asked.',
  },
]

function Check() {
  return (
    <span className="text-green-600 font-bold">✓</span>
  )
}

function X() {
  return (
    <span className="text-gray-300">✗</span>
  )
}

function ComparisonValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check />
  if (value === false) return <X />
  return <span className="text-sm text-gray-700 font-medium">{value}</span>
}

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <span>💳</span>
          <span>Simple, transparent pricing</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-5 tracking-tight">
          Start free.{' '}
          <span className="text-indigo-600">Scale as you grow.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          No hidden fees. No per-unit charges. Just straightforward plans for landlords at every stage.
        </p>
      </section>

      {/* Pricing tiers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-2xl p-8 flex flex-col ${
                tier.highlight
                  ? 'border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-50 relative'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{tier.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-gray-500">{tier.description}</p>
              </div>

              <Link
                href={tier.ctaHref}
                className={`block text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors mb-8 ${
                  tier.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'border border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {tier.cta}
              </Link>

              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Included</div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.notIncluded.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">Not included</div>
                    <ul className="space-y-2.5">
                      {tier.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="w-4 h-4 flex items-center justify-center text-xs flex-shrink-0 text-gray-300">✗</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              How we compare
            </h2>
            <p className="text-gray-500">RentalCheck vs. the competition</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-gray-700 font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-indigo-600 font-semibold">RentalCheck</span>
                  </th>
                  <th className="px-6 py-4 text-center text-gray-500 font-medium">BuildingOS</th>
                  <th className="px-6 py-4 text-center text-gray-500 font-medium">Maintenance Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4 text-gray-700 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonValue value={row.rentalcheck} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonValue value={row.buildingos} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonValue value={row.maintenancepro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Frequently asked questions
          </h2>
          <p className="text-gray-500">Still have questions? We are here to help.</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-lg mx-auto">
            Join hundreds of landlords who already use RentalCheck to manage maintenance requests effortlessly.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Start for free — no credit card needed
          </Link>
        </div>
      </section>
    </div>
  )
}
