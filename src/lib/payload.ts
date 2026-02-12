import { getPayload, type Where } from 'payload'
import config from '@payload-config'

export async function getPayloadClient() {
  return getPayload({ config })
}

export async function getFeaturedSpecialists(locale: string = 'en') {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'specialists',
    where: {
      featured: { equals: true },
    },
    locale: locale as 'en' | 'es',
    depth: 1,
    limit: 10,
  })
  return result.docs
}

export async function getAllSpecialists(locale: string = 'en') {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'specialists',
    locale: locale as 'en' | 'es',
    depth: 1,
    limit: 100,
  })
  return result.docs
}

export async function getFAQs(locale: string = 'en', category?: string) {
  const payload = await getPayloadClient()
  const where: Where = {}
  if (category) {
    where.category = { equals: category }
  }
  const result = await payload.find({
    collection: 'faqs',
    where,
    locale: locale as 'en' | 'es',
    sort: 'order',
    limit: 50,
  })
  return result.docs
}

export async function getArticles(
  locale: string = 'en',
  page: number = 1,
  limit: number = 6,
  category?: string,
) {
  const payload = await getPayloadClient()
  const where: Where = {
    status: { equals: 'published' },
  }
  if (category) {
    where.category = { equals: category }
  }
  const result = await payload.find({
    collection: 'articles',
    where,
    locale: locale as 'en' | 'es',
    sort: '-publishedDate',
    page,
    limit,
    depth: 1,
  })
  return result
}

export async function getArticleBySlug(slug: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: {
      slug: { equals: slug },
    },
    locale: locale as 'en' | 'es',
    depth: 1,
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getLandingPageBySlug(slug: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'landing-pages',
    where: {
      slug: { equals: slug },
    },
    locale: locale as 'en' | 'es',
    depth: 2,
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getFeaturedTestimonial(locale: string = 'en') {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'testimonials',
    where: {
      featured: { equals: true },
    },
    locale: locale as 'en' | 'es',
    depth: 1,
    limit: 1,
  })
  return result.docs[0] || null
}
