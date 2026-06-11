import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'How It Works — excelENT Practice Solutions',
  description:
    'Three steps from new patient demand to recovered revenue: Attract, Convert, Optimize. See how excelENT works for an independent ENT practice.',
}

const steps: Array<{
  title: string
  description: string
  products: Array<{ name: string; href: string; framing: string }>
}> = [
  {
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
    title: 'Convert',
    description:
      "Inbound demand gets converted into kept appointments. Real-time insurance verification and 24/7 AI-driven scheduling capture every call — including the ones your front desk can't — and routes them straight into your EMR.",
    products: [
      {
        name: 'PS | Connect',
        href: '/b2b/solutions/connect',
        framing: 'Insurance verification and routing',
      },
      {
        name: 'PS | Lexi',
        href: '/b2b/solutions/lexi',
        framing: 'Virtual Office Assistant',
      },
    ],
  },
  {
    title: 'Optimize',
    description:
      'Once patients are in the door, we optimize the revenue side. ENT-specific RCM moves your denial rate from the industry baseline of 11.8% toward 2.5%, and our medical device portfolio supports the in-office procedures that drive practice profitability.',
    products: [
      {
        name: 'PS | RCM',
        href: '/b2b/solutions/rcm',
        framing: 'Revenue Cycle Management',
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
    title: 'Modular by Design',
    description:
      'Use any one step. Use all three. Practices come in at the bottleneck they feel most — patient volume, call coverage, or denial rate — and expand from there.',
  },
  {
    title: 'Built for ENT Specifically',
    description:
      'Not a generalist medtech vendor with an ENT skin. Every product, code, script, and procedure is built around what ENT practices actually do.',
  },
  {
    title: 'Aligned Incentives',
    description:
      'PS | RCM is priced as a percentage of collections. PS | Connect drives volume that you keep. Our growth depends on yours.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero — text left, image right */}
      <section
        aria-labelledby="hiw-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">How It Works</EyebrowTag>
              <h1
                id="hiw-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Three steps from new patient demand to recovered revenue.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                Attract patients. Convert them into kept appointments. Optimize
                the revenue and the procedures that follow. The whole platform
                is designed around this flow — and you can enter at whichever
                step you need most.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
                <Link
                  href="/b2b/solutions"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  Explore solutions
                  <ArrowRight />
                </Link>
              </div>
            </div>

            <aside aria-label="How it works imagery" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/heroes/b2b-how-it-works.webp"
                  alt="Two professionals collaborating over a tablet at a sunlit desk"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* The three steps — icons replace 01/02/03 */}
      <section
        aria-labelledby="steps-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <h2 id="steps-heading" className="sr-only">
            The three steps
          </h2>
          <ol role="list" className="flex flex-col">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="grid lg:grid-cols-12 gap-8 lg:gap-16 py-10 md:py-14 border-t border-edge first:border-t-0"
              >
                <div className="lg:col-span-3 flex flex-row items-baseline gap-4">
                  <span className="font-display font-bold text-4xl md:text-5xl text-[color:var(--color-accent-primary)] leading-none">
                    #{i + 1}
                  </span>
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-none">
                    {step.title}
                  </h3>
                </div>
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <p className="body-lead text-pretty">{step.description}</p>
                </div>
                <div className="lg:col-span-3 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-ink-tertiary uppercase tracking-widest">
                    Solutions Utilized
                  </span>
                  <ul role="list" className="flex flex-col gap-3">
                    {step.products.map((p) => (
                      <li key={p.name}>
                        <Link href={p.href} className="block group">
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

      {/* How we think about it — universal box pattern */}
      <section
        aria-labelledby="philosophy-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">How we think about it</EyebrowTag>
            <h2
              id="philosophy-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              The principles behind the three steps.
            </h2>
          </div>
          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {philosophy.map((p) => (
              <li
                key={p.title}
                className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-8 flex flex-col gap-3"
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
