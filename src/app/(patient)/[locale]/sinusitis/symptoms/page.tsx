import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import EducationArticle from '@/components/patient/EducationArticle'
import MissingTranslationBanner from '@/components/patient/MissingTranslationBanner'
import StructuredData from '@/components/StructuredData'
import { medicalWebPageSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { title, blocks } from '@/content/sinusitis/symptoms'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sinusitis' })
  return pageMetadata({
    path: '/sinusitis/symptoms',
    locale,
    title,
    description: t('card2Excerpt'),
  })
}

export default async function SymptomsPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('sinusitis')
  const tCta = await getTranslations('cta')

  const schemas = [
    medicalWebPageSchema({
      name: title,
      description: t('card2Excerpt'),
      url: '/sinusitis/symptoms',
      about: 'Sinusitis',
      aboutType: 'MedicalCondition',
    }),
    breadcrumbSchema([
      { name: 'Sinus education', path: '/sinusitis' },
      { name: title, path: '/sinusitis/symptoms' },
    ]),
  ]
  return (
    <>
      <StructuredData data={schemas} />
      <MissingTranslationBanner locale={locale} pathInOtherLocale="/sinusitis/symptoms" />
      <EducationArticle
        eyebrow={t('hubEyebrow')}
        title={title}
        lead={t('card2Excerpt')}
        crumbs={[
          { label: t('hubEyebrow'), href: '/sinusitis' },
          { label: title, href: '/sinusitis/symptoms' },
        ]}
        blocks={blocks}
        scheduleLabel={tCta('schedule')}
        prev={{ label: t('card1Title'), href: '/sinusitis/what-is-sinusitis' }}
        next={{ label: t('card3Title'), href: '/sinusitis/treatment' }}
      />
    </>
  )
}
