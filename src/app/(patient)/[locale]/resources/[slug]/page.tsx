import { notFound } from 'next/navigation'
import Image from 'next/image'
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import ScheduleButton from '@/components/patient/ScheduleButton'
import ArticleCard from '@/components/patient/ArticleCard'
import StructuredData from '@/components/StructuredData'
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { ARTICLES, getArticleBySlug } from '@/content/articles'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

const CATEGORY_LABELS: Record<string, string> = {
  'sinus-health': 'Sinus health',
  'treatment-options': 'Treatments',
  'patient-stories': 'Patient stories',
  news: 'News',
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: 'Article | ExcelENT' }
  return pageMetadata({
    path: `/resources/${article.slug}`,
    locale,
    title: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    ogType: 'article',
    publishedTime: article.publishedDate,
  })
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('resources')
  const tCta = await getTranslations('cta')

  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const category = article.category ? CATEGORY_LABELS[article.category] ?? article.category : null
  const date = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const related = ARTICLES.filter((a) => a.slug !== article.slug && a.category === article.category).slice(
    0,
    3,
  )

  const schemas = [
    articleSchema({
      headline: article.title,
      description: article.excerpt,
      image: article.featuredImage,
      datePublished: article.publishedDate,
      author: article.author,
      url: `/resources/${article.slug}`,
      category: category ?? undefined,
    }),
    breadcrumbSchema([
      { name: 'Resources', path: '/resources' },
      { name: article.title, path: `/resources/${article.slug}` },
    ]),
  ]

  return (
    <>
      <StructuredData data={schemas} />
      <div className="bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div
            className="relative w-full overflow-hidden bg-surface-subtle"
            style={{
              aspectRatio: 'var(--photo-aspect-landscape)',
              borderRadius: 'var(--radius-card-editorial)',
            }}
          >
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <article className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-tertiary font-cabin">
              <li>
                <Link href="/resources" className="hover:text-[color:var(--color-accent-primary)]">
                  {t('title')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="line-clamp-1">{article.title}</li>
            </ol>
          </nav>

          <header className="mb-10 md:mb-14">
            {category && (
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                {category}
              </p>
            )}
            <h1 className="heading-1-patient text-balance">{article.title}</h1>
            {article.excerpt && (
              <p className="body-lead-patient text-ink-secondary mt-6">{article.excerpt}</p>
            )}
            <div className="byline mt-6 flex items-center gap-3 text-sm text-ink-tertiary">
              <span>{article.author}</span>
              {date && <span>·</span>}
              {date && <span>{date}</span>}
              <span>·</span>
              <span>
                {article.readingTimeMinutes} {t('readingTime')}
              </span>
            </div>
          </header>

          <div className="prose-patient">
            {article.blocks.map((b, i) => {
              if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
              if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>
              if (b.type === 'p') return <p key={i}>{b.text}</p>
              if (b.type === 'ul')
                return (
                  <ul key={i}>
                    {b.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                )
              return null
            })}
          </div>

          <div className="mt-14 pt-10 border-t border-edge flex flex-col sm:flex-row sm:items-center gap-4">
            <ScheduleButton size="md">{tCta('schedule')}</ScheduleButton>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-surface-subtle">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <h2 id="related-heading" className="heading-2-patient mb-10">
              {t('relatedTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
