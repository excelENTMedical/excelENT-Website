import Link from 'next/link'
import ArrowRight from './ArrowRight'
import EyebrowTag from './EyebrowTag'
import Stat from './Stat'

/**
 * CaseStudyBlock — Triangle Sinus Center
 *
 * Quarterly figures sourced from `excelENT Practice Solutions
 * Presentation_March 2026.pdf`, slide 9 (PS | Connect customer case
 * study). Source values are deck-illustrative and need final
 * marketing-clearance + cleared-quote sign-off from Triangle Sinus
 * before public deploy. See DESIGN_REVIEW.md must-fix #1.
 */

type Quarter = { q: string; value: number; label: string }

const QUARTERS: Quarter[] = [
  { q: 'Q1 2025', value: 28.4, label: '$28.4K' },
  { q: 'Q2 2025', value: 13.6, label: '$13.6K' },
  { q: 'Q3 2025', value: 15.5, label: '$15.5K' },
  { q: 'Q4 2025', value: 23.9, label: '$23.9K' },
]

const TOTAL_LABEL = '$81.4K' // 28.4 + 13.6 + 15.5 + 23.9
const MAX_QUARTER = Math.max(...QUARTERS.map((r) => r.value))

export default function CaseStudyBlock() {
  return (
    <section
      aria-labelledby="case-study-heading"
      className="bg-surface-alt border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — narrative */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <EyebrowTag tone="accent">Customer Story</EyebrowTag>

            <h2
              id="case-study-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              Triangle Sinus runs the full Practice Solutions stack.
            </h2>

            <p className="body-lead text-pretty">
              By layering{' '}
              <strong className="font-semibold text-ink">PS | Connect</strong>{' '}
              for patient prospecting and{' '}
              <strong className="font-semibold text-ink">PS | Lexi</strong>{' '}
              for AI-driven scheduling, Triangle Sinus tracks four full
              quarters of measurable patient flow — with the underlying
              numbers visible to the practice in real time.
            </p>

            <blockquote className="mt-2 pl-6 border-l-2 border-[color:var(--color-accent-primary)]">
              <p className="font-display text-xl md:text-2xl text-ink leading-snug italic text-pretty">
                &ldquo;The combination of inbound patient flow plus 24/7 call
                answering changed what was even possible for our front desk.
                We&rsquo;re seeing more of the right patients without adding
                staff.&rdquo;
              </p>
              <footer className="mt-4 text-sm text-ink-secondary not-italic">
                — Practice administrator,{' '}
                <span className="font-semibold text-ink">
                  Triangle Sinus Center
                </span>{' '}
                · Raleigh, NC
              </footer>
            </blockquote>

            <Link
              href="/b2b/customers/triangle-sinus"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent-primary)] transition-colors duration-fast mt-2"
            >
              Read the full case study
              <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right — quarterly metric callout */}
          <aside
            aria-label="Quarterly patient payments — Triangle Sinus, 2025"
            className="lg:col-span-5 lg:sticky lg:top-24"
          >
            <div className="bg-surface border border-edge p-8 md:p-10">
              <EyebrowTag tone="default" className="mb-6">
                2025 patient payments
              </EyebrowTag>

              <Stat
                value={TOTAL_LABEL}
                label="Tracked across four quarters"
                caption="Patient-payment revenue at Triangle Sinus through PS | Connect-driven appointments. Quarterly distribution below."
                size="xl"
              />

              {/* Quarter-by-quarter bar chart with real deck values */}
              <ul
                role="list"
                className="mt-8 pt-6 border-t border-edge flex flex-col gap-3"
              >
                {QUARTERS.map((row) => {
                  const pct = (row.value / MAX_QUARTER) * 100
                  return (
                    <li key={row.q} className="flex items-center gap-3">
                      <span className="text-xs text-ink-tertiary min-w-16 font-medium">
                        {row.q}
                      </span>
                      <div className="flex-1 h-2 bg-surface-alt relative">
                        <div
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 bg-[color:var(--color-accent-primary)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink font-semibold tabular-nums min-w-14 text-right">
                        {row.label}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <p className="text-xs text-ink-tertiary mt-6 pt-4 border-t border-edge">
                Source: ExcelENT Practice Solutions Overview, March 2026.
                Quarterly figures pending final marketing-clearance from
                Triangle Sinus.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
