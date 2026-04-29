import type { Metadata } from 'next'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import DemoForm from '@/components/b2b/DemoForm'

export const metadata: Metadata = {
  title: 'Request a Demo — excelENT Practice Solutions',
  description:
    'Schedule a working session with our team to see what excelENT Practice Solutions can do for your specific practice.',
}

const nextSteps: Array<{ n: string; title: string; description: string }> = [
  {
    n: '01',
    title: 'We review your request',
    description:
      'A member of our team reads your context, looks at your market, and prepares notes specific to your practice — usually within a few hours.',
  },
  {
    n: '02',
    title: 'We reach out within one business day',
    description:
      "You'll get an email (and optionally a call) to schedule a working session at a time that fits your calendar.",
  },
  {
    n: '03',
    title: 'We run a working session, not a sales pitch',
    description:
      "On the call, we walk through what's possible for your specific practice — your patient mix, EMR, local market, and the bottleneck you most want fixed.",
  },
]

const trustPoints: Array<{ heading: string; description: string }> = [
  {
    heading: 'HIPAA-compliant infrastructure',
    description:
      'BAAs with our technology partners. Encryption in transit and at rest. Strict access controls.',
  },
  {
    heading: 'Built by a practicing otolaryngologist',
    description:
      'Our CEO Kashif Mazhar, MD still sees patients in Raleigh, NC. The platform is built around real ENT workflow, not vendor abstractions.',
  },
  {
    heading: 'Independent-practice friendly',
    description:
      'We work with consolidators only by exception. Our default partner is the privately held, physician-led practice that wants to stay that way.',
  },
]

export default function RequestDemoPage() {
  return (
    <>
      <section
        aria-labelledby="demo-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <EyebrowTag tone="accent">Request a Demo</EyebrowTag>
              <h1
                id="demo-heading"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl"
              >
                Let&rsquo;s talk about your practice.
              </h1>
              <p className="body-lead text-pretty">
                Tell us about your practice and the bottleneck you most want
                fixed. We&rsquo;ll come back with a working-session proposal
                tailored to your patient mix and local market — not a
                generic pitch.
              </p>

              <ul role="list" className="flex flex-col gap-6 mt-2">
                {trustPoints.map((point) => (
                  <li
                    key={point.heading}
                    className="border-l-2 border-[color:var(--color-accent-primary)] pl-5"
                  >
                    <h2 className="font-display font-semibold text-base md:text-lg text-ink leading-snug">
                      {point.heading}
                    </h2>
                    <p className="text-sm md:text-base text-ink-secondary leading-relaxed mt-1">
                      {point.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7" id="request-demo">
              <DemoForm />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="next-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="default">What happens next</EyebrowTag>
            <h2
              id="next-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Three steps from form to working session.
            </h2>
          </div>

          <ol role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {nextSteps.map((step) => (
              <li
                key={step.n}
                className="bg-surface border border-edge p-8 flex flex-col gap-4"
              >
                <span className="font-display font-bold text-2xl text-[color:var(--color-accent-primary)] leading-none">
                  {step.n}
                </span>
                <h3 className="font-display font-bold text-xl text-ink leading-snug">
                  {step.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
