import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import { pageMetadata } from '@/lib/page-metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sinusitis' })
  return pageMetadata({
    path: '/sinusitis',
    locale,
    title: t('hubTitle'),
    description: t('hubSubtitle'),
  })
}

const PILLARS = [
  { href: '/sinusitis/what-is-sinusitis', titleKey: 'card1Title', excerptKey: 'card1Excerpt' },
  { href: '/sinusitis/symptoms', titleKey: 'card2Title', excerptKey: 'card2Excerpt' },
  { href: '/sinusitis/treatment', titleKey: 'card3Title', excerptKey: 'card3Excerpt' },
  { href: '/balloon-sinuplasty', titleKey: 'card4Title', excerptKey: 'card4Excerpt' },
  { href: '/sinusitis/faqs', titleKey: 'card5Title', excerptKey: 'card5Excerpt' },
] as const

export default async function SinusitisHubPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('sinusitis')
  const tHome = await getTranslations('home')

  return (
    <>
      <section className="bg-surface border-b border-edge-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
              {t('hubEyebrow')}
            </p>
            <h1 className="heading-display-patient text-balance">{t('hubTitle')}</h1>
            <p className="body-lead-patient text-ink-secondary mt-6">{t('hubSubtitle')}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="pillars-heading" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <h2 id="pillars-heading" className="heading-2-patient text-balance max-w-2xl mb-12">
            {t('pillarsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {PILLARS.map((p, i) => (
              <Link
                key={p.href}
                href={p.href as never}
                className="group bg-surface border border-edge p-6 md:p-8 flex flex-col gap-4 transition-shadow duration-normal hover:shadow-[var(--shadow-editorial-card)]"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <span className="font-cabin text-sm text-[color:var(--color-accent-primary)] font-semibold">
                  0{i + 1}
                </span>
                <h3 className="heading-3-patient group-hover:text-[color:var(--color-accent-primary)] transition-colors">
                  {t(p.titleKey)}
                </h3>
                <p className="body-patient text-ink-secondary">{t(p.excerptKey)}</p>
                <span className="font-cabin text-sm text-[color:var(--color-accent-primary)] mt-auto pt-3 inline-flex items-center gap-1.5">
                  {t('readMore')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="when-see-doc" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-3xl">
            <h2 id="when-see-doc" className="heading-2-patient mb-6 text-balance">
              {t('whenSeeDocTitle')}
            </h2>
            <p className="body-lead-patient text-ink-secondary">{t('whenSeeDocBody')}</p>
          </div>
        </div>
      </section>

      <ScheduleCTABreakout title={tHome('ctaBlockTitle')} body={tHome('ctaBlockBody')} />
    </>
  )
}
