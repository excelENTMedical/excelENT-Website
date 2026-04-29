import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'How It Works — excelENT Practice Solutions',
  description:
    'Three steps from new patient demand to recovered revenue: Attract, Convert, Optimize. See how excelENT works for an independent ENT practice.',
}

const steps: Array<{
  n: string
  title: string
  description: string
  products: Array<{ name: string; href: string; framing: string }>
}> = [
  {
    n: '01',
    title: 'Attract',
    description:
      'We build awareness and demand for your practice across local markets. Patient education, condition-aware content, and digital outreach create a steady inbound flow of qualified sinus and allergy patients.',
    products: [
      {
        name: 'PS | Connect',
        href: '/b2b/solutions/connect',
        framing: 'Patient prospecting and matching',
      },
    ],
  },
  {
    n: '02',
    title: 'Convert',
    description:
      'Inbound demand gets converted into kept appointments. Real-time insurance verification and 24/7 AI-driven scheduling capture every call — including the ones your front desk can\'t — and routes them straight into your EMR.',
    products: [
      {
        name: 'PS | Connect',
        href: '/b2b/solutions/connect',
        framing: 'Insurance verification and routing',
      },
      {
        name: 'PS | Lexi',
        href: '/b2b/solutions/lexi',
        framing: 'AI virtual front desk',
      },
    ],
  },
  {
    n: '03',
    title: 'Optimize',
    description:
      'Once patients are in the door, we optimize the revenue side. ENT-specific RCM moves your denial rate from the industry baseline of 11.8% toward 2.5%, and our medical device portfolio supports the in-office procedures that drive practice profitability.',
    products: [
      {
        name: 'PS | RCM',
        href: '/b2b/solutions/rcm',
        framing: 'Revenue cycle management',
      },
      {
        name: 'BB8 Balloon',
        href: '/b2b/products/bb8',
        framing: 'In-office balloon sinuplasty',
      },
    ],
  },
]

const philosophy: Array<{ title: string; description: string }> = [
  {
    title: 'Modular by design',
    description:
      'Use any one step. Use all three. Practices come in at the bottleneck they feel most — patient volume, call coverage, or denial rate — and expand from there.',
  },
  {
    title: 'Built for ENT specifically',
    description:
      'Not a generalist medtech vendor with an ENT skin. Every product, code, script, and procedure is built around what ENT practices actually do.',
  },
  {
    title: 'Aligned incentives',
    description:
      'PS | RCM is priced as a percentage of collections. PS | Connect drives volume that you keep. Our growth depends on yours.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="Three steps from new patient demand to recovered revenue."
        description="Attract patients. Convert them into kept appointments. Optimize the revenue and the procedures that follow. The whole platform is designed around this flow — and you can enter at whichever step you need most."
      />

      <section aria-labelledby="steps-heading" className="bg-surface border-b border-edge">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <h2 id="steps-heading" className="sr-only">
            The three steps
          </h2>
          <ol role="list" className="flex flex-col">
            {steps.map((step) => (
              <li
                key={step.n}
                className="grid lg:grid-cols-12 gap-8 lg:gap-16 py-12 md:py-16 border-t border-edge first:border-t-0"
              >
                <div className="lg:col-span-3 flex flex-col gap-2">
                  <span className="font-display font-bold text-5xl md:text-6xl text-[color:var(--color-accent-primary)] leading-none">
                    {step.n}
                  </span>
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug mt-3">
                    {step.title}
                  </h3>
                </div>
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <p className="body-lead text-pretty">{step.description}</p>
                </div>
                <div className="lg:col-span-3 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-ink-tertiary uppercase tracking-widest">
                    Products in play
                  </span>
                  <ul role="list" className="flex flex-col gap-3">
                    {step.products.map((p) => (
                      <li key={p.name}>
                        <Link
                          href={p.href}
                          className="block group"
                        >
                          <span className="font-display font-semibold text-base md:text-lg text-ink group-hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast">
                            {p.name}
                          </span>
                          <span className="block text-sm text-ink-secondary leading-snug">
                            {p.framing}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="philosophy-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">How we think about it</EyebrowTag>
            <h2
              id="philosophy-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              The principles behind the three steps.
            </h2>
          </div>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {philosophy.map((p) => (
              <li
                key={p.title}
                className="bg-surface border border-edge p-8 flex flex-col gap-3"
              >
                <h3 className="font-display font-bold text-xl text-ink leading-snug">
                  {p.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {p.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
