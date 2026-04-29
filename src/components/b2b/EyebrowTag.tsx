import type { ReactNode } from 'react'

type Tone = 'default' | 'accent' | 'inverse'

export default function EyebrowTag({
  children,
  tone = 'default',
  as: As = 'span',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  as?: 'span' | 'p' | 'div'
  className?: string
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-[color:var(--color-accent-primary)]'
      : tone === 'inverse'
        ? 'text-[color:var(--color-text-inverse)]'
        : 'text-ink-secondary'

  return (
    <As className={`eyebrow ${toneClass} ${className}`.trim()}>{children}</As>
  )
}
