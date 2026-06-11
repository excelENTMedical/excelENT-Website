import Image from 'next/image'
import { Link } from '@/i18n/routing'

const CATEGORY_LABELS: Record<string, string> = {
  'sinus-health': 'Sinus health',
  'treatment-options': 'Treatments',
  'patient-stories': 'Patient stories',
  news: 'News',
}

interface ArticleImage {
  url?: string | null
  alt?: string | null
}

export interface ArticleDoc {
  id?: string | number
  slug: string
  title: string
  excerpt?: string | null
  featuredImage?: ArticleImage | string | null
  category?: string | null
  publishedDate?: string | null
  author?: string | null
  readingTimeMinutes?: number
}

function imageUrl(a: ArticleDoc): string | null {
  const p = a.featuredImage
  if (!p) return null
  if (typeof p === 'string') return p
  if (typeof p === 'object' && p?.url) return p.url
  return null
}

function readTime(text: string | null | undefined): number {
  if (!text) return 4
  const words = text.split(/\s+/).length
  return Math.max(2, Math.round(words / 200))
}

interface Props {
  article: ArticleDoc
  variant?: 'default' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const featured = variant === 'featured'
  const url = imageUrl(article)
  const category = article.category ? CATEGORY_LABELS[article.category] ?? article.category : null
  const date = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <article
      className={`group bg-surface flex flex-col overflow-hidden transition-shadow duration-normal hover:shadow-[var(--shadow-editorial-card)] border-l-4 border-[color:var(--color-accent-primary)] ${
        featured ? 'lg:flex-row lg:items-stretch' : ''
      }`}
    >
      <Link
        href={`/resources/${article.slug}` as `/resources/${string}`}
        className={`relative overflow-hidden bg-surface-subtle ${featured ? 'lg:w-1/2' : ''}`}
        style={{
          aspectRatio: featured ? 'var(--photo-aspect-landscape)' : 'var(--photo-aspect-landscape)',
        }}
      >
        {url ? (
          <Image
            src={url}
            alt={article.title}
            fill
            sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-slow group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-accent-primary-subtle)]">
            <span className="font-cabin text-2xl text-[color:var(--color-accent-primary)]">
              {article.title.slice(0, 1)}
            </span>
          </div>
        )}
      </Link>
      <div className={`flex flex-col gap-4 p-6 md:p-7 flex-grow ${featured ? 'lg:w-1/2 lg:p-10 lg:justify-center' : ''}`}>
        {category && (
          <p className="eyebrow-patient text-[color:var(--color-accent-primary)]">{category}</p>
        )}
        <Link
          href={`/resources/${article.slug}` as `/resources/${string}`}
          className="hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
        >
          <h3 className={featured ? 'heading-2-patient' : 'heading-3-patient'}>
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="body-patient text-ink-secondary">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-ink-tertiary mt-auto pt-4 border-t border-edge-subtle">
          {article.author && <span>{article.author}</span>}
          {article.author && date && <span>·</span>}
          {date && <span>{date}</span>}
          {(article.author || date) && <span>·</span>}
          <span>{article.readingTimeMinutes ?? readTime(article.excerpt)} min read</span>
        </div>
      </div>
    </article>
  )
}
