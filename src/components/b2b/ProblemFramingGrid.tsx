import type { ReactNode } from 'react'
import EyebrowTag from './EyebrowTag'

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

const PhoneOffIcon = () => (
  <svg {...iconProps}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.55-2.85" />
    <path d="M5.4 9a16.93 16.93 0 0 1-2.13-5.12A2 2 0 0 1 5.27 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 10" />
    <line x1="22" y1="2" x2="2" y2="22" />
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

const ShieldIcon = () => (
  <svg {...iconProps}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const DollarIcon = () => (
  <svg {...iconProps}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const problems: Array<{
  key: string
  icon: ReactNode
  title: string
  description: string
  stat?: string
}> = [
  {
    key: 'calls',
    icon: <PhoneOffIcon />,
    title: 'Missed and Dropped Calls',
    description:
      'Front desks understaffed and overwhelmed. Every missed call is a patient walking to your competitor.',
    stat: '40% of patient calls go unanswered industry-wide',
  },
  {
    key: 'staff',
    icon: <UsersIcon />,
    title: 'Staff Overload and Burnout',
    description:
      'Your clinical team is doing too much front-office work. Routine questions consume hours that should go to patients.',
    stat: 'Up to 30% of staff time on repetitive scheduling',
  },
  {
    key: 'insurance',
    icon: <ShieldIcon />,
    title: 'Insurance Complexity',
    description:
      'Coverage verification, prior auth, and claims management get harder every quarter — and you eat the cost.',
    stat: 'Rules change across 1,200+ payer policies annually',
  },
  {
    key: 'billing',
    icon: <DollarIcon />,
    title: 'Billing Inefficiencies',
    description:
      'Industry denial rates have surged to 11.8%. For a $3M practice, that\'s up to $450K of revenue at risk every year.',
    stat: '$57.23 average cost to rework a single denied claim',
  },
]

export default function ProblemFramingGrid() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-16 items-end">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <EyebrowTag tone="accent">The Problem</EyebrowTag>
            <h2
              id="problem-heading"
              className="font-display font-bold tracking-tight leading-[1.05] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              ENT practices are getting squeezed from all sides at once.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="body-lead text-pretty">
              Independent ENTs are competing on patient flow, operations, and
              margin against a consolidator landscape that&rsquo;s growing
              every month. The pressure is structural, not personal — and the
              fix has to be too.
            </p>
          </div>
        </div>

        <ul
          role="list"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {problems.map((p) => (
            <li
              key={p.key}
              className="p-6 md:p-8 lg:p-10 flex flex-col gap-4"
            >
              <span className="text-[color:var(--color-accent-primary)] self-center">
                {p.icon}
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug text-balance">
                {p.title}
              </h3>
              <p className="text-sm md:text-base text-ink-secondary leading-relaxed text-pretty">
                {p.description}
              </p>
              {p.stat && (
                <p className="text-xs md:text-sm text-ink-tertiary italic text-pretty">
                  {p.stat}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
