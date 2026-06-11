import type { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import ScheduleButton from './ScheduleButton'

interface Crumb {
  label: string
  href: string
}

interface Props {
  eyebrow: string
  title: string
  lead?: string
  crumbs?: Crumb[]
  children: ReactNode
  scheduleLabel?: string
  prev?: { label: string; href: string }
  next?: { label: string; href: string }
}

export default function LongformArticle({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  scheduleLabel,
  prev,
  next,
}: Props) {
  return (
    <article className="bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-tertiary font-cabin">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  <Link
                    href={c.href as never}
                    className="hover:text-[color:var(--color-accent-primary)]"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <header className="mb-10 md:mb-14">
          <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
            {eyebrow}
          </p>
          <h1 className="heading-1-patient text-balance">{title}</h1>
          {lead && <p className="body-lead-patient text-ink-secondary mt-6">{lead}</p>}
        </header>
        <div className="prose-patient">{children}</div>

        <div className="mt-14 pt-10 border-t border-edge flex flex-col sm:flex-row sm:items-center gap-4">
          <ScheduleButton size="md">{scheduleLabel}</ScheduleButton>
        </div>

        {(prev || next) && (
          <nav
            aria-label="Adjacent guides"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {prev ? (
              <Link
                href={prev.href as never}
                className="bg-surface border border-edge p-5 flex flex-col gap-1 hover:border-[color:var(--color-accent-primary)] transition-colors"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <span className="text-xs uppercase tracking-wider text-ink-tertiary">Previous</span>
                <span className="font-cabin text-lg font-semibold text-ink">{prev.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={next.href as never}
                className="bg-surface border border-edge p-5 flex flex-col gap-1 sm:text-right hover:border-[color:var(--color-accent-primary)] transition-colors"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <span className="text-xs uppercase tracking-wider text-ink-tertiary">Next</span>
                <span className="font-cabin text-lg font-semibold text-ink">{next.label}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  )
}
