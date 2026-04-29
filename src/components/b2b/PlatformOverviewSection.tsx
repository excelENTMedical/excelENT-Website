import Link from 'next/link'
import ArrowRight from './ArrowRight'
import EyebrowTag from './EyebrowTag'

const devices: Array<{ name: string; tag: string }> = [
  { name: 'BB8 Balloon', tag: '5 functions in 1 device · 100% success' },
  { name: 'Microdebrider Shaver Blades', tag: 'High-quality tissue removal' },
  { name: 'AllergyX Rinse Kit', tag: 'Pre / post-procedure care' },
]

const solutions: Array<{ name: string; tag: string }> = [
  { name: 'PS | Connect', tag: 'Patient prospecting and growth' },
  { name: 'PS | Lexi', tag: 'AI virtual office assistant' },
  { name: 'PS | RCM', tag: 'Revenue cycle management' },
]

export default function PlatformOverviewSection() {
  return (
    <section
      aria-labelledby="platform-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
          <EyebrowTag tone="default">The Platform</EyebrowTag>
          <h2
            id="platform-heading"
            className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
          >
            <span className="text-[color:var(--color-accent-primary)]">
              Business-in-a-Box
            </span>{' '}
            for independent ENTs.
          </h2>
          <p className="body-lead mt-2 max-w-2xl">
            Two halves of the same playbook: clinical-grade products in your
            hands, software-grade operations behind your front desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 border border-edge">
          {/* Devices */}
          <div className="p-8 md:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-edge flex flex-col gap-6">
            <div className="flex items-baseline justify-between gap-4">
              <EyebrowTag tone="default">Medical Devices</EyebrowTag>
              <span className="text-xs text-ink-tertiary">FDA approved</span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
              Best-in-industry medical devices
            </h3>
            <p className="body-lead text-pretty">
              Minimally invasive in-office sinus products plus a growing R&amp;D
              pipeline — built around what your team actually uses, not a
              vendor catalog.
            </p>
            <ul role="list" className="flex flex-col gap-3 mt-2">
              {devices.map((d) => (
                <li
                  key={d.name}
                  className="flex items-baseline gap-3 pb-3 border-b border-edge"
                >
                  <span className="font-display font-semibold text-base md:text-lg text-ink min-w-fit">
                    {d.name}
                  </span>
                  <span className="text-sm text-ink-tertiary leading-snug ml-auto text-right">
                    {d.tag}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/b2b/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent-primary)] transition-colors duration-fast mt-2"
            >
              Explore all products
              <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Practice Solutions */}
          <div className="p-8 md:p-10 lg:p-12 flex flex-col gap-6 bg-surface-alt">
            <div className="flex items-baseline justify-between gap-4">
              <EyebrowTag tone="accent">Practice Solutions</EyebrowTag>
              <span className="text-xs text-ink-tertiary">
                ENT-specific software
              </span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
              Software-grade practice operations
            </h3>
            <p className="body-lead text-pretty">
              Three connected products that drive patients in, handle the
              calls, and recover the revenue. Modular — use one or use all
              three.
            </p>
            <ul role="list" className="flex flex-col gap-3 mt-2">
              {solutions.map((s) => (
                <li
                  key={s.name}
                  className="flex items-baseline gap-3 pb-3 border-b border-edge"
                >
                  <span className="font-display font-semibold text-base md:text-lg text-ink min-w-fit">
                    {s.name}
                  </span>
                  <span className="text-sm text-ink-tertiary leading-snug ml-auto text-right">
                    {s.tag}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/b2b/solutions"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent-primary)] transition-colors duration-fast mt-2"
            >
              Explore all solutions
              <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
