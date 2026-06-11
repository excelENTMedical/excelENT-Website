import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'es'] as const
type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: Locale = locales.includes(requested as Locale)
    ? (requested as Locale)
    : 'en'
  if (!requested) notFound()
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
