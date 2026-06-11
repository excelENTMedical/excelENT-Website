import Image from 'next/image'
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import EditorialHero from '@/components/patient/EditorialHero'
import ScheduleButton from '@/components/patient/ScheduleButton'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import TrustBar from '@/components/patient/TrustBar'
import { pageMetadata } from '@/lib/page-metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return pageMetadata({
    path: '/about',
    locale,
    title: t('title'),
    description: t('subtitle'),
    image: '/images/team/kashif-mazhar.jpg',
  })
}

const TEAM = [
  { slug: 'kevin', photo: '/images/team/kevin-monty.jpg', name: 'Kevin Monty', bioKey: 'kevinBio', titleKey: 'kevinTitle' },
  { slug: 'josh', photo: '/images/team/josh-pelger.jpg', name: 'Josh Pelger', bioKey: 'joshBio', titleKey: 'joshTitle' },
  { slug: 'eric', photo: '/images/team/eric-honsberger.jpg', name: 'Eric Honsberger', bioKey: 'ericBio', titleKey: 'ericTitle' },
] as const

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  const t = await getTranslations('about')
  const tTeam = await getTranslations('team')
  const tCta = await getTranslations('cta')
  const tHome = await getTranslations('home')

  const beliefs = [
    { title: t('belief1Title'), body: t('belief1Body') },
    { title: t('belief2Title'), body: t('belief2Body') },
    { title: t('belief3Title'), body: t('belief3Body') },
    { title: t('belief4Title'), body: t('belief4Body') },
  ]

  return (
    <>
      <EditorialHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        body={t('subtitle')}
        imageSrc="/images/team/kashif-mazhar.jpg"
        imageAlt="Dr. Kashif Mazhar, founder of ExcelENT"
        ctaPrimary={<ScheduleButton size="lg">{tCta('schedule')}</ScheduleButton>}
      />

      <section aria-labelledby="mission-heading" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 id="mission-heading" className="heading-1-patient text-balance">
                {t('missionTitle')}
              </h2>
            </div>
            <div className="lg:col-span-8 prose-patient">
              <p className="lead-paragraph">{t('mission1')}</p>
              <p>{t('mission2')}</p>
              <p>{t('mission3')}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="beliefs-heading" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl mb-14 md:mb-16">
            <h2 id="beliefs-heading" className="heading-1-patient text-balance mb-5">
              {t('beliefsTitle')}
            </h2>
            <p className="body-lead-patient text-ink-secondary">{t('beliefsSubtitle')}</p>
          </div>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-14">
            {beliefs.map((b) => (
              <li key={b.title} className="flex flex-col gap-3">
                <h3 className="heading-3-patient text-balance">{b.title}</h3>
                <p className="body-patient text-ink-secondary">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TrustBar
        title={t('statsTitle')}
        stats={[
          { number: tHome('stat1Number'), label: tHome('stat1Label') },
          { number: tHome('stat2Number'), label: tHome('stat2Label') },
          { number: tHome('stat3Number'), label: tHome('stat3Label') },
          { number: tHome('stat4Number'), label: tHome('stat4Label') },
        ]}
      />

      <section aria-labelledby="founder-heading" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div
                className="relative w-full overflow-hidden bg-surface-subtle"
                style={{
                  aspectRatio: 'var(--photo-aspect-portrait)',
                  borderRadius: 'var(--radius-image-hero)',
                }}
              >
                <Image
                  src="/images/team/kashif-mazhar.jpg"
                  alt="Dr. Kashif Mazhar"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7 lg:pt-4 flex flex-col gap-5">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)]">
                {t('founderEyebrow')}
              </p>
              <h2 id="founder-heading" className="heading-1-patient text-balance">
                Dr. Kashif Mazhar
              </h2>
              <p className="byline-meta text-[color:var(--color-accent-primary)]">
                {tTeam('kashifTitle')}
              </p>
              <p className="body-lead-patient text-ink-secondary text-pretty">
                {tTeam('kashifBio')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl mb-14 md:mb-16">
            <h2 id="team-heading" className="heading-1-patient text-balance mb-5">
              {t('teamTitle')}
            </h2>
            <p className="body-lead-patient text-ink-secondary">{t('teamBody')}</p>
          </div>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {TEAM.map((member) => (
              <li key={member.slug} className="flex flex-col gap-4">
                <div
                  className="relative w-full overflow-hidden bg-surface"
                  style={{
                    aspectRatio: 'var(--photo-aspect-square)',
                    borderRadius: 'var(--radius-image)',
                  }}
                >
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="heading-3-patient">{member.name}</h3>
                  <p className="byline-meta text-[color:var(--color-accent-primary)]">
                    {tTeam(member.titleKey)}
                  </p>
                </div>
                <p className="body-patient text-ink-secondary mt-1">{tTeam(member.bioKey)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ScheduleCTABreakout title={tHome('ctaBlockTitle')} body={tHome('ctaBlockBody')} />
    </>
  )
}
