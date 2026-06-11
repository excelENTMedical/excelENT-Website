import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import EditorialHero from '@/components/patient/EditorialHero'
import ScheduleButton from '@/components/patient/ScheduleButton'
import TrustBar from '@/components/patient/TrustBar'
import StepCard from '@/components/patient/StepCard'
import ArticleCard from '@/components/patient/ArticleCard'
import FAQAccordionPatient from '@/components/patient/FAQAccordionPatient'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import VimeoEmbed from '@/components/patient/VimeoEmbed'
import { pageMetadata } from '@/lib/page-metadata'
import { getArticles } from '@/content/articles'
import { getFAQs } from '@/lib/payload'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  return pageMetadata({
    path: '',
    locale,
    title: t('headline'),
    description: t('subhead'),
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  const articleResult = getArticles({ page: 1, limit: 3 })
  const faqs = await getFAQs(locale).catch(() => [])
  const articles = articleResult.docs
  const homeFaqs = (faqs as Array<{ id: string | number; question: string; answer: string }>).slice(0, 6)

  return (
    <>
      <EditorialHero
        eyebrow={t('eyebrow')}
        title={t('headline')}
        body={t('subhead')}
        imageSrc="/images/heroes/patient-home.webp"
        imageAlt="A woman taking a deep breath of fresh air on a sunlit coastal path"
        ctaPrimary={<ScheduleButton size="lg">{t('primaryCta')}</ScheduleButton>}
        ctaSecondary={
          <Link href="/sinusitis" className="btn-patient-secondary btn-patient-lg">
            {t('secondaryCta')}
          </Link>
        }
      />

      <TrustBar
        title={t('trustBarTitle')}
        stats={[
          { number: t('stat1Number'), label: t('stat1Label') },
          { number: t('stat2Number'), label: t('stat2Label') },
          { number: t('stat3Number'), label: t('stat3Label') },
          { number: t('stat4Number'), label: t('stat4Label') },
        ]}
      />

      <section aria-labelledby="steps-heading" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl mb-16">
            <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
              {t('stepsEyebrow')}
            </p>
            <h2 id="steps-heading" className="heading-1-patient text-balance">
              {t('stepsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            <StepCard number={1} title={t('step1Title')} body={t('step1Body')} />
            <StepCard number={2} title={t('step2Title')} body={t('step2Body')} />
            <StepCard number={3} title={t('step3Title')} body={t('step3Body')} />
          </div>
        </div>
      </section>

      <section aria-labelledby="patient-story-heading" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                Patient story
              </p>
              <h2 id="patient-story-heading" className="heading-1-patient text-balance">
                Hear from someone who&apos;s been there.
              </h2>
              <p className="body-lead-patient text-ink-secondary mt-5">
                Real patients, real outcomes. Watch a short story about life on the other side of
                chronic sinus problems.
              </p>
            </div>
            <div className="lg:col-span-7">
              <VimeoEmbed
                vimeoId="850210355"
                title="ExcelENT patient story"
                posterSrc="/images/site/audrey-poster.jpg"
                posterAlt="Patient testimonial video"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="education-heading" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                {t('educationEyebrow')}
              </p>
              <h2 id="education-heading" className="heading-1-patient text-balance">
                {t('educationTitle')}
              </h2>
              <p className="body-lead-patient text-ink-secondary mt-4">
                {t('educationBody')}
              </p>
            </div>
            <Link href="/sinusitis" className="btn-patient-text btn-patient-md self-start md:self-auto">
              {tCommon('exploreMore')}
            </Link>
          </div>
          {articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {articles.slice(0, 3).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ScheduleCTABreakout title={t('ctaBlockTitle')} body={t('ctaBlockBody')} />

      {homeFaqs.length > 0 && (
        <section aria-labelledby="faq-heading" className="bg-surface">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                  {t('faqEyebrow')}
                </p>
                <h2 id="faq-heading" className="heading-1-patient text-balance">
                  {t('faqTitle')}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FAQAccordionPatient faqs={homeFaqs} />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
