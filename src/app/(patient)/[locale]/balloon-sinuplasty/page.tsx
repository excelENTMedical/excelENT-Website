import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import EditorialHero from '@/components/patient/EditorialHero'
import ScheduleButton from '@/components/patient/ScheduleButton'
import TrustBar from '@/components/patient/TrustBar'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import VimeoEmbed from '@/components/patient/VimeoEmbed'
import StructuredData from '@/components/StructuredData'
import { medicalWebPageSchema, breadcrumbSchema } from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import { blocks } from '@/content/sinusitis/balloon'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'balloon' })
  return pageMetadata({
    path: '/balloon-sinuplasty',
    locale,
    title: t('title'),
    description: t('subtitle'),
    image: '/images/products/bb8.webp',
  })
}

export default async function BalloonSinuplastyPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('balloon')
  const tCta = await getTranslations('cta')
  const tHome = await getTranslations('home')
  const tSinus = await getTranslations('sinusitis')

  const schemas = [
    medicalWebPageSchema({
      name: t('title'),
      description: t('subtitle'),
      url: '/balloon-sinuplasty',
      about: 'Balloon sinuplasty',
      aboutType: 'MedicalProcedure',
    }),
    breadcrumbSchema([
      { name: 'Sinus education', path: '/sinusitis' },
      { name: 'Balloon sinuplasty', path: '/balloon-sinuplasty' },
    ]),
  ]

  return (
    <>
      <StructuredData data={schemas} />
      <EditorialHero
        eyebrow={tSinus('hubEyebrow')}
        title={t('title')}
        body={t('subtitle')}
        imageSrc="/images/products/bb8.webp"
        imageAlt="Balloon sinuplasty device"
        ctaPrimary={<ScheduleButton size="lg">{tCta('schedule')}</ScheduleButton>}
        ctaSecondary={
          <Link href="/sinusitis/faqs" className="btn-patient-secondary btn-patient-lg">
            {tSinus('card5Title')}
          </Link>
        }
      />

      <TrustBar
        stats={[
          { number: t('stat1'), label: t('stat1Label') },
          { number: t('stat2'), label: t('stat2Label') },
          { number: t('stat3'), label: t('stat3Label') },
        ]}
      />

      <section aria-label="Procedure walkthrough" className="bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          <VimeoEmbed
            vimeoId="850209661"
            title="Balloon sinuplasty walkthrough"
            posterSrc="/images/site/next-steps-poster.jpg"
            posterAlt="Balloon sinuplasty procedure animation"
          />
        </div>
      </section>

      <article className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="prose-patient">
            {blocks.map((b, i) => {
              if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
              if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>
              if (b.type === 'p') return <p key={i}>{b.text}</p>
              if (b.type === 'ul') return (
                <ul key={i}>
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              )
              return null
            })}
          </div>
        </div>
      </article>

      <ScheduleCTABreakout title={tHome('ctaBlockTitle')} body={tHome('ctaBlockBody')} />
    </>
  )
}
