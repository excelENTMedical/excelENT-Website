import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import Stat from '@/components/b2b/Stat'
import FAQAccordion from '@/components/b2b/FAQAccordion'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'PS | RCM — Revenue Cycle Management for ENT Practices | excelENT',
  description:
    'Reduce denial rates from 11.8% industry baseline to 2.5%. ENT-specific coding, claims management, and cash-flow recovery.',
}

const financialFacts: Array<{ stat: string; label: string; caption: string }> = [
  {
    stat: '11.8%',
    label: 'Industry denial rate',
    caption: 'Some practices see 15%+. Aptarro 2026 baseline.',
  },
  {
    stat: '2.5%',
    label: 'excelENT denial rate',
    caption: 'Achieved at partner practices on ENT-specific coding.',
  },
  {
    stat: '$57.23',
    label: 'Per-claim rework cost',
    caption: 'Up from $43.84 in 2022 — increasing every year.',
  },
  {
    stat: '57%',
    label: 'Denials successfully appealed',
    caption: 'The other 43% is permanent revenue loss.',
  },
]

const compliance: Array<{ title: string; description: string }> = [
  {
    title: 'OIG exclusion risk',
    description:
      'Systematic billing errors can lead to provider exclusion from federal programs. We code defensively from day one.',
  },
  {
    title: 'State medical board actions',
    description:
      'Fraudulent billing patterns trigger licensing investigations. ENT-specific coding reduces audit triggers.',
  },
  {
    title: 'Malpractice exposure',
    description:
      'Billing disputes often escalate to quality-of-care allegations. Clean billing reduces this surface area.',
  },
  {
    title: 'Audit triggers',
    description:
      'Late submissions and coding inconsistencies increase RAC and ZPIC audit probability. Our process is built around timeliness.',
  },
]

const businessImpacts: Array<{ title: string; description: string }> = [
  {
    title: 'Stronger cash flow',
    description:
      'Faster claim turnaround and lower denial rates put cash in the practice account weeks earlier.',
  },
  {
    title: 'Less administrative burden',
    description:
      'Your front office stops chasing denials. Routine coding and submission moves off your plate entirely.',
  },
  {
    title: 'Lower financial risk',
    description:
      'Fewer denied claims, fewer appeals, less exposure to compliance triggers. Sleep better at end of quarter.',
  },
  {
    title: 'Real visibility',
    description:
      'Diagnostic dashboards show denial root causes in real time, so you can spot upstream workflow issues before they compound.',
  },
]

const faqs = [
  {
    question: 'How long does the diagnostic take?',
    answer:
      'The initial denial-rate diagnostic happens during the first two weeks of engagement. We pull a sample of recent claims and identify the dominant denial drivers — coding, eligibility, documentation, or workflow.',
  },
  {
    question: 'Do we need to switch EMRs?',
    answer:
      'No. PS | RCM operates on top of your existing EMR. We integrate with the practice management system you already use rather than asking you to migrate.',
  },
  {
    question: "What's the typical timeline to see denial-rate improvement?",
    answer:
      "Most practices see meaningful improvement within the first full claim cycle (60–90 days). Reaching the 2.5% benchmark depends on your starting point and the complexity of payer mix.",
  },
  {
    question: 'How is pricing structured?',
    answer:
      'PS | RCM is priced as a percentage of collections rather than a flat monthly fee — so our incentives are aligned with yours. The exact rate is set during the demo and depends on volume and starting denial rate.',
  },
  {
    question: 'What about compliance and audits?',
    answer:
      "Coding accuracy and audit-trail documentation are core to the service. We maintain BAAs and follow OIG-aligned practices. Our coders are credentialed and ENT-specific, not generalists.",
  },
]

export default function PSRCMPage() {
  return (
    <>
      <PageHero
        eyebrow="PS | RCM"
        title="Cut denials. Recover revenue. Stabilize cash flow."
        description="ENT-specific revenue cycle management — built around your coding patterns, payer mix, and procedure types. We move denial rates from the 11.8% industry baseline toward 2.5%, and we share the upside."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/b2b/request-demo" className="btn-b2b-primary">
            Request a Demo
          </Link>
          <Link
            href="/b2b/solutions"
            className="text-sm font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
          >
            <ArrowRight className="rotate-180" />
            All Solutions
          </Link>
        </div>
      </PageHero>

      <section
        aria-labelledby="problem-heading"
        className="bg-surface-inverse text-[color:var(--color-text-inverse)] border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="inverse">The financial reality</EyebrowTag>
            <h2
              id="problem-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-balance"
            >
              For a $3M practice, denials are a $354K&ndash;$450K annual problem.
            </h2>
            <p className="body-lead text-neutral-300 max-w-2xl mt-2">
              Industry denial rates surged to 11.8% in 2026, and the cost of
              reworking each claim is rising every year. The math compounds —
              quietly, then quickly.
            </p>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12"
          >
            {financialFacts.map((f) => (
              <li
                key={f.label}
                className="flex flex-col border-l-2 border-neutral-700 pl-5"
              >
                <Stat
                  value={f.stat}
                  label={f.label}
                  caption={f.caption}
                  size="lg"
                  inverse
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="compliance-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="default">Compliance exposure</EyebrowTag>
              <h2
                id="compliance-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Bad billing is a regulatory problem, not just a financial one.
              </h2>
            </div>
            <ul role="list" className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {compliance.map((c) => (
                <li key={c.title} className="flex flex-col gap-3 border-l-2 border-edge pl-5">
                  <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                    {c.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="impact-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">What changes</EyebrowTag>
            <h2
              id="impact-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Four shifts you&rsquo;ll feel in the first quarter.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {businessImpacts.map((impact) => (
              <li key={impact.title} className="flex flex-col gap-3 bg-surface border border-edge p-6 md:p-8">
                <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                  {impact.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {impact.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQAccordion title="Common questions about PS | RCM" items={faqs} />

      <InlineDemoCTA />
    </>
  )
}
