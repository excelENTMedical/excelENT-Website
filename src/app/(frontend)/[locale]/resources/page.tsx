import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { getArticles } from '@/lib/payload'

interface ResourcesPageProps {
  params: Promise<{ locale: string }>
}

// Fallback articles (used if CMS is empty)
const fallbackArticles = [
  {
    slug: 'understanding-chronic-sinusitis',
    title: 'Understanding Chronic Sinusitis: Causes and Symptoms',
    excerpt: 'Learn about the common causes of chronic sinusitis and how to recognize the symptoms.',
    category: 'Sinus Health',
    publishedDate: '2024-01-15',
    featuredImageUrl: null as string | null,
  },
]

const categoryLabelMap: Record<string, string> = {
  'sinus-health': 'Sinus Health',
  'treatment-options': 'Treatment Options',
  'patient-stories': 'Patient Stories',
  'news': 'News',
}

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  // Get all published articles
  const cmsResult = await getArticles(locale, 1, 50).catch(() => null)

  const articles = cmsResult && cmsResult.docs.length > 0
    ? cmsResult.docs.map((article: Record<string, unknown>) => {
        const featuredImage = article.featuredImage
        let featuredImageUrl: string | null = null
        if (featuredImage && typeof featuredImage === 'object') {
          const img = featuredImage as Record<string, unknown>
          featuredImageUrl = (img.url as string) || null
        }
        const categoryValue = (article.category as string) || ''
        return {
          slug: article.slug as string,
          title: article.title as string,
          excerpt: (article.excerpt as string) || '',
          category: categoryLabelMap[categoryValue] || categoryValue,
          publishedDate: (article.publishedDate as string) || '',
          featuredImageUrl,
        }
      })
    : fallbackArticles

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 md:py-28">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Sinus Relief Resources
          </h1>
          <p className="text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
            Find expert guidance, effective solutions, and helpful information to alleviate sinusitis symptoms — tips, treatments, and lifestyle recommendations for better sinus health.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-navy mb-4">
            Articles
          </h2>
          <p className="text-gray-600 text-lg mb-12">
            Explore comprehensive sinus relief resources.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Featured image */}
                <Link href={`/resources/${article.slug}` as never} className="block">
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                    {article.featuredImageUrl ? (
                      <Image
                        src={article.featuredImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-20 h-20 text-primary-700/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                    )}
                    {article.category && (
                      <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 bg-white/95 text-primary-700 rounded-full shadow-sm">
                        {article.category}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold font-heading text-navy mb-3 line-clamp-2 leading-snug">
                    <Link
                      href={`/resources/${article.slug}` as never}
                      className="hover:text-primary-700 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {article.publishedDate
                        ? new Date(article.publishedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                    <Link
                      href={`/resources/${article.slug}` as never}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1 transition-colors"
                    >
                      Read More
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-6 max-w-3xl mx-auto leading-tight">
            Ready To Breathe Better?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Connect with a local sinus specialist to explore your treatment options.
          </p>
          <Link href="/find-specialist" className="btn-primary text-base md:text-lg px-10 py-4">
            Find A Local Sinus Specialist
          </Link>
        </div>
      </section>
    </>
  )
}
