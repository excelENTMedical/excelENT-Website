import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import Stat from '@/components/b2b/Stat'
import ArrowRight from '@/components/b2b/ArrowRight'
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
  headshot?: string
}> = [
  {
    name: 'Kashif Mazhar, MD',
    title: 'Chief Executive Officer',
    bio: 'A practicing otolaryngologist in Raleigh, NC. Brings the operating-room and clinical perspective that drives every product decision.',
    headshot: '/images/team/kashif-mazhar.jpg',
  },
  {
    name: 'Zack Casazza',
    title: 'Chief Financial Officer',
    bio: 'UNC Chapel Hill graduate with deep leadership experience scaling rapidly growing companies. Drives financial strategy, planning, and operational rigor across the excelENT platform.',
    headshot: '/images/team/zack-casazza.webp',
  },
  {
    name: 'Kevin Monty',
    title: 'Chief Revenue Officer',
    bio: '30+ years of medical-device experience and $1B+ in value created across ENT-focused startups. Has partnered with hundreds of practices nationwide.',
    headshot: '/images/team/kevin-monty.jpg',
  },
  {
    name: 'Josh Pelger',
    title: 'Director of Clinical Solutions',
    bio: '13 years of ENT-specific expertise focused on patient journey, physician partnerships, and the practical implementation of new clinical workflows.',
    headshot: '/images/team/josh-pelger.jpg',
  },
  {
    name: 'Samir Patel',
    title: 'Director of Information Technology',
    bio: '18 years driving digital campaigns, IT infrastructure, and cybersecurity at scale. Leads the technology backbone behind excelENT’s products and HIPAA-compliant operations.',
    headshot: '/images/team/samir-patel.webp',
  },
  {
    name: 'Eric Honsberger',
    title: 'PEAP Director',
    bio: '15 years assisting ENTs grow their practice presence across the Northeast. Leads patient engagement, acquisition, and partnership strategy across PS | Connect markets.',
    headshot: '/images/team/eric-honsberger.jpg',
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
      {/* Hero — text left, image right */}
      <section
        aria-labelledby="why-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">Why excelENT</EyebrowTag>
              <h1
                id="why-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Built by practicing ENTs, not consolidators.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                A team with deep operating-room, front-office, and
                revenue-cycle experience &mdash; building the platform we
                wish we&rsquo;d had inside our own practices.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
                <Link
                  href="/b2b/solutions"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  Explore solutions
                  <ArrowRight />
                </Link>
              </div>
            </div>

            <aside aria-label="Why excelENT imagery" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
                <Image
                  src="/images/site/kashif-mazhar-portrait.jpg"
                  alt="Dr. Kashif Mazhar, practicing otolaryngologist and ExcelENT CEO"
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

      {/* Decades of ENT — gray section with stats + expertise list */}
      <section
        aria-labelledby="experience-heading"
        className="bg-surface-alt border-b border-edge relative"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Title + expertise stacked on the left, stats stacked on the right */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-8 flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-3">
                <EyebrowTag tone="accent">Decades of real-world ENT</EyebrowTag>
                <h2
                  id="experience-heading"
                  className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
                >
                  We understand ENT &mdash; we&rsquo;ve lived it.
                </h2>
              </div>
              <h3 className="sr-only">Areas of expertise</h3>
              <ul
                role="list"
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4"
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
            <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8 lg:pt-10">
              <Stat value="30,000+" label="Observed Cases" size="lg" />
              <Stat value="60+" label="Combined Years in ENT" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* The team — universal box pattern */}
      <section
        aria-labelledby="team-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="accent">The team</EyebrowTag>
            <h2
              id="team-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              The leaders behind the platform.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {team.map((member) => (
              <li
                key={member.name}
                className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-8 md:p-10 flex flex-col gap-4 min-h-60"
              >
                {member.headshot ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-alt">
                    <Image
                      src={member.headshot}
                      alt={`${member.name} headshot`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
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
                )}
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
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our philosophy — universal box pattern */}
      <section
        aria-labelledby="philosophy-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
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
                className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-8 flex flex-col gap-3"
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
