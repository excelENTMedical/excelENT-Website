import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import ArticleCard from '@/components/patient/ArticleCard'
import { pageMetadata } from '@/lib/page-metadata'
import { getArticles } from '@/content/articles'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; category?: string }>
}

const PAGE_SIZE = 9
const CATEGORIES = [
  { value: '', labelKey: 'filterAll' },
  { value: 'sinus-health', labelKey: 'filterSinusHealth' },
  { value: 'treatment-options', labelKey: 'filterTreatment' },
  { value: 'patient-stories', labelKey: 'filterPatientStories' },
  { value: 'news', labelKey: 'filterNews' },
] as const

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resources' })
  return pageMetadata({
    path: '/resources',
    locale,
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function ResourcesIndexPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  unstable_setRequestLocale(locale)
  const t = await getTranslations('resources')

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const category = sp.category && sp.category !== '' ? sp.category : undefined

  const result = getArticles({ page, limit: PAGE_SIZE, category })
  const articles = result.docs
  const totalPages = result.totalPages
  const featured = articles[0]
  const rest = articles.slice(1)

  const pageHref = (p: number, cat?: string) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (cat) params.set('category', cat)
    const q = params.toString()
    return q ? `/resources?${q}` : '/resources'
  }

  return (
    <>
      <section className="bg-surface border-b border-edge-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="heading-display-patient text-balance">{t('title')}</h1>
            <p className="body-lead-patient text-ink-secondary mt-5">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <nav aria-label="Filter by category">
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = (category ?? '') === c.value
                return (
                  <li key={c.value || 'all'}>
                    <Link
                      href={pageHref(1, c.value || undefined) as never}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-cabin transition-colors ${
                        active
                          ? 'bg-[color:var(--color-accent-primary)] text-[color:var(--color-accent-primary-fg)]'
                          : 'bg-surface-subtle text-ink-secondary hover:text-ink border border-edge'
                      }`}
                    >
                      {t(c.labelKey)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          {articles.length === 0 ? (
            <p className="body-lead-patient text-ink-secondary py-16 text-center">
              {t('noArticles')}
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              {page === 1 && featured && !category && (
                <ArticleCard article={featured} variant="featured" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {(page === 1 && !category ? rest : articles).map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-14 flex items-center justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1, category) as never}
                  className="btn-patient-text btn-patient-md"
                >
                  ← {t('previous')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm font-cabin text-ink-tertiary">
                {t('page')} {page} {t('of')} {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1, category) as never}
                  className="btn-patient-text btn-patient-md"
                >
                  {t('next')} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
