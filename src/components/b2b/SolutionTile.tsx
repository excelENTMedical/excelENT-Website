import Link from 'next/link'
import ArrowRight from './ArrowRight'
import EyebrowTag from './EyebrowTag'

export default function SolutionTile({
  productLabel,
  title,
  description,
  bullets,
  href,
}: {
  productLabel: string
  title: string
  description: string
  bullets: string[]
  href: string
}) {
  return (
    <Link
      href={href}
      aria-label={`${productLabel} — ${title}. Learn more.`}
      className="group flex flex-col h-full bg-surface p-6 md:p-8 lg:p-10 hover:bg-surface-alt transition-colors duration-normal focus-visible:outline-none focus-visible:shadow-focus"
    >
      <EyebrowTag tone="accent">{productLabel}</EyebrowTag>

      <h3 className="mt-5 font-display font-bold tracking-tight leading-snug text-2xl md:text-3xl text-ink text-balance">
        {title}
      </h3>

      <p className="mt-4 body-lead text-pretty">
        {description}
      </p>

      <ul role="list" className="mt-6 flex flex-col gap-2 flex-grow">
        {bullets.map((b) => (
          <li
            key={b}
            className="text-sm md:text-base text-ink-secondary leading-relaxed flex items-start gap-2"
          >
            <span
              aria-hidden="true"
              className="mt-2.5 inline-block w-1.5 h-1.5 bg-[color:var(--color-accent-primary)] flex-shrink-0"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-6 border-t border-edge inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast">
        Explore {productLabel}
        <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
