import EyebrowTag from './EyebrowTag'
import Stat from './Stat'

const metrics: Array<{
  value: string
  label: string
  caption?: string
}> = [
  {
    value: '265K',
    label: 'Patients reached',
    caption: 'Website visits driving sinusitis awareness across regional markets',
  },
  {
    value: '192',
    label: 'Kept appointments',
    caption: 'Initial visits delivered to partner practices via PS | Connect',
  },
  {
    value: '100%',
    label: 'BB8 surgical success',
    caption: '750+ patients · 3,000+ sinuses · zero intra-op complications',
  },
  {
    value: '2.5%',
    label: 'RCM denial rate',
    caption: 'vs 11.8% industry baseline (Aptarro, 2026)',
  },
]

export default function ProofMetricStrip() {
  return (
    <section
      aria-labelledby="proof-strip-heading"
      className="bg-surface-inverse text-[color:var(--color-text-inverse)]"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="flex flex-col gap-12 md:gap-14">
          <div className="flex flex-col gap-3 max-w-3xl">
            <EyebrowTag tone="inverse">By the numbers</EyebrowTag>
            <h2
              id="proof-strip-heading"
              className="font-display font-bold tracking-tight leading-tight text-2xl md:text-3xl lg:text-4xl text-balance"
            >
              Real partner practices. Real numbers. No marketing hand-waves.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12"
          >
            {metrics.map((m) => (
              <li
                key={m.label}
                className="flex flex-col border-l-2 border-neutral-700 pl-5 md:pl-6"
              >
                <Stat
                  value={m.value}
                  label={m.label}
                  caption={m.caption}
                  size="lg"
                  inverse
                />
              </li>
            ))}
          </ul>

          <p className="text-xs md:text-sm text-neutral-500 max-w-3xl">
            Sources: excelENT Practice Solutions Overview (March 2026); Aptarro
            US Healthcare Denial Rates 2026; internal partner-practice data.
          </p>
        </div>
      </div>
    </section>
  )
}
