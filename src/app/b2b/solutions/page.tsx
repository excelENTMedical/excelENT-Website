import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import SolutionTile from '@/components/b2b/SolutionTile'
import CaseStudyBlock from '@/components/b2b/CaseStudyBlock'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

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
      <PageHero
        eyebrow="Practice Solutions Platform"
        title="The full operations stack for independent ENT practices."
        description="Three connected products that drive patients in, handle the calls, and recover the revenue. Modular by design — use one or use all three."
      />

      <section
        aria-labelledby="solutions-grid-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <h2 id="solutions-grid-heading" className="sr-only">
            All three solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 border border-edge divide-y md:divide-y-0 md:divide-x divide-edge">
            <SolutionTile
              productLabel="PS | Connect"
              title="Patient prospecting and growth"
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
              title="AI virtual front desk"
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
              title="Revenue cycle management"
              description="Reduce denial rates from the 11.8% industry baseline to 2.5%. Recover revenue and stabilize cash flow with billing built for ENT."
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

      <section
        aria-labelledby="fit-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">Where each one fits</EyebrowTag>
            <h2
              id="fit-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              Pick the bottleneck. We&rsquo;ll fix it.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {fitMatrix.map((row) => (
              <li
                key={row.name}
                className="bg-surface border border-edge p-8 flex flex-col gap-4"
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
                  className="text-sm font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast mt-auto pt-4 border-t border-edge"
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
