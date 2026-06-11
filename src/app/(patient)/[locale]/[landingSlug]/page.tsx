import Image from 'next/image'
import { notFound } from 'next/navigation'
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import EditorialHero from '@/components/patient/EditorialHero'
import ScheduleButton from '@/components/patient/ScheduleButton'
import TrustBar from '@/components/patient/TrustBar'
import StepCard from '@/components/patient/StepCard'
import FAQAccordionPatient from '@/components/patient/FAQAccordionPatient'
import ScheduleCTABreakout from '@/components/patient/ScheduleCTABreakout'
import VimeoEmbed from '@/components/patient/VimeoEmbed'
import { getLandingPageBySlug } from '@/lib/payload'
import { LOCATIONS, type CityEntry, type StateEntry } from '@/content/locations'
import StructuredData from '@/components/StructuredData'
import {
  localBusinessSchema,
  faqPageSchema,
  breadcrumbSchema,
} from '@/lib/structured-data'
import { pageMetadata } from '@/lib/page-metadata'
import {
  heroHeadline,
  heroSubhead,
  getSymptoms,
  valueProps,
  localTrustTitle,
  localTrustParagraphs,
  treatmentSectionTitle,
  treatmentSectionParagraphs,
  symptomsSectionTitle,
  symptomsSectionParagraphs,
  localFaqs,
  ctaTitle,
  ctaBody,
} from '@/content/city-seo-template'

interface Props {
  params: Promise<{ locale: string; landingSlug: string }>
}

interface LandingDoc {
  slug: string
  locationName: string
  heroHeadline: string
  heroSubheadline?: string | null
  heroImage?: { url?: string | null; alt?: string | null } | string | null
  localPhone: string
  faqs?: unknown[] | null
  testimonial?: { quote?: string | null; patientName?: string | null } | null
  stats?: {
    patientsHelped?: string | null
    successRate?: string | null
    yearsExperience?: string | null
    specialistsCount?: string | null
  } | null
  threeSteps?: {
    step1Title?: string | null
    step1Description?: string | null
    step2Title?: string | null
    step2Description?: string | null
    step3Title?: string | null
    step3Description?: string | null
  } | null
  status?: string | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
  } | null
}

interface ResolvedCity {
  city: CityEntry
  state: StateEntry
  nearby: { city: CityEntry; state: StateEntry }[]
}

function findCityBySlug(slug: string): ResolvedCity | null {
  for (const state of LOCATIONS) {
    const city = state.cities.find((c) => c.slug === slug)
    if (city) {
      const nearby: { city: CityEntry; state: StateEntry }[] = []
      for (const s of LOCATIONS) {
        for (const c of s.cities) {
          if (c.slug !== slug) nearby.push({ city: c, state: s })
        }
      }
      return { city, state, nearby: nearby.slice(0, 4) }
    }
  }
  return null
}

export async function generateMetadata({ params }: Props) {
  const { locale, landingSlug } = await params
  const doc = (await getLandingPageBySlug(landingSlug, locale).catch(() => null)) as LandingDoc | null
  if (doc && doc.status === 'published') {
    return {
      title: doc.seo?.metaTitle ?? `Sinus relief in ${doc.locationName} | ExcelENT`,
      description: doc.seo?.metaDescription ?? doc.heroSubheadline ?? undefined,
    }
  }
  const fallback = findCityBySlug(landingSlug)
  if (fallback) {
    return pageMetadata({
      path: `/${fallback.city.slug}`,
      locale,
      title: `${fallback.city.city}, ${fallback.state.abbr} Sinus Relief`,
      description: `Looking for sinus relief in ${fallback.city.city}, ${fallback.state.abbr}? ExcelENT connects you with a local doctor who treats sinus problems every day. Schedule online — most appointments confirmed in under 24 hours.`,
      image: fallback.city.cityImage,
    })
  }
  return { title: 'ExcelENT' }
}

export function generateStaticParams() {
  return LOCATIONS.flatMap((s) => s.cities.map((c) => ({ landingSlug: c.slug })))
}

export default async function LandingPage({ params }: Props) {
  const { locale, landingSlug } = await params
  unstable_setRequestLocale(locale)

  const doc = (await getLandingPageBySlug(landingSlug, locale).catch(() => null)) as LandingDoc | null
  const cityRecord = findCityBySlug(landingSlug)

  if ((!doc || doc.status !== 'published') && !cityRecord) notFound()

  const tHome = await getTranslations('home')
  const tCta = await getTranslations('cta')

  const usingDoc = doc && doc.status === 'published'

  // PAYLOAD-BACKED PATH (custom landing page configured in Payload admin) ---
  if (usingDoc) {
    const locationName = doc!.locationName
    const headline = doc!.heroHeadline.replace(/\{location\}/g, locationName)
    const subhead = doc!.heroSubheadline ?? tHome('subhead')
    const heroSrc =
      (typeof doc!.heroImage === 'object' && doc!.heroImage?.url) ||
      (typeof doc!.heroImage === 'string' ? doc!.heroImage : null) ||
      '/images/hero-main.png'
    const stats = doc!.stats ?? {}
    const steps = doc!.threeSteps ?? {}
    const faqs = (doc!.faqs ?? []).filter(
      (f): f is { id: string | number; question: string; answer: string } =>
        typeof f === 'object' && f !== null && 'question' in f && 'answer' in f,
    )

    return (
      <>
        <EditorialHero
          eyebrow={`Sinus relief in ${locationName}`}
          title={headline}
          body={subhead}
          imageSrc={heroSrc}
          imageAlt={`Sinus relief in ${locationName}`}
          ctaPrimary={<ScheduleButton size="xl">{tCta('schedule')}</ScheduleButton>}
          ctaSecondary={
            <a
              href={`tel:${doc!.localPhone.replace(/[^0-9+]/g, '')}`}
              className="btn-patient-secondary btn-patient-xl"
            >
              {doc!.localPhone}
            </a>
          }
        />

        <TrustBar
          stats={[
            { number: stats.patientsHelped ?? tHome('stat1Number'), label: tHome('stat1Label') },
            { number: stats.successRate ?? tHome('stat2Number'), label: tHome('stat2Label') },
            { number: stats.yearsExperience ?? tHome('stat3Number'), label: tHome('stat3Label') },
            { number: tHome('stat4Number'), label: tHome('stat4Label') },
          ]}
        />

        {(steps.step1Title || steps.step2Title || steps.step3Title) && (
          <section aria-labelledby="landing-steps" className="bg-surface">
            <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
              <div className="max-w-3xl mb-14">
                <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                  {tHome('stepsEyebrow')}
                </p>
                <h2 id="landing-steps" className="heading-1-patient text-balance">
                  {tHome('stepsTitle')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
                {steps.step1Title && (
                  <StepCard
                    number={1}
                    title={steps.step1Title}
                    body={steps.step1Description ?? tHome('step1Body')}
                  />
                )}
                {steps.step2Title && (
                  <StepCard
                    number={2}
                    title={steps.step2Title}
                    body={steps.step2Description ?? tHome('step2Body')}
                  />
                )}
                {steps.step3Title && (
                  <StepCard
                    number={3}
                    title={steps.step3Title}
                    body={steps.step3Description ?? tHome('step3Body')}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {doc!.testimonial?.quote && (
          <section aria-label="Patient testimonial" className="bg-surface-subtle">
            <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
              <div className="max-w-3xl mx-auto text-center">
                <p className="pull-quote">{doc!.testimonial.quote}</p>
                {doc!.testimonial.patientName && (
                  <p className="byline mt-6">— {doc!.testimonial.patientName}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section aria-labelledby="landing-faq" className="bg-surface">
            <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                  <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                    {tHome('faqEyebrow')}
                  </p>
                  <h2 id="landing-faq" className="heading-1-patient text-balance">
                    {tHome('faqTitle')}
                  </h2>
                </div>
                <div className="lg:col-span-8">
                  <FAQAccordionPatient faqs={faqs} />
                </div>
              </div>
            </div>
          </section>
        )}

        <ScheduleCTABreakout title={tHome('ctaBlockTitle')} body={tHome('ctaBlockBody')} />
      </>
    )
  }

  // DEFAULT SEO LANDING PAGE (no Payload doc) ---
  const ctx = { city: cityRecord!.city, state: cityRecord!.state }
  const symptoms = getSymptoms()
  const locationName = `${ctx.city.city}, ${ctx.state.abbr}`
  const heroSrc = '/images/hero-main.png'
  const cityImageSrc = ctx.city.cityImage ?? '/images/hero-main.png'
  const props = valueProps(ctx)
  const trustParas = localTrustParagraphs(ctx)
  const treatParas = treatmentSectionParagraphs(ctx)
  const symptomSubsections = symptomsSectionParagraphs(ctx)
  const faqs = localFaqs(ctx).map((f, i) => ({ id: i, question: f.q, answer: f.a }))

  const cityFaqsRaw = localFaqs(ctx)
  const schemas = [
    localBusinessSchema({
      city: ctx.city.city,
      state: ctx.state.state,
      region: ctx.city.region,
      url: `/${ctx.city.slug}`,
      image: cityImageSrc,
    }),
    faqPageSchema(cityFaqsRaw.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbSchema([
      { name: 'Locations', path: '/find-a-specialist' },
      { name: locationName, path: `/${ctx.city.slug}` },
    ]),
  ]

  return (
    <>
      <StructuredData data={schemas} />
      {/* Symptom-driven hero with city in headline + symptoms list */}
      <section aria-label="Hero" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-7">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)]">
                Sinus relief in {locationName}
              </p>
              <h1 className="heading-display-patient text-balance">{heroHeadline(ctx)}</h1>
              <ul role="list" className="flex flex-wrap gap-2 mt-1">
                {symptoms.map((sym) => (
                  <li
                    key={sym}
                    className="px-4 py-2 rounded-full bg-[color:var(--color-accent-primary-subtle)] text-[color:var(--color-accent-primary)] text-sm md:text-base font-cabin font-medium"
                  >
                    {sym}
                  </li>
                ))}
              </ul>
              <p className="body-lead-patient text-pretty max-w-xl mt-2">{heroSubhead(ctx)}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <ScheduleButton size="xl">{tCta('schedule')}</ScheduleButton>
                <Link href="/sinusitis" className="btn-patient-secondary btn-patient-xl">
                  {tCta('learnMore')}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div
                className="relative w-full overflow-hidden bg-surface-subtle"
                style={{
                  aspectRatio: 'var(--photo-aspect-portrait)',
                  borderRadius: 'var(--radius-image-hero)',
                }}
              >
                <Image
                  src={heroSrc}
                  alt={`Sinus care in ${locationName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar
        stats={[
          { number: tHome('stat1Number'), label: tHome('stat1Label') },
          { number: tHome('stat2Number'), label: tHome('stat2Label') },
          { number: tHome('stat3Number'), label: tHome('stat3Label') },
          { number: tHome('stat4Number'), label: tHome('stat4Label') },
        ]}
      />

      <section aria-labelledby="value-props" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-3xl mb-14">
            <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
              How it works
            </p>
            <h2 id="value-props" className="heading-1-patient text-balance">
              Sinus care, simplified for {ctx.city.city}.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {props.map((p, i) => (
              <StepCard key={p.title} number={i + 1} title={p.title} body={p.body} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="patient-story" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                In our patients&apos; words
              </p>
              <h2 id="patient-story" className="heading-1-patient text-balance">
                Hear from someone who&apos;s been there.
              </h2>
              <p className="body-lead-patient text-ink-secondary mt-5">
                A short patient story about life on the other side of chronic sinus problems.
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

      <section aria-labelledby="local-trust" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-6">
              <h2 id="local-trust" className="heading-1-patient text-balance mb-6">
                {localTrustTitle(ctx)}
              </h2>
              <div className="prose-patient">
                {trustParas.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <ScheduleButton size="lg">{tCta('schedule')}</ScheduleButton>
              </div>
            </div>
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div
                className="relative w-full overflow-hidden bg-surface-subtle"
                style={{
                  aspectRatio: 'var(--photo-aspect-landscape)',
                  borderRadius: 'var(--radius-card-editorial)',
                }}
              >
                <Image
                  src={cityImageSrc}
                  alt={`${ctx.city.city}, ${ctx.state.abbr}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="treatment-section" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <h2 id="treatment-section" className="heading-1-patient text-balance">
                {treatmentSectionTitle(ctx)}
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="prose-patient max-w-none">
                {treatParas.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="symptoms-section" className="bg-surface">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <h2 id="symptoms-section" className="heading-1-patient text-balance">
                {symptomsSectionTitle(ctx)}
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="prose-patient max-w-none">
                {symptomSubsections.map((sub, i) => (
                  <div key={i}>
                    {sub.heading && <h3>{sub.heading}</h3>}
                    <p>{sub.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="local-faq" className="bg-surface-subtle">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="eyebrow-patient text-[color:var(--color-accent-primary)] mb-4">
                Common questions in {ctx.city.city}
              </p>
              <h2 id="local-faq" className="heading-1-patient text-balance">
                What {ctx.city.city} patients ask first.
              </h2>
            </div>
            <div className="lg:col-span-8">
              <FAQAccordionPatient faqs={faqs} />
            </div>
          </div>
        </div>
      </section>

      {cityRecord!.nearby.length > 0 && (
        <section aria-labelledby="nearby-heading" className="bg-surface">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 id="nearby-heading" className="heading-2-patient text-balance mb-8">
              Other locations we serve
            </h2>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cityRecord!.nearby.map((n) => (
                <li key={n.city.slug}>
                  <Link
                    href={`/${n.city.slug}` as `/${string}`}
                    className="group block p-5 bg-surface border border-edge hover:border-[color:var(--color-accent-primary)] transition-colors"
                    style={{ borderRadius: 'var(--radius-card)' }}
                  >
                    <span className="font-cabin text-base font-semibold text-ink group-hover:text-[color:var(--color-accent-primary)]">
                      {n.city.city}, {n.state.abbr}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ScheduleCTABreakout title={ctaTitle(ctx)} body={ctaBody(ctx)} />
    </>
  )
}
