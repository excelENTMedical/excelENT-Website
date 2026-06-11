interface Stat {
  number: string
  label: string
}

interface Props {
  eyebrow?: string
  title?: string
  stats: Stat[]
}

export default function TrustBar({ eyebrow, title, stats }: Props) {
  return (
    <section
      aria-labelledby="trust-bar-heading"
      className="relative border-y border-edge"
      style={{ background: '#061b42' }}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
      />
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {(eyebrow || title) && (
          <div className="max-w-2xl mb-10 md:mb-12">
            {eyebrow && (
              <p className="eyebrow-patient text-white mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 id="trust-bar-heading" className="heading-2-patient text-white">
                {title}
              </h2>
            )}
          </div>
        )}
        {!title && <h2 id="trust-bar-heading" className="sr-only">Trust statistics</h2>}
        <ul
          role="list"
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
        >
          {stats.map((stat) => (
            <li key={stat.label} className="flex flex-col gap-3">
              <span className="stat-display-patient text-white">{stat.number}</span>
              <span className="font-cabin text-sm md:text-base text-white/80 leading-snug">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
