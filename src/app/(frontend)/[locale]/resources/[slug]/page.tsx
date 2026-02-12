import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/payload'
import RichText from '@/components/RichText'

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>
}

// Fallback articles for when CMS is empty
const fallbackArticles: Record<string, {
  title: string
  excerpt: string
  content: string
  category: string
  publishedDate: string
  readTime: string
  author: string
}> = {
  'understanding-chronic-sinusitis': {
    title: 'Understanding Chronic Sinusitis: Causes and Symptoms',
    excerpt: 'Learn about the common causes of chronic sinusitis and how to recognize the symptoms that may indicate you need treatment.',
    content: `
      <p>Chronic sinusitis is a common condition that affects millions of Americans each year. Unlike acute sinusitis, which typically resolves within a few weeks, chronic sinusitis persists for 12 weeks or longer, despite treatment attempts.</p>
      <h2>What Causes Chronic Sinusitis?</h2>
      <p>Several factors can contribute to the development of chronic sinusitis:</p>
      <ul>
        <li><strong>Nasal polyps:</strong> These tissue growths can block the nasal passages or sinuses.</li>
        <li><strong>Deviated septum:</strong> A crooked septum can restrict or block sinus passages.</li>
        <li><strong>Respiratory tract infections:</strong> Infections can inflame and thicken sinus membranes.</li>
        <li><strong>Allergies:</strong> Inflammation from allergies can block your sinuses.</li>
        <li><strong>Other medical conditions:</strong> Complications of conditions such as cystic fibrosis, HIV, and other immune system-related diseases.</li>
      </ul>
      <h2>Recognizing the Symptoms</h2>
      <p>Common signs and symptoms of chronic sinusitis include:</p>
      <ul>
        <li>Thick, discolored discharge from the nose or drainage down the back of the throat</li>
        <li>Nasal obstruction or congestion, causing difficulty breathing through your nose</li>
        <li>Pain, tenderness, and swelling around your eyes, cheeks, nose, or forehead</li>
        <li>Reduced sense of smell and taste</li>
      </ul>
      <p>Other signs and symptoms can include ear pain, headache, aching in your upper jaw and teeth, cough or throat clearing, sore throat, bad breath, and fatigue.</p>
      <h2>When to Seek Treatment</h2>
      <p>If you've been experiencing these symptoms for 12 weeks or longer, it's time to consult with a specialist. Early diagnosis and treatment can help prevent complications and improve your quality of life.</p>
    `,
    category: 'Sinus Health',
    publishedDate: '2024-01-15',
    readTime: '5 min read',
    author: 'Dr. Sarah Johnson',
  },
  'balloon-sinuplasty-vs-traditional-surgery': {
    title: 'Balloon Sinuplasty vs. Traditional Sinus Surgery',
    excerpt: 'Compare the benefits and differences between balloon sinuplasty and traditional endoscopic sinus surgery.',
    content: `
      <p>When medications fail to provide relief from chronic sinusitis, surgery may be recommended. Two main surgical options are available: traditional endoscopic sinus surgery (ESS) and balloon sinuplasty. Understanding the differences can help you make an informed decision.</p>
      <h2>Traditional Endoscopic Sinus Surgery (ESS)</h2>
      <p>Traditional sinus surgery involves removing bone and tissue to enlarge the sinus opening and allow proper drainage. This procedure:</p>
      <ul>
        <li>Is typically performed in an operating room under general anesthesia</li>
        <li>Involves cutting and removal of tissue</li>
        <li>May require packing of the nasal cavity</li>
        <li>Has a recovery time of 1-2 weeks</li>
        <li>Is effective for severe cases with polyps or structural issues</li>
      </ul>
      <h2>Balloon Sinuplasty</h2>
      <p>Balloon sinuplasty is a minimally invasive alternative that uses a small balloon to open blocked sinus passages. This procedure:</p>
      <ul>
        <li>Can be performed in-office under local anesthesia</li>
        <li>Requires no cutting or removal of bone and tissue</li>
        <li>Has minimal bleeding and no packing required</li>
        <li>Has a recovery time of just 24-48 hours</li>
        <li>Achieves a 97% success rate in clinical studies</li>
      </ul>
      <h2>Which Is Right for You?</h2>
      <p>The best option depends on your specific condition. Balloon sinuplasty is ideal for patients with chronic sinusitis who haven't responded to medication but don't have severe structural issues. Traditional surgery may be necessary for patients with nasal polyps or significant anatomical abnormalities.</p>
      <p>A consultation with a qualified ENT specialist can help determine which procedure is best for your situation.</p>
    `,
    category: 'Treatment Options',
    publishedDate: '2024-01-10',
    readTime: '7 min read',
    author: 'Dr. Michael Chen',
  },
}

const categoryLabelMap: Record<string, string> = {
  'sinus-health': 'Sinus Health',
  'treatment-options': 'Treatment Options',
  'patient-stories': 'Patient Stories',
  'news': 'News',
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params
  unstable_setRequestLocale(locale)

  const cmsArticle = await getArticleBySlug(slug, locale).catch(() => null)

  // Use CMS data or fall back to hardcoded
  if (cmsArticle) {
    const categoryValue = (cmsArticle.category as string) || ''
    const category = categoryLabelMap[categoryValue] || categoryValue
    const publishedDate = (cmsArticle.publishedDate as string) || ''
    const author = (cmsArticle.author as string) || ''
    const hasRichText = cmsArticle.content && typeof cmsArticle.content === 'object' && 'root' in (cmsArticle.content as Record<string, unknown>)

    return (
      <>
        {/* Article Header */}
        <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {category}
                </span>
                <span className="text-primary-200">5 min read</span>
              </div>
              <h1 className="heading-1 text-white mb-6">{cmsArticle.title as string}</h1>
              <p className="text-lg text-primary-100 leading-relaxed mb-8">
                {(cmsArticle.excerpt as string) || ''}
              </p>
              {author && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{author}</div>
                    {publishedDate && (
                      <div className="text-primary-200 text-sm">
                        {new Date(publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              {hasRichText ? (
                <RichText content={cmsArticle.content as unknown as Parameters<typeof RichText>[0]['content']} />
              ) : (
                <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600">
                  <p>Content coming soon.</p>
                </div>
              )}

              {/* Share & Navigation */}
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">Share:</span>
                    <div className="flex gap-2">
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      </a>
                    </div>
                  </div>
                  <Link href="/resources" className="text-primary-600 font-medium hover:text-primary-700">
                    ← Back to Resources
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-primary-700">
          <div className="container-custom text-center">
            <h2 className="heading-2 text-white mb-6">Ready to Find Relief?</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Connect with a specialist in your area to discuss your treatment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connect" className="btn-accent text-lg px-8 py-4">Take the Quiz</Link>
              <Link href="/find-specialist" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">Find a Specialist</Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  // Fallback to hardcoded articles
  const article = fallbackArticles[slug]
  if (!article) {
    notFound()
  }

  return (
    <>
      {/* Article Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{article.category}</span>
              <span className="text-primary-200">{article.readTime}</span>
            </div>
            <h1 className="heading-1 text-white mb-6">{article.title}</h1>
            <p className="text-lg text-primary-100 leading-relaxed mb-8">{article.excerpt}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">{article.author}</div>
                <div className="text-primary-200 text-sm">
                  {new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <article
              className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Share & Navigation */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">Share:</span>
                  <div className="flex gap-2">
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </a>
                  </div>
                </div>
                <Link href="/resources" className="text-primary-600 font-medium hover:text-primary-700">
                  ← Back to Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-6">Ready to Find Relief?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Connect with a specialist in your area to discuss your treatment options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connect" className="btn-accent text-lg px-8 py-4">Take the Quiz</Link>
            <Link href="/find-specialist" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">Find a Specialist</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateStaticParams() {
  try {
    const result = await getArticles('en', 1, 100)
    if (result.docs.length > 0) {
      return result.docs.flatMap((article: Record<string, unknown>) => [
        { locale: 'en', slug: article.slug as string },
        { locale: 'es', slug: article.slug as string },
      ])
    }
  } catch {
    // Fall back to hardcoded slugs
  }
  return [
    { locale: 'en', slug: 'understanding-chronic-sinusitis' },
    { locale: 'en', slug: 'balloon-sinuplasty-vs-traditional-surgery' },
    { locale: 'es', slug: 'understanding-chronic-sinusitis' },
    { locale: 'es', slug: 'balloon-sinuplasty-vs-traditional-surgery' },
  ]
}
