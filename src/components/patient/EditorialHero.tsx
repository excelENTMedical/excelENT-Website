import Image from 'next/image'
import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title: string | ReactNode
  body: string | ReactNode
  imageSrc: string
  imageAlt: string
  ctaPrimary?: ReactNode
  ctaSecondary?: ReactNode
}

export default function EditorialHero({
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
  ctaPrimary,
  ctaSecondary,
}: Props) {
  return (
    <section
      aria-label="Hero"
      className="bg-surface relative overflow-hidden"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6 md:gap-8">
            {eyebrow && (
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)]">{eyebrow}</p>
            )}
            <h1 className="heading-display-patient text-balance">{title}</h1>
            <p className="body-lead-patient text-pretty max-w-xl">{body}</p>
            {(ctaPrimary || ctaSecondary) && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {ctaPrimary}
                {ctaSecondary}
              </div>
            )}
          </div>
          <div className="lg:col-span-6 relative">
            <div
              className="relative w-full overflow-hidden bg-surface-subtle"
              style={{
                aspectRatio: 'var(--photo-aspect-portrait)',
                borderRadius: 'var(--radius-image-hero)',
              }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
