import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import FAQAccordion from '@/components/b2b/FAQAccordion'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'PS | Lexi — Virtual Office Assistant for ENT Practices | excelENT',
  description:
    'HIPAA-compliant AI assistant that answers calls, schedules appointments, and verifies insurance — built specifically for ENT workflows.',
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

const UserIcon = () => (
  <svg {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const UsersIcon = () => (
  <svg {...iconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const BuildingIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
  </svg>
)

const flowSteps: Array<{ title: ReactNode; description: string }> = [
  {
    title: (
      <>
        Patient calls
        <br />
        your phone line
      </>
    ),
    description:
      'Lexi answers immediately — no phone tree, no hold time. Available 24/7, including overflow during business hours.',
  },
  {
    title: (
      <>
        PS | Lexi conducts
        <br />
        the conversation
      </>
    ),
    description:
      'A virtual office assistant trained on ENT-specific knowledge — sinus, allergy, balloon procedures, scheduling, insurance.',
  },
  {
    title: (
      <>
        Encrypted transmission
        <br />
        and transcript
      </>
    ),
    description:
      'All call audio and structured data is encrypted in transit and at rest. Full transcripts available for staff review.',
  },
  {
    title: (
      <>
        Secure
        <br />
        HIPAA-Compliant Cloud
      </>
    ),
    description:
      'BAA-backed infrastructure. Strict access controls. Patient information processed only on the systems and roles that need it.',
  },
  {
    title: (
      <>
        Handoff
        <br />
        to your EMR
      </>
    ),
    description:
      'Confirmed appointments and patient details flow directly into your existing EMR scheduling system.',
  },
]

const audienceImpact: Array<{
  icon: ReactNode
  audience: string
  title: string
  description: string
}> = [
  {
    icon: <UserIcon />,
    audience: 'For patients',
    title: 'Faster Help, Fewer Headaches',
    description:
      'Patients get scheduling and answers immediately — no phone trees, no long hold times. The experience feels human and capable.',
  },
  {
    icon: <UsersIcon />,
    audience: 'For your staff',
    title: 'Less Mundane Work, More Meaningful Moments',
    description:
      'Lexi handles repetitive routine questions so front-desk and clinical teams can focus on higher-value conversations and in-office care.',
  },
  {
    icon: <BuildingIcon />,
    audience: 'For the practice',
    title: 'Smarter Operations, Real-Time Insight',
    description:
      'Capture calls you would have lost. Verify insurance before the appointment. Track conversion from inquiry to scheduled visit.',
  },
]

const compliance: Array<{ title: string; description: string }> = [
  {
    title: 'HIPAA-Compliant Infrastructure',
    description:
      'Lexi runs on HIPAA-enabled platforms. Patient information is handled according to healthcare privacy standards.',
  },
  {
    title: 'Business Associate Agreements',
    description:
      'BAAs with our technology partners and participating practices ensure all parties handling protected health information meet HIPAA requirements.',
  },
  {
    title: 'Secure Data Handling',
    description:
      'All information collected from patients is encrypted in transit and at rest, with strict access controls protecting patient privacy.',
  },
  {
    title: 'Controlled Data Flow',
    description:
      'Patient information collected by Lexi is securely transmitted to your practice workflow before being entered into the EMR.',
  },
]

const tiers: Array<{ name: string; framing: string; emphasis: string }> = [
  {
    name: 'Base PS | Lexi',
    framing: 'After-hours coverage',
    emphasis:
      'Real-time insurance verification. After-hours only, up to 100 patient calls per month. Configured at the top of your phone tree or as a scheduling prompt.',
  },
  {
    name: 'Premium PS | Lexi',
    framing: 'Educational hotline + procedural Q&A',
    emphasis:
      'Base features plus an educational hotline for balloon-related questions, pre/post-op education, up to 250 patient calls per month.',
  },
  {
    name: 'Unlimited PS | Lexi',
    framing: 'Full 24/7 coverage at any volume',
    emphasis:
      'Premium features plus unlimited calls. Full 24/7 access regardless of call volume — built for high-volume practices.',
  },
]

const faqs = [
  {
    question: 'Will Lexi sound robotic or hold patients in a phone tree?',
    answer:
      "No. Lexi is conversational from the first second — no IVR, no 'press 1 for…'. Patients describe the experience as faster and less frustrating than a traditional front desk on a busy day.",
  },
  {
    question: 'How does Lexi integrate with our EMR?',
    answer:
      'We support integrations with the major ENT EMRs for appointment scheduling and confirmation handoff. Detailed mapping happens during the onboarding conversation. If your EMR isn\'t on our list, we\'ll review it during the demo.',
  },
  {
    question: 'What about HIPAA compliance?',
    answer:
      'Lexi operates on HIPAA-enabled infrastructure with encryption in transit and at rest, strict access controls, and BAAs with our technology partners and participating practices.',
  },
  {
    question: "What happens when Lexi can't handle a call?",
    answer:
      'Edge cases route to your existing escalation path — voicemail, on-call, or a designated practice phone line — so nothing is dropped. Lexi is designed to expand your team\'s capacity, not replace human judgment for clinical questions.',
  },
  {
    question: 'How is pricing structured?',
    answer:
      'Three monthly tiers (Base / Premium / Unlimited) sized to call volume and use case. Pricing is set during your demo conversation.',
  },
]

export default function PSLexiPage() {
  return (
    <>
      {/* Hero — text left, image right */}
      <section
        aria-labelledby="lexi-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">PS | Lexi</EyebrowTag>
              <h1
                id="lexi-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                A 24/7 virtual office assistant, designed for ENT.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                An AI assistant trained specifically for ENT practices —
                answering calls, scheduling appointments, verifying insurance,
                and handling routine questions. HIPAA-compliant. EMR-integrated.
                Always on.
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

            <aside aria-label="PS | Lexi imagery" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/heroes/b2b-lexi.webp"
                  alt="A wireless headset and tablet on a modern medical office desk"
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

      {/* Audience impact — icons, no border */}
      <section
        aria-labelledby="audience-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Three audiences, one system</EyebrowTag>
            <h2
              id="audience-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Lexi creates value across the practice and the healthcare system.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {audienceImpact.map((row) => (
              <li
                key={row.audience}
                className="p-6 md:p-8 lg:p-10 flex flex-col gap-4"
              >
                <span className="text-[color:var(--color-accent-primary)] self-center">
                  {row.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-accent-primary)]">
                  {row.audience}
                </span>
                <h3 className="font-display font-bold text-xl md:text-2xl text-ink leading-snug">
                  {row.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {row.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works — icons replace step numbers */}
      <section
        aria-labelledby="flow-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-9 md:py-[60px] lg:py-[72px]">
          <div className="flex flex-col gap-3 max-w-3xl mb-8 md:mb-9">
            <EyebrowTag tone="accent">How it works</EyebrowTag>
            <h2
              id="flow-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Five steps from inbound call to confirmed appointment.
            </h2>
          </div>

          {/* Desktop — staircase: each step offset down-and-right with an L-connector */}
          <ol
            role="list"
            className="hidden lg:grid grid-cols-5 gap-x-6 items-start"
          >
            {flowSteps.map((step, i) => (
              <li
                key={i}
                className="relative flex flex-col gap-4 min-h-[260px]"
                style={{ marginTop: `${i * 72}px` }}
              >
                <span className="stat-display font-display font-bold text-5xl text-[color:var(--color-accent-primary)] leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display font-bold text-base xl:text-lg text-ink leading-snug text-balance">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-secondary leading-relaxed text-pretty">
                  {step.description}
                </p>

                {/* L-connector — responsive: spans current "0N" right edge → above next "0N" via CSS divs.
                    Right edge extends past current column into the next column's gutter so it lands above "02" at any breakpoint. */}
                {i < flowSteps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none text-[color:var(--color-accent-primary)]"
                    style={{
                      top: '22px',
                      left: '84px',
                      right: '-60px',
                      height: '60px',
                    }}
                  >
                    {/* Horizontal segment across the top */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-current rounded-full" />
                    {/* Vertical drop on the right side (above next "0N") */}
                    <div
                      className="absolute top-0 right-0 w-[2px] bg-current rounded-full"
                      style={{ height: '50px' }}
                    />
                    {/* Down-pointing arrowhead at the end of the vertical drop */}
                    <svg
                      className="absolute"
                      style={{ right: '-6px', top: '40px', overflow: 'visible' }}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1,3 7,10 13,3" />
                    </svg>
                  </div>
                )}
              </li>
            ))}
          </ol>

          {/* Mobile/tablet — vertical numbered timeline */}
          <ol role="list" className="lg:hidden flex flex-col">
            {flowSteps.map((step, i) => (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-8 items-start py-6 md:py-8 border-t border-edge first:border-t-0"
              >
                <span className="stat-display font-display font-bold text-4xl text-[color:var(--color-accent-primary)] leading-none min-w-[3rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-ink leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-base text-ink-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* HIPAA & Compliance — purple left border, bumped to 4px */}
      <section
        aria-labelledby="compliance-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="accent">HIPAA &amp; Compliance</EyebrowTag>
              <h2
                id="compliance-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Built for healthcare from the protocol up.
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
              From after-hours coverage to full-volume 24/7.
            </h2>
            <p className="body-lead max-w-2xl mt-2">
              Pricing is tailored on the demo call to match your call volume
              and operational priorities.
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
            About PS | Lexi
          </>
        }
        items={faqs}
      />

      <InlineDemoCTA />
    </>
  )
}
