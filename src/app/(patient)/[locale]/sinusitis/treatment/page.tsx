import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import EducationArticle from '@/components/patient/EducationArticle'
import MissingTranslationBanner from '@/components/patient/MissingTranslationBanner'
import StructuredData from '@/components/StructuredData'
import { medicalWebPageSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { title, blocks } from '@/content/sinusitis/treatment'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sinusitis' })
  return pageMetadata({
    path: '/sinusitis/treatment',
    locale,
    title,
    description: t('card3Excerpt'),
  })
}

export default async function TreatmentPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('sinusitis')
  const tCta = await getTranslations('cta')

  const schemas = [
    medicalWebPageSchema({
      name: title,
      description: t('card3Excerpt'),
      url: '/sinusitis/treatment',
      about: 'Sinusitis treatment',
      aboutType: 'MedicalProcedure',
    }),
    breadcrumbSchema([
      { name: 'Sinus education', path: '/sinusitis' },
      { name: title, path: '/sinusitis/treatment' },
    ]),
  ]
  return (
    <>
      <StructuredData data={schemas} />
      <MissingTranslationBanner locale={locale} pathInOtherLocale="/sinusitis/treatment" />
      <EducationArticle
        eyebrow={t('hubEyebrow')}
        title={title}
        lead={t('card3Excerpt')}
        crumbs={[
          { label: t('hubEyebrow'), href: '/sinusitis' },
          { label: title, href: '/sinusitis/treatment' },
        ]}
        blocks={blocks}
        scheduleLabel={tCta('schedule')}
        prev={{ label: t('card2Title'), href: '/sinusitis/symptoms' }}
        next={{ label: t('card4Title'), href: '/balloon-sinuplasty' }}
      />
    </>
  )
}
