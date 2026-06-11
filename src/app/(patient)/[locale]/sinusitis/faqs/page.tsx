import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import FAQAccordionPatient from '@/components/patient/FAQAccordionPatient'
import ScheduleButton from '@/components/patient/ScheduleButton'
import MissingTranslationBanner from '@/components/patient/MissingTranslationBanner'
import StructuredData from '@/components/StructuredData'
import { faqPageSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { title, faqs } from '@/content/sinusitis/faqs'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sinusitis' })
  return pageMetadata({
    path: '/sinusitis/faqs',
    locale,
    title,
    description: t('card5Excerpt'),
  })
}

export default async function SinusitisFaqsPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('sinusitis')
  const tCta = await getTranslations('cta')

  const accordionFaqs = faqs.map((f, i) => ({
    id: i,
    question: f.q,
    answer: f.a,
  }))

  const schemas = [
    faqPageSchema(faqs.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbSchema([
      { name: 'Sinus education', path: '/sinusitis' },
      { name: 'FAQs', path: '/sinusitis/faqs' },
    ]),
  ]

  return (
    <>
      <StructuredData data={schemas} />
      <MissingTranslationBanner locale={locale} pathInOtherLocale="/sinusitis/faqs" />
      <article className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-tertiary font-cabin">
              <li>
                <Link href="/sinusitis" className="hover:text-[color:var(--color-accent-primary)]">
                  {t('hubEyebrow')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>FAQs</li>
            </ol>
          </nav>

          <header className="mb-10 md:mb-14">
            <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
              {t('hubEyebrow')}
            </p>
            <h1 className="heading-1-patient text-balance">{title}</h1>
            <p className="body-lead-patient text-ink-secondary mt-6">{t('card5Excerpt')}</p>
          </header>

          <FAQAccordionPatient faqs={accordionFaqs} />

          <div className="mt-14 pt-10 border-t border-edge flex flex-col sm:flex-row sm:items-center gap-4">
            <ScheduleButton size="md">{tCta('schedule')}</ScheduleButton>
          </div>

          <nav
            aria-label="Adjacent guides"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link
              href="/balloon-sinuplasty"
              className="bg-surface border border-edge p-5 flex flex-col gap-1 hover:border-[color:var(--color-accent-primary)] transition-colors"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <span className="text-xs uppercase tracking-wider text-ink-tertiary">Previous</span>
              <span className="font-cabin text-lg font-semibold text-ink">{t('card4Title')}</span>
            </Link>
            <Link
              href="/sinusitis"
              className="bg-surface border border-edge p-5 flex flex-col gap-1 sm:text-right hover:border-[color:var(--color-accent-primary)] transition-colors"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <span className="text-xs uppercase tracking-wider text-ink-tertiary">Back to</span>
              <span className="font-cabin text-lg font-semibold text-ink">{t('hubEyebrow')}</span>
            </Link>
          </nav>
        </div>
      </article>
    </>
  )
}
