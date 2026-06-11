import { unstable_setRequestLocale } from 'next-intl/server'
import LegalPage from '@/components/patient/LegalPage'
import { pageMetadata } from '@/lib/page-metadata'
import { title, lastUpdated, blocks } from '@/content/legal/cookies'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMetadata({
    path: '/cookies',
    locale,
    title,
    description: `${title} for ExcelENT.`,
  })
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  return (
    <LegalPage
      title={title}
      lastUpdated={lastUpdated}
      blocks={blocks}
      locale={locale}
      pathInOtherLocale="/cookies"
    />
  )
}
