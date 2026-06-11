'use client'

import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'text'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  variant?: Variant
  size?: Size
  className?: string
  children?: ReactNode
  ariaLabel?: string
}

export default function ScheduleButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ariaLabel,
}: Props) {
  const t = useTranslations('cta')
  const label = children ?? t('schedule')
  const sizeClass = size === 'md' ? '' : `btn-patient-${size}`
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.openBookingModal) {
          window.openBookingModal()
        }
      }}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      className={`btn-patient-${variant} ${sizeClass} ${className}`.trim()}
    >
      {label}
      {variant === 'text' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 7h8m0 0L7 3m4 4l-4 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
