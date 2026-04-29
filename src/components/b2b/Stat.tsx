type Size = 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<Size, string> = {
  sm: 'text-3xl md:text-4xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
  xl: 'text-6xl md:text-[5.5rem] lg:text-[7rem]',
}

export default function Stat({
  value,
  label,
  caption,
  size = 'md',
  inverse = false,
}: {
  value: string
  label: string
  caption?: string
  size?: Size
  inverse?: boolean
}) {
  const valueColor = inverse
    ? 'text-[color:var(--color-text-inverse)]'
    : 'text-ink'
  const labelColor = inverse ? 'text-neutral-400' : 'text-ink-secondary'
  const captionColor = inverse ? 'text-neutral-500' : 'text-ink-tertiary'

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`stat-display ${sizeMap[size]} ${valueColor}`}
        aria-label={`${value} ${label}`}
      >
        {value}
      </div>
      <div
        className={`text-sm md:text-base font-semibold ${labelColor} leading-snug`}
      >
        {label}
      </div>
      {caption && (
        <div className={`text-xs md:text-sm ${captionColor} leading-snug`}>
          {caption}
        </div>
      )}
    </div>
  )
}
