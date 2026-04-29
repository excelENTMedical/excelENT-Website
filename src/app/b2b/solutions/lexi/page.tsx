import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import FAQAccordion from '@/components/b2b/FAQAccordion'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'
import ArrowRight from '@/components/b2b/ArrowRight'

export const metadata: Metadata = {
  title: 'PS | Lexi — AI Virtual Front Desk for ENT Practices | excelENT',
  description:
    'HIPAA-compliant AI assistant that answers calls, schedules appointments, and verifies insurance — built specifically for ENT workflows.',
}

const flowSteps: Array<{ n: string; title: string; description: string }> = [
  {
    n: '01',
    title: 'Patient calls your phone line',
    description:
      'Lexi answers immediately — no phone tree, no hold time. Available 24/7, including overflow during business hours.',
  },
  {
    n: '02',
    title: 'PS | Lexi conducts the conversation',
    description:
      'A virtual front-desk assistant trained on ENT-specific knowledge — sinus, allergy, balloon procedures, scheduling, insurance.',
  },
  {
    n: '03',
    title: 'Encrypted transmission and transcript',
    description:
      'All call audio and structured data is encrypted in transit and at rest. Full transcripts available for staff review.',
  },
  {
    n: '04',
    title: 'Secure HIPAA-compliant cloud',
    description:
      'BAA-backed infrastructure. Strict access controls. Patient information processed only on the systems and roles that need it.',
  },
  {
    n: '05',
    title: 'Handoff to your EMR',
    description:
      'Confirmed appointments and patient details flow directly into your existing EMR scheduling system.',
  },
]

const audienceImpact: Array<{ audience: string; title: string; description: string }> = [
  {
    audience: 'For patients',
    title: 'Faster help, fewer headaches',
    description:
      'Patients get scheduling and answers immediately — no phone trees, no long hold times. The experience feels human and capable.',
  },
  {
    audience: 'For your staff',
    title: 'Less mundane work, more meaningful moments',
    description:
      'Lexi handles repetitive routine questions so front-desk and clinical teams can focus on higher-value conversations and in-office care.',
  },
  {
    audience: 'For the practice',
    title: 'Smarter operations, real-time insight',
    description:
      'Capture calls you would have lost. Verify insurance before the appointment. Track conversion from inquiry to scheduled visit.',
  },
]

const compliance: Array<{ title: string; description: string }> = [
  {
    title: 'HIPAA-compliant infrastructure',
    description:
      'Lexi runs on HIPAA-enabled platforms. Patient information is handled according to healthcare privacy standards.',
  },
  {
    title: 'Business Associate Agreements',
    description:
      'BAAs with our technology partners and participating practices ensure all parties handling protected health information meet HIPAA requirements.',
  },
  {
    title: 'Secure data handling',
    description:
      'All information collected from patients is encrypted in transit and at rest, with strict access controls protecting patient privacy.',
  },
  {
    title: 'Controlled data flow',
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
      <PageHero
        eyebrow="PS | Lexi"
        title="A 24/7 virtual front desk, designed for ENT."
        description="An AI assistant trained specifically for ENT practices — answering calls, scheduling appointments, verifying insurance, and handling routine questions. HIPAA-compliant. EMR-integrated. Always on."
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
        aria-labelledby="audience-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">Three audiences, one system</EyebrowTag>
            <h2
              id="audience-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Lexi creates value across the practice and the healthcare system.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {audienceImpact.map((row) => (
              <li
                key={row.audience}
                className="border border-edge p-8 flex flex-col gap-4"
              >
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

      <section
        aria-labelledby="flow-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">How it works</EyebrowTag>
            <h2
              id="flow-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Five steps from inbound call to confirmed appointment.
            </h2>
          </div>

          <ol role="list" className="flex flex-col">
            {flowSteps.map((step) => (
              <li
                key={step.n}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 py-8 md:py-10 border-t border-edge first:border-t-0"
              >
                <span className="font-display font-bold text-2xl md:text-3xl text-[color:var(--color-accent-primary)] leading-none min-w-[3rem]">
                  {step.n}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-ink leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-base text-ink-secondary leading-relaxed max-w-3xl">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="compliance-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="default">HIPAA & Compliance</EyebrowTag>
              <h2
                id="compliance-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Built for healthcare from the protocol up.
              </h2>
            </div>
            <ul role="list" className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {compliance.map((c) => (
                <li key={c.title} className="flex flex-col gap-3 border-l-2 border-[color:var(--color-accent-primary)] pl-5">
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
              From after-hours coverage to full-volume 24/7.
            </h2>
            <p className="body-lead max-w-2xl mt-2">
              Pricing is tailored on the demo call to match your call volume
              and operational priorities.
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
                  {tier.emphasis}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQAccordion title="Common questions about PS | Lexi" items={faqs} />

      <InlineDemoCTA />
    </>
  )
}
