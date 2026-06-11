/**
 * JSON-LD schema builders for the patient site.
 *
 * Each builder returns a plain object that callers serialize via the
 * <StructuredData> component. URLs are made absolute with `siteUrl()`
 * because Google's parser strongly prefers absolute @id and url fields.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://patients.excelentmedical.com'
)

export function abs(path: string): string {
  if (!path) return SITE_URL
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': ORG_ID,
    name: 'ExcelENT',
    legalName: 'ExcelENT, Inc.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/images/logo.png'),
      width: 1920,
      height: 641,
    },
    medicalSpecialty: 'Otolaryngologic',
    sameAs: [
      'https://www.facebook.com/excelENTinc',
      'https://www.instagram.com/excelent_medical/',
      'https://www.youtube.com/@excelent-medical',
      'https://www.linkedin.com/company/excelentmedical',
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'ExcelENT',
    inLanguage: 'en-US',
    publisher: { '@id': ORG_ID },
  }
}

interface BreadcrumbInput {
  name: string
  /** Path relative to siteUrl, e.g. "/resources" */
  path: string
}

export function breadcrumbSchema(items: BreadcrumbInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  }
}

interface FAQInput {
  question: string
  answer: string
}

export function faqPageSchema(faqs: FAQInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

interface ArticleInput {
  headline: string
  description?: string
  image: string
  datePublished?: string
  dateModified?: string
  author: string
  url: string
  category?: string
}

export function articleSchema(a: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.headline,
    description: a.description,
    image: abs(a.image),
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: {
      '@type': 'Person',
      name: a.author,
    },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': abs(a.url),
    },
    articleSection: a.category,
  }
}

interface MedicalWebPageInput {
  name: string
  description: string
  url: string
  /** e.g. "Sinusitis" or "Balloon sinuplasty" */
  about: string
  /** "MedicalCondition" for diseases, "MedicalProcedure" for treatments */
  aboutType: 'MedicalCondition' | 'MedicalProcedure'
  /** Patient education audience by default */
  audience?: 'patient' | 'caregiver'
  lastReviewed?: string
}

export function medicalWebPageSchema(p: MedicalWebPageInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: p.name,
    description: p.description,
    url: abs(p.url),
    inLanguage: 'en-US',
    about: {
      '@type': p.aboutType,
      name: p.about,
    },
    audience: {
      '@type': 'PatientsAudience',
      healthCondition: { '@type': 'MedicalCondition', name: 'Sinusitis' },
    },
    lastReviewed: p.lastReviewed,
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
}

interface LocalBusinessInput {
  city: string
  state: string
  region?: string
  url: string
  image: string
}

export function localBusinessSchema(b: LocalBusinessInput) {
  const name = `ExcelENT — ${b.city}, ${b.state}`
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${abs(b.url)}#localbusiness`,
    name,
    url: abs(b.url),
    image: abs(b.image),
    parentOrganization: { '@id': ORG_ID },
    medicalSpecialty: 'Otolaryngologic',
    areaServed: [
      { '@type': 'City', name: b.city },
      { '@type': 'State', name: b.state },
      ...(b.region ? [{ '@type': 'Place', name: b.region }] : []),
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: b.city,
      addressRegion: b.state,
      addressCountry: 'US',
    },
  }
}
