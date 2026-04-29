import type { ReactNode } from 'react'
import EyebrowTag from './EyebrowTag'

export default function PageHero({
  eyebrow,
  title,
  description,
  children,
  variant = 'default',
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  variant?: 'default' | 'compact'
}) {
  const padY =
    variant === 'compact'
      ? 'py-12 md:py-16 lg:py-20'
      : 'py-16 md:py-24 lg:py-28'

  return (
    <section
      aria-labelledby="page-hero-headline"
      className="border-b border-edge"
    >
      <div className={`max-w-page mx-auto px-4 sm:px-6 lg:px-8 ${padY}`}>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <EyebrowTag tone="accent">{eyebrow}</EyebrowTag>
            <h1
              id="page-hero-headline"
              className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {title}
            </h1>
            {description && (
              <p className="body-lead max-w-2xl mt-2 text-pretty">
                {description}
              </p>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
