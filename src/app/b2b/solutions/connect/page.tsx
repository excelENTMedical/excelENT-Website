import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import FAQAccordion from '@/components/b2b/FAQAccordion'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'PS | Connect — Patient Prospecting and Growth | excelENT',
  description:
    'Drive qualified ENT patient volume with location- and insurance-matched routing. 48-hour appointments. Real-time insurance verification.',
}

const iconProps = {
  width: 75,
  height: 75,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const ZapIcon = () => (
  <svg {...iconProps}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const TargetIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg {...iconProps}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg {...iconProps}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const capabilities: Array<{
  icon: ReactNode
  title: string
  description: string
}> = [
  {
    icon: <ZapIcon />,
    title: 'Fast Access',
    description:
      'We verify insurance in real-time and connect patients to partner ENTs who can see them within 48 hours.',
  },
  {
    icon: <TargetIcon />,
    title: 'Efficient Visits',
    description:
      'Patients are matched to your practice based on location, insurance coverage, and advanced diagnostic indicators.',
  },
  {
    icon: <CheckCircleIcon />,
    title: 'Minimally Invasive Options',
    description:
      'Partner practices can offer balloon sinuplasty and other in-office procedures, reducing the need for OR cases.',
  },
  {
    icon: <TrendingUpIcon />,
    title: 'Practice Growth Support',
    description:
      'We drive new sinus patient volume month over month — increasing procedure volume, scan volume, and revenue downstream.',
  },
]

const tiers: Array<{
  name: string
  framing: string
  bestFor: string
  emphasis: string
}> = [
  {
    name: 'Base PS | Connect',
    framing: 'Best for smaller and medium-sized markets',
    bestFor: 'Practices in markets less suited for digital ad spend ROI',
    emphasis:
      'Focus on referring-physician partnerships and community-led growth strategies.',
  },
  {
    name: 'Premium PS | Connect',
    framing: 'Best for medium markets with favorable demographics',
    bestFor:
      'Practices ready to layer paid acquisition on top of community work',
    emphasis:
      'Digital ads (Facebook and Google) plus referring-physician partnerships.',
  },
  {
    name: 'Platinum PS | Connect',
    framing: 'Best for larger practices ready for material patient volume',
    bestFor:
      'Practices with capacity and demographics to support an aggressive expansion',
    emphasis:
      'Multi-channel — digital, TV, radio, partnerships — coordinated by an ExcelENT growth team.',
  },
]

const businessImpacts: Array<{ title: string; description: string }> = [
  {
    title: 'Improved Patient Experience',
    description:
      'Faster access to care, clearer education, and smoother scheduling — patients arrive informed and supported from first touch to treatment.',
  },
  {
    title: 'Stronger Practice Brand',
    description:
      'Consistent patient flow, community visibility, and professional marketing position your practice as the go-to ENT in your market.',
  },
  {
    title: 'Higher-Quality Patient Mix',
    description:
      'Patients arrive better qualified, prepared for evaluation, and routed to the right service line. Visits become more productive.',
  },
  {
    title: 'Improved Staff Morale',
    description:
      'Clear patient routing and preparedness reduce daily friction for front desk and clinical teams. Calmer days, better outcomes.',
  },
]

const proofMetrics: Array<{
  value: string
  label: string
  caption: string
}> = [
  {
    value: '265K',
    label: 'Patients Reached',
    caption: 'Website visits across regional markets',
  },
  {
    value: '192',
    label: 'Kept Appointments',
    caption: 'Initial visits delivered to partner practices',
  },
  {
    value: '17',
    label: 'Completed Procedures',
    caption: 'Across multiple partner practices and markets',
  },
]

const faqs = [
  {
    question: 'How quickly can patients be routed to my practice?',
    answer:
      'Our standard target is a kept appointment within 48 hours of the initial patient contact. Insurance verification and demographic matching happen in real time before the patient is connected.',
  },
  {
    question: 'Do I need to be on a specific EMR to participate?',
    answer:
      "No. PS | Connect is EMR-agnostic for patient routing. PS | Lexi (our AI front desk) integrates more deeply with EMR scheduling, but Connect doesn't require any particular system.",
  },
  {
    question: "What happens if we can't accept a routed patient?",
    answer:
      "Our matching system uses your live capacity signals before routing. In the rare case a routed patient can't be seen, we have escalation paths with your ExcelENT growth lead and a service-level agreement on response times.",
  },
  {
    question: 'How is pricing structured?',
    answer:
      'Three monthly tiers (Base / Premium / Platinum) sized to your market and growth ambition. Pricing is set during your demo conversation — we tailor the tier to your patient capacity and local demographics rather than offering a single shelf rate.',
  },
]

export default function PSConnectPage() {
  return (
    <>
      {/* Hero — text on left, image on right (no data under) */}
      <section
        aria-labelledby="connect-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">PS | Connect</EyebrowTag>
              <h1
                id="connect-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Patient prospecting and growth, built for ENT.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                We bring in qualified sinus patients and route them to your
                practice — fast access, real-time insurance verification,
                location-matched, 48-hour appointments. You see more of the
                right patients without growing your front office.
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

            <aside
              aria-label="PS | Connect imagery"
              className="lg:col-span-5"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/heroes/b2b-connect.webp"
                  alt="A bright modern ENT clinic waiting area filled with patients"
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

      {/* Capabilities */}
      <section
        aria-labelledby="capabilities-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 md:mb-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="accent">Capabilities</EyebrowTag>
              <h2
                id="capabilities-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                What PS | Connect does for your practice.
              </h2>
            </div>
          </div>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {capabilities.map((c) => (
              <li
                key={c.title}
                className="p-6 md:p-8 lg:p-10 flex flex-col gap-4"
              >
                <span className="text-[color:var(--color-accent-primary)] self-center">
                  {c.icon}
                </span>
                <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug text-balance">
                  {c.title}
                </h3>
                <p className="text-sm md:text-base text-ink-secondary leading-relaxed text-pretty">
                  {c.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why this works — navy bg, white text */}
      <section
        aria-labelledby="proof-heading"
        className="relative border-b border-edge"
        style={{ background: '#061b42' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="inverse">Why this works</EyebrowTag>
            <h2
              id="proof-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-white text-balance"
            >
              Real reach. Real downstream demand.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {proofMetrics.map((m) => (
              <li key={m.label} className="flex flex-col gap-2 text-white">
                <div className="stat-display text-5xl md:text-6xl text-white">
                  {m.value}
                </div>
                <div className="text-sm md:text-base font-semibold text-white leading-snug">
                  {m.label}
                </div>
                <div className="text-xs md:text-sm text-white leading-snug">
                  {m.caption}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Business impact — purple left border */}
      <section
        aria-labelledby="impact-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Business impact</EyebrowTag>
            <h2
              id="impact-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              What changes for the practice.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
          >
            {businessImpacts.map((impact) => (
              <li
                key={impact.title}
                className="flex flex-col gap-3 border-l-4 border-[color:var(--color-accent-primary)] pl-5"
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

      {/* Solutions tiers (renamed from Service tiers) */}
      <section
        aria-labelledby="tiers-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Solutions tiers</EyebrowTag>
            <h2
              id="tiers-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Three tiers, sized to your market.
            </h2>
            <p className="body-lead max-w-2xl mt-2">
              Pricing is tailored on the demo call. We match the tier to your
              patient capacity and local demographics — not a shelf rate.
            </p>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {tiers.map((tier) => (
              <li
                key={tier.name}
                className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-8 flex flex-col gap-4"
              >
                <h3 className="font-display font-bold text-xl text-ink leading-snug">
                  {tier.name}
                </h3>
                <p className="text-sm font-semibold text-[color:var(--color-accent-primary)] uppercase tracking-wide">
                  {tier.framing}
                </p>
                <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                  <span className="font-semibold text-ink">Best for: </span>
                  {tier.bestFor}
                </p>
                <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                  {tier.emphasis}
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
            About PS | Connect
          </>
        }
        items={faqs}
      />

      <InlineDemoCTA />
    </>
  )
}
