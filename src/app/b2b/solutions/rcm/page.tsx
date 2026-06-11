import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
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
    label: 'Industry Denial Rate',
    caption: 'Some practices see 15%+. Aptarro 2026 baseline.',
  },
  {
    stat: '2.5%',
    label: 'excelENT Denial Rate',
    caption: 'Achieved at partner practices on ENT-specific coding.',
  },
  {
    stat: '$57.23',
    label: 'Per-Claim Rework Cost',
    caption: 'Up from $43.84 in 2022 — increasing every year.',
  },
  {
    stat: '57%',
    label: 'Denials Successfully Appealed',
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
    title: 'State Medical Board Actions',
    description:
      'Fraudulent billing patterns trigger licensing investigations. ENT-specific coding reduces audit triggers.',
  },
  {
    title: 'Malpractice Exposure',
    description:
      'Billing disputes often escalate to quality-of-care allegations. Clean billing reduces this surface area.',
  },
  {
    title: 'Audit Triggers',
    description:
      'Late submissions and coding inconsistencies increase RAC and ZPIC audit probability. Our process is built around timeliness.',
  },
]

const businessImpacts: Array<{ title: string; description: string }> = [
  {
    title: 'Stronger Cash Flow',
    description:
      'Faster claim turnaround and lower denial rates put cash in the practice account weeks earlier.',
  },
  {
    title: 'Less Administrative Burden',
    description:
      'Your front office stops chasing denials. Routine coding and submission moves off your plate entirely.',
  },
  {
    title: 'Lower Financial Risk',
    description:
      'Fewer denied claims, fewer appeals, less exposure to compliance triggers. Sleep better at end of quarter.',
  },
  {
    title: 'Real Visibility',
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
      {/* Hero — text left, image right (no data under) */}
      <section
        aria-labelledby="rcm-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">PS | RCM</EyebrowTag>
              <h1
                id="rcm-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Reduce Denials. Recover revenue. Stabilize cash flow.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                ENT-specific revenue cycle management — built around your
                coding patterns, payer mix, and procedure types. We move denial
                rates from the 11.8% industry baseline toward 2.5%, and we
                share the upside.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
                <Link
                  href="/b2b/solutions"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  <ArrowRight className="rotate-180" />
                  All Solutions
                </Link>
              </div>
            </div>

            <aside aria-label="PS | RCM imagery" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/heroes/b2b-rcm.webp"
                  alt="A modern medical billing operations workspace with a financial dashboard"
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

      {/* The financial reality — navy bg, white text */}
      <section
        aria-labelledby="problem-heading"
        className="relative border-b border-edge"
        style={{ background: '#061b42' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="inverse">The financial reality</EyebrowTag>
            <h2
              id="problem-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-white text-balance"
            >
              For a $3M practice, denials are a $354K&ndash;$450K annual problem.
            </h2>
            <p className="body-lead text-white max-w-2xl mt-2">
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
              <li key={f.label} className="flex flex-col gap-2 text-white">
                <div className="stat-display text-5xl md:text-6xl text-white">
                  {f.stat}
                </div>
                <div className="text-sm md:text-base font-semibold text-white leading-snug">
                  {f.label}
                </div>
                <div className="text-xs md:text-sm text-white leading-snug">
                  {f.caption}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compliance exposure — purple left border */}
      <section
        aria-labelledby="compliance-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="accent">Compliance exposure</EyebrowTag>
              <h2
                id="compliance-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Faulty billing is a regulatory problem, not just a financial one.
              </h2>
            </div>
            <ul
              role="list"
              className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10"
            >
              {compliance.map((c) => (
                <li
                  key={c.title}
                  className="flex flex-col gap-3 border-l-4 border-[color:var(--color-accent-primary)] pl-5"
                >
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

      {/* What changes (business impact) — universal box pattern */}
      <section
        aria-labelledby="impact-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">What changes</EyebrowTag>
            <h2
              id="impact-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Four shifts you&rsquo;ll feel in the first quarter.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
          >
            {businessImpacts.map((impact) => (
              <li
                key={impact.title}
                className="flex flex-col gap-3 bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-6 md:p-8"
              >
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

      <FAQAccordion
        title={
          <>
            Common Questions
            <br />
            About PS | RCM
          </>
        }
        items={faqs}
      />

      <InlineDemoCTA />
    </>
  )
}
