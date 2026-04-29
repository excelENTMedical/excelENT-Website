import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from './EyebrowTag'

const team: Array<{
  name: string
  title: string
  detail: string
  headshot?: string
}> = [
  {
    name: 'Kashif Mazhar, MD',
    title: 'CEO',
    detail: 'Practicing otolaryngologist · Raleigh, NC',
    headshot: '/images/team/kashif-mazhar.jpg',
  },
  {
    name: 'Kevin Monty',
    title: 'Chief Revenue Officer',
    detail: '20 years partnering with ENT practices nationwide',
    headshot: '/images/team/kevin-monty.jpg',
  },
  {
    name: 'Josh Pelger',
    title: 'Director of Clinical Solutions',
    detail: '13 years supporting ENT practices in the southeast',
    headshot: '/images/team/josh-pelger.jpg',
  },
  {
    name: 'Eric Honsberger',
    title: 'PEAP Director',
    detail: '15 years on the East Coast ENT corridor',
    headshot: '/images/team/eric-honsberger.jpg',
  },
]

export default function WhyExcelentTeaser() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <EyebrowTag tone="default">Why excelENT</EyebrowTag>

            <h2
              id="why-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              Built by practicing ENTs, not consolidators.
            </h2>

            <p className="body-lead text-pretty">
              Our team has lived your workflow. Sinus anatomy and in-office
              procedures, anesthesia protocol, front-desk bottlenecks,
              insurance reimbursement, pre-op and post-op flow — we understand
              it because we&rsquo;ve done it.
            </p>

            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mt-2">
              <div>
                <div className="font-display font-bold text-3xl md:text-4xl text-[color:var(--color-accent-primary)] leading-none stat-display">
                  30,000+
                </div>
                <div className="text-xs md:text-sm text-ink-secondary mt-2">
                  observed cases
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-3xl md:text-4xl text-[color:var(--color-accent-primary)] leading-none stat-display">
                  60+
                </div>
                <div className="text-xs md:text-sm text-ink-secondary mt-2">
                  combined years in ENT
                </div>
              </div>
            </div>

            <Link
              href="/b2b/why-excelent"
              className="btn-b2b-secondary self-start mt-4"
            >
              Meet the team
            </Link>
          </div>

          {/* Right — team grid */}
          <div className="lg:col-span-6 lg:col-start-7">
            <ul
              role="list"
              className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-edge border border-edge"
            >
              {team.map((member) => (
                <li
                  key={member.name}
                  className="bg-surface p-6 md:p-8 flex flex-col gap-3 min-h-44"
                >
                  {member.headshot ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-alt">
                      <Image
                        src={member.headshot}
                        alt={`${member.name} headshot`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-12 h-12 rounded-full bg-[color:var(--color-accent-primary-subtle)] text-[color:var(--color-accent-primary)] flex items-center justify-center font-display font-bold text-base"
                    >
                      {member.name
                        .split(' ')
                        .filter((w) => !w.endsWith(','))
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 mt-auto">
                    <h3 className="font-display font-semibold text-base md:text-lg text-ink leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-sm text-[color:var(--color-accent-primary)] font-medium">
                      {member.title}
                    </p>
                    <p className="text-xs md:text-sm text-ink-tertiary leading-snug mt-1">
                      {member.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
