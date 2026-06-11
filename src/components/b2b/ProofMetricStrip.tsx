import EyebrowTag from './EyebrowTag'

const metrics: Array<{
  value: string
  label: string
  caption?: string
}> = [
  {
    value: '265K',
    label: 'Patients Reached',
    caption:
      'Website visits driving sinusitis awareness across regional markets',
  },
  {
    value: '192',
    label: 'Kept Appointments',
    caption: 'Initial visits delivered to partner practices via PS | Connect',
  },
  {
    value: '100%',
    label: 'BB8 Surgical Success',
    caption: '750+ patients · 3,000+ sinuses · zero intra-op complications',
  },
  {
    value: '2.5%',
    label: 'RCM Denial Rate',
    caption: 'vs 11.8% industry baseline (Aptarro, 2026)',
  },
]

export default function ProofMetricStrip() {
  return (
    <section
      aria-labelledby="proof-strip-heading"
      className="relative"
      style={{ background: '#061b42' }}
    >
      {/* Top accent line in brand purple — Swiss "register mark" punctuation */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
      />
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col gap-12 md:gap-14">
          <div className="flex flex-col gap-3 max-w-3xl">
            <EyebrowTag tone="inverse">By the numbers</EyebrowTag>
            <h2
              id="proof-strip-heading"
              className="font-display font-bold tracking-tight leading-tight text-2xl md:text-3xl lg:text-4xl text-white text-balance"
            >
              Real partner practices. Real numbers. No empty marketing promises.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12"
          >
            {metrics.map((m) => (
              <li key={m.label} className="flex flex-col gap-2 text-white">
                <div className="stat-display text-5xl md:text-6xl text-white">
                  {m.value}
                </div>
                <div className="text-sm md:text-base font-semibold text-white leading-snug">
                  {m.label}
                </div>
                {m.caption && (
                  <div className="text-xs md:text-sm text-white leading-snug">
                    {m.caption}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
