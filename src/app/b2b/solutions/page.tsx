import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import SolutionTile from '@/components/b2b/SolutionTile'
import CaseStudyBlock from '@/components/b2b/CaseStudyBlock'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'Solutions — excelENT Practice Solutions Platform',
  description:
    'Three connected products that drive patients in, handle the calls, and recover the revenue. PS | Connect, PS | Lexi, PS | RCM.',
}

const fitMatrix: Array<{
  name: string
  bestFor: string
  detail: string
}> = [
  {
    name: 'PS | Connect',
    bestFor: 'Practices with capacity to fill',
    detail:
      'Use when your bottleneck is patient volume. We handle the marketing and route qualified, insurance-verified patients to your schedule.',
  },
  {
    name: 'PS | Lexi',
    bestFor: 'Practices losing patients to phone friction',
    detail:
      'Use when your front desk is overwhelmed or after-hours calls are going unanswered. Lexi covers what your team cannot.',
  },
  {
    name: 'PS | RCM',
    bestFor: 'Practices bleeding revenue on denials',
    detail:
      'Use when claim denials are above 8% or your billing function is reactive. We rebuild the revenue cycle around ENT-specific coding.',
  },
]

export default function SolutionsOverviewPage() {
  return (
    <>
      {/* Hero — text left, image right */}
      <section
        aria-labelledby="solutions-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">Practice Solutions Platform</EyebrowTag>
              <h1
                id="solutions-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                The full operations stack for independent ENT practices.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                Three connected products that drive patients in, handle the
                calls, and recover the revenue. Modular by design — use one or
                use all three.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
                <Link
                  href="/b2b/how-it-works"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  See how it works
                  <ArrowRight />
                </Link>
              </div>
            </div>

            <aside aria-label="Solutions overview imagery" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/heroes/b2b-solutions.webp"
                  alt="A modern ENT practice workspace showing a clean operations dashboard"
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

      {/* All three solutions — universal box pattern (left purple border via SolutionTile) */}
      <section
        aria-labelledby="solutions-grid-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <h2 id="solutions-grid-heading" className="sr-only">
            All three solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <SolutionTile
              productLabel="PS | Connect"
              title="Patient Prospecting and Growth"
              description="We bring in qualified sinus patients and route them to your practice — fast access, real-time insurance verification, 48-hour appointments."
              bullets={[
                'Real-time insurance verification',
                'Location- and demographic-matched routing',
                'Referring-physician partnership strategies',
              ]}
              href="/b2b/solutions/connect"
            />
            <SolutionTile
              productLabel="PS | Lexi"
              title="Virtual Office Assistant"
              description="An ENT-specific AI assistant that answers calls, schedules appointments, and verifies insurance — HIPAA-compliant, EMR-integrated."
              bullets={[
                'After-hours and overflow call answering',
                'EMR scheduling integration',
                'BAA-backed HIPAA infrastructure',
              ]}
              href="/b2b/solutions/lexi"
            />
            <SolutionTile
              productLabel="PS | RCM"
              title="Revenue Cycle Management"
              description="Reduce denial rates from the 11.8% industry baseline to 2.5%. For ENT, by ENT billing experts — recover revenue and stabilize cash flow."
              bullets={[
                'Denial-rate diagnostic on day one',
                'ENT-specific coding and audit-trail',
                'Cash-flow improvement, not just collections',
              ]}
              href="/b2b/solutions/rcm"
            />
          </div>
        </div>
      </section>

      {/* Where each one fits — universal box pattern */}
      <section
        aria-labelledby="fit-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Where each one fits</EyebrowTag>
            <h2
              id="fit-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              How Our Solutions Work Together
            </h2>
            <p className="body-lead mt-2 max-w-2xl text-pretty">
              Pick the bottleneck. We&rsquo;ll remove it and unlock your
              potential.
            </p>
          </div>

          <ul role="list" className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {fitMatrix.map((row) => (
              <li
                key={row.name}
                className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-8 flex flex-col gap-4"
              >
                <h3 className="font-display font-bold text-xl text-ink">
                  {row.name}
                </h3>
                <p className="text-sm font-semibold text-[color:var(--color-accent-primary)] uppercase tracking-wide">
                  {row.bestFor}
                </p>
                <p className="text-base text-ink-secondary leading-relaxed flex-grow">
                  {row.detail}
                </p>
                <Link
                  href={`/b2b/solutions/${row.name.split(' | ')[1].toLowerCase()}`}
                  className="text-sm font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast mt-auto pt-4"
                >
                  Learn more about {row.name} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CaseStudyBlock />
      <InlineDemoCTA />
    </>
  )
}
