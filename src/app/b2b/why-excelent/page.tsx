import type { Metadata } from 'next'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import Stat from '@/components/b2b/Stat'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'Why excelENT — Built by Practicing Otolaryngologists',
  description:
    'A team with 30,000+ observed cases and 60+ combined years in ENT. Built around independent practices, not consolidators.',
}

const team: Array<{
  name: string
  title: string
  bio: string
  detail: string
}> = [
  {
    name: 'Kashif Mazhar, MD',
    title: 'Chief Executive Officer',
    bio: 'A practicing otolaryngologist in Raleigh, NC. Brings the operating-room and clinical perspective that drives every product decision.',
    detail: 'Practicing otolaryngologist · Raleigh, NC',
  },
  {
    name: 'Kevin Monty',
    title: 'Chief Revenue Officer',
    bio: '30+ years of medical-device experience and $1B+ in value created across ENT-focused startups. Has partnered with hundreds of practices nationwide.',
    detail: '30+ years medical-device experience',
  },
  {
    name: 'Josh Pelger',
    title: 'Director of Clinical Solutions',
    bio: '13 years of ENT-specific expertise focused on patient journey, physician partnerships, and the practical implementation of new clinical workflows.',
    detail: '13 years supporting ENT practices in the southeast',
  },
  {
    name: 'Eric Honsberger',
    title: 'PEAP Director',
    bio: '15 years on the East Coast ENT corridor. Leads patient engagement, acquisition, and partnership strategy across PS | Connect markets.',
    detail: '15 years on the East Coast ENT corridor',
  },
]

const expertise: string[] = [
  'Sinus anatomy and in-office procedures',
  'Anesthesia protocol tips and tricks',
  'Front-desk bottlenecks and staffing strain',
  'Insurance and reimbursement headaches',
  'Standard ENT protocols and patient flow',
  'Pre-op, intra-op, and post-op challenges',
  'Provider training and staff onboarding',
  'ICD-10 coding and audit-trail discipline',
]

const philosophy: Array<{ title: string; description: string }> = [
  {
    title: 'Practices stay independent',
    description:
      'Unlike consolidators, we provide products, solutions, and patient flow to keep practices physician-led and community-focused — not absorbed.',
  },
  {
    title: 'Whole-practice understanding',
    description:
      'We think about the patient journey, the front desk, the billing function, and the clinical workflows together. Solving one without the others creates new problems.',
  },
  {
    title: 'Real-world experience',
    description:
      "Our team has lived the workflow we're building for. Sales, clinical, ops, and billing leadership all come from inside ENT practices.",
  },
]

export default function WhyExcelentPage() {
  return (
    <>
      <PageHero
        eyebrow="Why excelENT"
        title="Built by practicing ENTs, not consolidators."
        description="A team with deep operating-room, front-office, and revenue-cycle experience — building the platform we wish we'd had inside our own practices."
      />

      <section
        aria-labelledby="experience-heading"
        className="bg-surface-alt border-b border-edge relative"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-10 md:mb-12">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <EyebrowTag tone="accent">Decades of real-world ENT</EyebrowTag>
              <h2 className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance">
                We understand ENT &mdash; we&rsquo;ve lived it.
              </h2>
            </div>
            <div className="lg:col-span-5 flex gap-10">
              <div>
                <Stat
                  value="30,000+"
                  label="Observed cases"
                  size="lg"
                />
              </div>
              <div>
                <Stat
                  value="60+"
                  label="Combined years in ENT"
                  size="lg"
                />
              </div>
            </div>
          </div>
          <h3 className="sr-only">Areas of expertise</h3>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
          >
            {expertise.map((item) => (
              <li
                key={item}
                className="text-sm md:text-base text-ink-secondary leading-relaxed flex items-start gap-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 inline-block w-1.5 h-1.5 bg-[color:var(--color-accent-primary)] flex-shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="team-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="default">The team</EyebrowTag>
            <h2
              id="team-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              The leaders behind the platform.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-edge border border-edge"
          >
            {team.map((member) => (
              <li
                key={member.name}
                className="bg-surface p-8 md:p-10 flex flex-col gap-4 min-h-60"
              >
                <div
                  aria-hidden="true"
                  className="w-14 h-14 rounded-full bg-[color:var(--color-accent-primary-subtle)] text-[color:var(--color-accent-primary)] flex items-center justify-center font-display font-bold text-lg"
                >
                  {member.name
                    .split(' ')
                    .filter((w) => !w.endsWith(','))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-ink leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-[color:var(--color-accent-primary)] font-semibold">
                    {member.title}
                  </p>
                </div>
                <p className="text-base text-ink-secondary leading-relaxed flex-grow">
                  {member.bio}
                </p>
                <p className="text-xs text-ink-tertiary mt-auto pt-4 border-t border-edge">
                  {member.detail}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-tertiary mt-4 italic">
            Headshots forthcoming. Initials shown as placeholder.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="philosophy-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="accent">Our philosophy</EyebrowTag>
            <h2
              id="philosophy-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              We help local ENT practices stay local.
            </h2>
            <p className="body-lead mt-2 max-w-2xl">
              We believe local ENT practices should remain physician-led and
              community-focused. Our role is to strengthen the practices that
              choose to stay independent, not pressure them toward sale.
            </p>
          </div>

          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {philosophy.map((p) => (
              <li
                key={p.title}
                className="bg-surface border border-edge p-8 flex flex-col gap-3"
              >
                <h3 className="font-display font-bold text-xl text-ink leading-snug">
                  {p.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {p.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
