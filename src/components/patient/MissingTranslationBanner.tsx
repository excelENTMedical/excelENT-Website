import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

interface Props {
  locale: string
  pathInOtherLocale?: string
}

export default async function MissingTranslationBanner({ locale, pathInOtherLocale }: Props) {
  if (locale !== 'es') return null
  const t = await getTranslations('missing')
  return (
    <div
      role="note"
      className="bg-[color:var(--color-accent-primary-subtle)] border-y border-[color:var(--color-accent-primary)]/20"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="body-patient text-sm text-ink-secondary">{t('banner')}</p>
        {pathInOtherLocale && (
          <Link
            href={pathInOtherLocale as never}
            locale="en"
            className="text-sm font-cabin font-semibold text-[color:var(--color-accent-primary)] hover:underline"
          >
            View in English →
          </Link>
        )}
      </div>
    </div>
  )
}
