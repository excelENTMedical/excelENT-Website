import Link from 'next/link'
import ArrowRight from './ArrowRight'
import EyebrowTag from './EyebrowTag'
import Stat from './Stat'

export default function HeroB2B() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          {/* Left column — headline + CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            <EyebrowTag tone="accent">
              Practice Solutions Platform
            </EyebrowTag>

            <h1
              id="hero-headline"
              className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              More Patients. Better Operations.{' '}
              <span className="text-[color:var(--color-accent-primary)]">
                Stronger Revenue.
              </span>
            </h1>

            <p className="body-lead max-w-2xl text-pretty">
              A complete platform designed to help ENT practices attract,
              convert, and manage patient care more efficiently — built by
              practicing otolaryngologists, not consolidators.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
              <Link
                href="/b2b/request-demo"
                className="btn-b2b-primary"
                aria-label="Request a demo of the excelENT Practice Solutions platform"
              >
                Request a Demo
              </Link>
              <Link
                href="/b2b/how-it-works"
                className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast group inline-flex items-center gap-2"
              >
                See how it works
                <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right column — single proof callout */}
          <aside
            aria-label="Featured proof point"
            className="lg:col-span-5"
          >
            <div className="border border-edge-strong bg-surface p-6 md:p-8 lg:p-10">
              <EyebrowTag tone="default" className="mb-6">
                Proof Point · PS | RCM
              </EyebrowTag>

              <Stat
                value="2.5%"
                label="Denial rate at partner practices"
                caption="Industry average: 11.8%. For a $3M practice, that's the difference between $354K at risk and only $75K."
                size="xl"
              />

              <p className="text-xs md:text-sm text-ink-tertiary mt-8 pt-6 border-t border-edge">
                Source: ExcelENT Practice Solutions Overview, March 2026.
                Industry baseline per Aptarro 2026 denial-rate analysis.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
