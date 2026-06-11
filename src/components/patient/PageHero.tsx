import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title: string | ReactNode
  description?: string | ReactNode
  variant?: 'default' | 'compact' | 'editorial'
  children?: ReactNode
}

export default function PageHero({
  eyebrow,
  title,
  description,
  variant = 'default',
  children,
}: Props) {
  const compact = variant === 'compact'
  const editorial = variant === 'editorial'

  return (
    <section
      aria-label="Page hero"
      className={`bg-surface-alt border-b border-edge ${compact ? 'py-12 md:py-16' : 'py-16 md:py-24 lg:py-28'}`}
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className={editorial ? 'max-w-4xl' : 'max-w-3xl'}>
          {eyebrow && (
            <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
              {eyebrow}
            </p>
          )}
          {compact ? (
            <h1 className="heading-1-patient">{title}</h1>
          ) : editorial ? (
            <h1 className="heading-display-patient">{title}</h1>
          ) : (
            <h1 className="heading-1-patient">{title}</h1>
          )}
          {description && (
            <div className="body-lead-patient mt-6 max-w-2xl">{description}</div>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
