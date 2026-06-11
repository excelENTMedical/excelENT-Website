import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import EducationArticle from '@/components/patient/EducationArticle'
import MissingTranslationBanner from '@/components/patient/MissingTranslationBanner'
import StructuredData from '@/components/StructuredData'
import { medicalWebPageSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { title, blocks } from '@/content/sinusitis/what-is-sinusitis'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sinusitis' })
  return pageMetadata({
    path: '/sinusitis/what-is-sinusitis',
    locale,
    title,
    description: t('card1Excerpt'),
  })
}

export default async function WhatIsSinusitisPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('sinusitis')
  const tCta = await getTranslations('cta')

  const schemas = [
    medicalWebPageSchema({
      name: title,
      description: t('card1Excerpt'),
      url: '/sinusitis/what-is-sinusitis',
      about: 'Sinusitis',
      aboutType: 'MedicalCondition',
    }),
    breadcrumbSchema([
      { name: 'Sinus education', path: '/sinusitis' },
      { name: title, path: '/sinusitis/what-is-sinusitis' },
    ]),
  ]
  return (
    <>
      <StructuredData data={schemas} />
      <MissingTranslationBanner locale={locale} pathInOtherLocale="/sinusitis/what-is-sinusitis" />
      <EducationArticle
        eyebrow={t('hubEyebrow')}
        title={title}
        lead={t('card1Excerpt')}
        crumbs={[
          { label: t('hubEyebrow'), href: '/sinusitis' },
          { label: title, href: '/sinusitis/what-is-sinusitis' },
        ]}
        blocks={blocks}
        scheduleLabel={tCta('schedule')}
        next={{ label: t('card2Title'), href: '/sinusitis/symptoms' }}
      />
    </>
  )
}
