import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { getArticles } from '@/lib/payload'

interface ResourcesPageProps {
  params: Promise<{ locale: string }>
}

// Fallback articles
const fallbackArticles = [
  {
    slug: 'understanding-chronic-sinusitis',
    title: 'Understanding Chronic Sinusitis: Causes and Symptoms',
    excerpt: 'Learn about the common causes of chronic sinusitis and how to recognize the symptoms that may indicate you need treatment.',
    category: 'Sinus Health',
    publishedDate: '2024-01-15',
    readTime: '5 min read',
    featuredImageUrl: null as string | null,
  },
  {
    slug: 'balloon-sinuplasty-vs-traditional-surgery',
    title: 'Balloon Sinuplasty vs. Traditional Sinus Surgery',
    excerpt: 'Compare the benefits and differences between balloon sinuplasty and traditional endoscopic sinus surgery.',
    category: 'Treatment Options',
    publishedDate: '2024-01-10',
    readTime: '7 min read',
    featuredImageUrl: null as string | null,
  },
  {
    slug: 'patient-success-story-sarah',
    title: "Sarah's Journey to Sinus Relief",
    excerpt: 'Read about how Sarah found lasting relief from chronic sinusitis through balloon sinuplasty after years of suffering.',
    category: 'Patient Stories',
    publishedDate: '2024-01-05',
    readTime: '4 min read',
    featuredImageUrl: null as string | null,
  },
  {
    slug: 'preparing-for-balloon-sinuplasty',
    title: 'How to Prepare for Your Balloon Sinuplasty Procedure',
    excerpt: "Everything you need to know about preparing for your in-office balloon sinuplasty procedure, including what to expect on the day of treatment.",
    category: 'Treatment Options',
    publishedDate: '2023-12-28',
    readTime: '6 min read',
    featuredImageUrl: null as string | null,
  },
  {
    slug: 'winter-sinus-tips',
    title: '5 Tips for Managing Sinus Problems in Winter',
    excerpt: 'Cold weather can worsen sinus symptoms. Learn practical tips for keeping your sinuses healthy during the winter months.',
    category: 'Sinus Health',
    publishedDate: '2023-12-20',
    readTime: '4 min read',
    featuredImageUrl: null as string | null,
  },
  {
    slug: 'insurance-coverage-balloon-sinuplasty',
    title: 'Insurance Coverage for Balloon Sinuplasty: What You Need to Know',
    excerpt: 'Understanding your insurance options for balloon sinuplasty, including Medicare and private insurance coverage.',
    category: 'News',
    publishedDate: '2023-12-15',
    readTime: '5 min read',
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

  const cmsResult = await getArticles(locale, 1, 6).catch(() => null)

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
          readTime: '5 min read',
          featuredImageUrl,
        }
      })
    : fallbackArticles

  const categories = ['All Articles', 'Sinus Health', 'Treatment Options', 'Patient Stories', 'News']

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">Resources & Articles</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              Stay informed with the latest articles on sinus health, treatment
              options, and patient success stories.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:flex-grow">
              <div className="grid md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <article
                    key={article.slug}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      {article.featuredImageUrl ? (
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded">
                          {article.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {article.readTime}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link
                          href={`/resources/${article.slug}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : ''}
                        </span>
                        <Link
                          href={`/resources/${article.slug}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                    ←
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                    →
                  </button>
                </nav>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          index === 0
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter CTA */}
              <div className="bg-primary-700 rounded-xl shadow-sm p-6 text-white">
                <h3 className="font-semibold text-lg mb-3">Stay Updated</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Get the latest sinus health tips and news delivered to your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button type="submit" className="w-full btn-accent">
                    Subscribe
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
