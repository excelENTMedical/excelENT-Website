import EyebrowTag from './EyebrowTag'

const pillars: Array<{
  number: string
  title: string
  description: string
}> = [
  {
    number: '01',
    title: 'Educate',
    description:
      'We bring sinusitis and allergy understanding directly to patients — driving informed demand for in-office procedures, not surgery.',
  },
  {
    number: '02',
    title: 'Connect',
    description:
      'We route educated patients to local partner practices fast — verified insurance, location-matched, 48-hour appointments.',
  },
  {
    number: '03',
    title: 'Empower',
    description:
      'We give your practice the operational tools — AI scheduling, RCM, in-office device platform — to convert that volume into revenue.',
  },
]

export default function ThreePillarsSection() {
  return (
    <section
      aria-labelledby="pillars-heading"
      className="border-b border-edge"
      style={{ background: 'var(--color-accent-primary-subtle)' }}
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
          <EyebrowTag tone="accent">Our Approach</EyebrowTag>
          <h2
            id="pillars-heading"
            className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
          >
            Educate. Connect. Empower.
          </h2>
          <p className="body-lead mt-2 max-w-2xl">
            Three connected motions that turn awareness into appointments and
            appointments into a sustainable, independent practice.
          </p>
        </div>

        <ol
          role="list"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
        >
          {pillars.map((p) => (
            <li
              key={p.number}
              className="bg-surface p-8 md:p-10 border-l-4 border-[color:var(--color-accent-primary)] flex flex-col gap-4 shadow-sm"
            >
              <span className="font-display font-bold text-sm tracking-widest text-[color:var(--color-accent-primary)]">
                {p.number}
              </span>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
                {p.title}
              </h3>
              <p className="text-base text-ink-secondary leading-relaxed">
                {p.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
