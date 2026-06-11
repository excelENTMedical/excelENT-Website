import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/content/articles'
import { LOCATIONS } from '@/content/locations'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://patients.excelentmedical.com'

const STATIC_PATHS = [
  '',
  '/find-a-specialist',
  '/schedule',
  '/sinusitis',
  '/sinusitis/what-is-sinusitis',
  '/sinusitis/symptoms',
  '/sinusitis/treatment',
  '/sinusitis/faqs',
  '/balloon-sinuplasty',
  '/resources',
  '/about',
  '/privacy',
  '/terms',
  '/cookies',
  '/hipaa',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const articles = ARTICLES

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p || '/'}`,
    lastModified: now,
    alternates: {
      languages: { es: `${SITE_URL}/es${p}` },
    },
  }))

  const cityEntries: MetadataRoute.Sitemap = LOCATIONS.flatMap((s) =>
    s.cities.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: now,
    })),
  )

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/resources/${a.slug}`,
    lastModified: a.publishedDate ? new Date(a.publishedDate) : now,
    alternates: {
      languages: { es: `${SITE_URL}/es/resources/${a.slug}` },
    },
  }))

  return [...staticEntries, ...cityEntries, ...articleEntries]
}
