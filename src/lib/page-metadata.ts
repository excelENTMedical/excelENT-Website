import type { Metadata } from 'next'
import { SITE_URL, abs } from './structured-data'

interface Input {
  /** Path with leading slash, e.g. "/sinusitis/symptoms". Use "" for the home page. */
  path: string
  /** Locale of the rendered page. Used to set canonical + hreflang. */
  locale: string
  /** Page title (without the brand suffix — that gets added). */
  title: string
  description: string
  /** Optional OG image path or absolute URL. Defaults to /images/hero-main.png. */
  image?: string
  /**
   * Optional OG type override. "article" for blog posts, "website" otherwise.
   */
  ogType?: 'website' | 'article'
  /** ISO date for article OG metadata. */
  publishedTime?: string
}

const DEFAULT_OG_IMAGE = '/images/hero-main.png'

/**
 * Builds canonical + hreflang + OG metadata for a single patient-site page.
 * - Canonical points to the locale-specific URL (English at /<path>, Spanish at /es<path>).
 * - alternates.languages emits hreflang tags for both locales + x-default.
 * - openGraph image is resolved to an absolute URL.
 */
export function pageMetadata(input: Input): Metadata {
  const { path, locale, title, description, image, ogType = 'website', publishedTime } = input
  const cleanPath = path.startsWith('/') || path === '' ? path : `/${path}`
  const enUrl = `${SITE_URL}${cleanPath || '/'}`
  const esUrl = `${SITE_URL}/es${cleanPath}`
  const canonical = locale === 'es' ? esUrl : enUrl
  const ogImage = abs(image ?? DEFAULT_OG_IMAGE)

  return {
    title: `${title} | ExcelENT`,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        'en-US': enUrl,
        es: esUrl,
        'es-US': esUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      type: ogType,
      url: canonical,
      title: `${title} | ExcelENT`,
      description,
      siteName: 'ExcelENT',
      locale: locale === 'es' ? 'es_US' : 'en_US',
      alternateLocale: locale === 'es' ? 'en_US' : 'es_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(ogType === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ExcelENT`,
      description,
      images: [ogImage],
    },
  }
}
