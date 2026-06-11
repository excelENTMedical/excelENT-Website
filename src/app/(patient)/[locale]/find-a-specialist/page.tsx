import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import { LOCATIONS } from '@/content/locations'
import { pageMetadata } from '@/lib/page-metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'locations' })
  return pageMetadata({
    path: '/find-a-specialist',
    locale,
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function LocationsPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('locations')
  const tHome = await getTranslations('home')

  return (
    <>
      <section className="bg-surface border-b border-edge-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="heading-1-patient text-balance">{t('title')}</h1>
            <p className="body-lead-patient text-ink-secondary mt-5">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <section aria-label="Locations by state" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ol role="list" className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            {LOCATIONS.map((state) => (
              <li key={state.abbr} className="flex flex-col gap-5">
                <header className="flex items-baseline gap-3 pb-4 border-b border-edge-subtle">
                  <h2 className="heading-2-patient">{state.state}</h2>
                  <span className="text-sm font-cabin text-ink-tertiary uppercase tracking-wider">
                    {state.abbr}
                  </span>
                </header>
                <ul role="list" className="flex flex-col gap-4">
                  {state.cities.map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/${city.slug}` as `/${string}`}
                        className="group flex flex-col gap-1 p-5 bg-surface-subtle hover:bg-[color:var(--color-accent-primary-subtle)] border border-edge transition-colors duration-fast"
                        style={{ borderRadius: 'var(--radius-card)' }}
                      >
                        <span className="font-cabin text-lg md:text-xl font-semibold text-ink group-hover:text-[color:var(--color-accent-primary)]">
                          {city.city}, {state.abbr}
                        </span>
                        {city.blurb && (
                          <span className="body-patient text-ink-secondary text-sm">
                            {city.blurb}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="body-patient text-ink-tertiary mt-12 text-sm">
            {t('comingSoon')}
          </p>
        </div>
      </section>

      <ScheduleCTABreakout title={tHome('ctaBlockTitle')} body={tHome('ctaBlockBody')} />
    </>
  )
}
