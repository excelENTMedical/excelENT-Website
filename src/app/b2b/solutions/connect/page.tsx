import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import Stat from '@/components/b2b/Stat'
import FAQAccordion from '@/components/b2b/FAQAccordion'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'PS | Connect — Patient Prospecting and Growth | excelENT',
  description:
    'Drive qualified ENT patient volume with location- and insurance-matched routing. 48-hour appointments. Real-time insurance verification.',
}

const capabilities: Array<{ title: string; description: string }> = [
  {
    title: 'Fast access',
    description:
      'We verify insurance in real-time and connect patients to partner ENTs who can see them within 48 hours.',
  },
  {
    title: 'Efficient visits',
    description:
      'Patients are matched to your practice based on location, insurance coverage, and advanced diagnostic indicators.',
  },
  {
    title: 'Minimally invasive options',
    description:
      'Partner practices can offer balloon sinuplasty and other in-office procedures, reducing the need for OR cases.',
  },
  {
    title: 'Practice growth support',
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
    title: 'Improved patient experience',
    description:
      'Faster access to care, clearer education, and smoother scheduling — patients arrive informed and supported from first touch to treatment.',
  },
  {
    title: 'Stronger practice brand',
    description:
      'Consistent patient flow, community visibility, and professional marketing position your practice as the go-to ENT in your market.',
  },
  {
    title: 'Higher-quality patient mix',
    description:
      'Patients arrive better qualified, prepared for evaluation, and routed to the right service line. Visits become more productive.',
  },
  {
    title: 'Improved staff morale',
    description:
      'Clear patient routing and preparedness reduce daily friction for front desk and clinical teams. Calmer days, better outcomes.',
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
      <PageHero
        eyebrow="PS | Connect"
        title="Patient prospecting and growth, built for ENT."
        description="We bring in qualified sinus patients and route them to your practice — fast access, real-time insurance verification, location-matched, 48-hour appointments. You see more of the right patients without growing your front office."
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
        aria-labelledby="capabilities-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="default">Capabilities</EyebrowTag>
              <h2
                id="capabilities-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                What PS | Connect does for your practice.
              </h2>
            </div>
            <ul role="list" className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {capabilities.map((c, i) => (
                <li key={c.title} className="flex flex-col gap-3">
                  <span className="font-display font-bold text-sm tracking-widest text-[color:var(--color-accent-primary)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
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
        aria-labelledby="proof-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Why this works</EyebrowTag>
            <h2
              id="proof-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Real reach. Real downstream demand.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <li className="border-l-2 border-[color:var(--color-accent-primary)] pl-5">
              <Stat
                value="265K"
                label="Patients reached"
                caption="Website visits across regional markets"
                size="lg"
              />
            </li>
            <li className="border-l-2 border-[color:var(--color-accent-primary)] pl-5">
              <Stat
                value="192"
                label="Kept appointments"
                caption="Initial visits delivered to partner practices"
                size="lg"
              />
            </li>
            <li className="border-l-2 border-[color:var(--color-accent-primary)] pl-5">
              <Stat
                value="17"
                label="Completed procedures"
                caption="Across multiple partner practices and markets"
                size="lg"
              />
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="impact-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">Business impact</EyebrowTag>
            <h2
              id="impact-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              What changes for the practice.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {businessImpacts.map((impact) => (
              <li key={impact.title} className="flex flex-col gap-3 border-l-2 border-edge pl-5">
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

      <section
        aria-labelledby="tiers-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">Service tiers</EyebrowTag>
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

          <ul role="list" className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier) => (
              <li
                key={tier.name}
                className="bg-surface border border-edge p-8 flex flex-col gap-4"
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

      <FAQAccordion title="Common questions about PS | Connect" items={faqs} />

      <InlineDemoCTA />
    </>
  )
}
