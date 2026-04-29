import EyebrowTag from './EyebrowTag'

const problems: Array<{
  number: string
  title: string
  description: string
  stat?: string
}> = [
  {
    number: '01',
    title: 'Missed and dropped calls',
    description:
      'Front desks understaffed and overwhelmed. Every missed call is a patient walking to your competitor.',
    stat: '40% of patient calls go unanswered industry-wide',
  },
  {
    number: '02',
    title: 'Staff overload and burnout',
    description:
      'Your clinical team is doing too much front-office work. Routine questions consume hours that should go to patients.',
    stat: 'Up to 30% of staff time on repetitive scheduling',
  },
  {
    number: '03',
    title: 'Insurance complexity',
    description:
      'Coverage verification, prior auth, and claims management get harder every quarter — and you eat the cost.',
    stat: 'Rules change across 1,200+ payer policies annually',
  },
  {
    number: '04',
    title: 'Billing inefficiencies',
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
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 md:mb-16">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <EyebrowTag tone="default">The Problem</EyebrowTag>
            <h2
              id="problem-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              ENT practices are getting squeezed from four sides at once.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 flex items-end">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-edge"
        >
          {problems.map((p, i) => (
            <li
              key={p.number}
              className={`p-6 md:p-8 lg:p-10 border-edge ${
                i < 3 ? 'border-b md:border-b-0 md:border-r' : ''
              } ${i === 1 ? 'lg:border-r' : ''} ${
                i < 2 ? 'md:border-b lg:border-b-0' : ''
              } flex flex-col gap-4`}
            >
              <span className="font-display font-bold text-2xl md:text-3xl text-[color:var(--color-accent-primary)] leading-none">
                {p.number}
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                {p.title}
              </h3>
              <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                {p.description}
              </p>
              {p.stat && (
                <p className="text-xs md:text-sm text-ink-tertiary mt-auto pt-4 border-t border-edge italic">
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
