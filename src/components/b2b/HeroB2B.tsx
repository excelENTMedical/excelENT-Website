import Image from 'next/image'
import Link from 'next/link'
import ArrowRight from './ArrowRight'
import EyebrowTag from './EyebrowTag'

export default function HeroB2B() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
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

          {/* Right column — image + proof points underneath */}
          <aside
            aria-label="Featured practice imagery and proof points"
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt">
              <Image
                src="/images/heroes/b2b-home.webp"
                alt="ENT physician reviewing a practice performance dashboard at his desk"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>

            <div
              role="group"
              aria-label="Industry vs. excelENT partner denial rate"
              className="flex items-start justify-between gap-3 md:gap-4"
            >
              {/* Left — industry baseline */}
              <div className="flex flex-col items-center text-center gap-1 shrink-0 w-[28%]">
                <span className="stat-display text-3xl md:text-4xl text-ink">
                  12%
                </span>
                <span className="text-xs md:text-sm text-ink-secondary leading-snug">
                  Industry Baseline
                </span>
              </div>

              {/* Connector arrow — vertically centered on the number row */}
              <div
                aria-hidden="true"
                className="flex-1 flex items-center gap-0 pt-2.5 md:pt-3.5 text-[color:var(--color-accent-primary)]"
              >
                <div className="flex-1 h-[2px] bg-current" />
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="-ml-[1px]"
                >
                  <polyline points="3,2 12,7 3,12" />
                </svg>
              </div>

              {/* Right — excelENT */}
              <div className="flex flex-col items-center text-center gap-1 shrink-0 w-[32%]">
                <span className="stat-display text-3xl md:text-4xl text-[color:var(--color-accent-primary)]">
                  2.5%
                </span>
                <span className="text-xs md:text-sm text-ink-secondary leading-snug">
                  excelENT Partner
                  <br />
                  Denial Rate
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
