import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Contact — excelENT Medical',
  description:
    'Get in touch with the excelENT team. For demo requests, partner inquiries, sales support, and general questions.',
}

const channels: Array<{
  heading: string
  description: string
  cta: { label: string; href: string }
}> = [
  {
    heading: 'Looking for a demo?',
    description:
      'The fastest path. Tell us about your practice and we\'ll get back within one business day to schedule a working session.',
    cta: { label: 'Request a Demo', href: '/b2b/request-demo' },
  },
  {
    heading: 'Existing customer support?',
    description:
      'Reach out to your account manager directly, or email support@excelentmedical.com. We respond same-day during business hours.',
    cta: { label: 'mailto support@excelentmedical.com', href: 'mailto:support@excelentmedical.com' },
  },
  {
    heading: 'Partnership or press?',
    description:
      'Email partnerships@excelentmedical.com with a short note about what you have in mind. We read everything.',
    cta: {
      label: 'mailto partnerships@excelentmedical.com',
      href: 'mailto:partnerships@excelentmedical.com',
    },
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Reach the right team."
        description="Demo requests, customer support, partnership inquiries, and general questions — three doors, one team behind them."
      />

      <section
        aria-labelledby="channels-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <h2 id="channels-heading" className="sr-only">
            Contact channels
          </h2>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {channels.map((channel) => (
              <li
                key={channel.heading}
                className="border border-edge p-8 flex flex-col gap-4"
              >
                <h3 className="font-display font-bold text-xl md:text-2xl text-ink leading-snug">
                  {channel.heading}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed flex-grow">
                  {channel.description}
                </p>
                <Link
                  href={channel.cta.href}
                  className="text-sm font-semibold text-[color:var(--color-accent-primary)] hover:underline mt-auto pt-4 border-t border-edge"
                >
                  {channel.cta.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="hq-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <EyebrowTag tone="default">Headquarters</EyebrowTag>
              <h2
                id="hq-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Raleigh, NC.
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-3 text-base text-ink-secondary leading-relaxed">
              <p className="text-pretty">
                Our team is based in the Research Triangle, working closely
                with partner ENT practices across the southeast and the broader
                Eastern seaboard.
              </p>
              <p className="text-pretty">
                For media or investor relations, please use the partnership
                email above and indicate the topic in the subject line.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
