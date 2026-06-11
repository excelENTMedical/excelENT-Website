import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import BookingWidgetInline from '@/components/patient/BookingWidgetInline'
import { pageMetadata } from '@/lib/page-metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'schedule' })
  return pageMetadata({
    path: '/schedule',
    locale,
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function SchedulePage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('schedule')

  return (
    <div className="bg-surface">
      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl mb-10 md:mb-14">
          <h1 className="heading-1-patient text-balance">{t('title')}</h1>
          <p className="body-lead-patient text-ink-secondary mt-5">{t('subtitle')}</p>
        </div>

        <ul
          role="list"
          className="flex flex-wrap gap-x-8 gap-y-3 mb-10 text-sm md:text-base font-cabin text-ink-secondary"
        >
          <li className="flex items-center gap-2">
            <CheckIcon /> {t('trustHipaa')}
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon /> {t('trustConfirm')}
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon /> {t('trustInsurance')}
          </li>
        </ul>

        <BookingWidgetInline />
      </section>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="text-[color:var(--color-accent-primary)] flex-shrink-0"
    >
      <path
        d="M3 9l4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
