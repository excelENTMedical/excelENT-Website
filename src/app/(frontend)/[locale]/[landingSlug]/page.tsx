import { notFound } from 'next/navigation'
import { unstable_setRequestLocale } from 'next-intl/server'
import Hero from '@/components/Hero'
import StatsSection from '@/components/StatsSection'
import ThreeStepProcess from '@/components/ThreeStepProcess'
import FAQ from '@/components/FAQ'
import SpecialistCard from '@/components/SpecialistCard'
import QualificationQuiz from '@/components/QualificationQuiz'
import VideoEmbed from '@/components/VideoEmbed'
import TrackingPixels from '@/components/TrackingPixels'
import { Link } from '@/i18n/routing'
import { getLandingPageBySlug, getPayloadClient } from '@/lib/payload'
import { richTextToPlainText } from '@/components/RichText'

interface LandingPageProps {
  params: Promise<{ locale: string; landingSlug: string }>
}

// Fallback landing pages
const fallbackLandingPages: Record<string, {
  locationName: string
  heroHeadline: string
  heroSubheadline: string
  localPhone: string
  specialists: Array<{
    name: string
    credentials: string
    practiceName: string
    phone: string
    address: { city: string; state: string }
    specialties: string[]
    hubspotFormId?: string
  }>
  faqs: Array<{ id: string; question: string; answer: string }>
  stats: { patientsHelped: string; successRate: string; symptomImprovement: string; insuranceApproval: string }
  tracking?: { googleAnalyticsId?: string; facebookPixelId?: string; excelVoiceId?: string }
}> = {
  'savannah-ga-sinusitis-specialist': {
    locationName: 'Savannah',
    heroHeadline: 'Savannah, Find Relief from Chronic Sinusitis',
    heroSubheadline: 'Our board-certified specialists in Savannah offer balloon sinuplasty - get back to enjoying the coastal life without sinus problems.',
    localPhone: '(912) 597-2878',
    specialists: [
      { name: 'Coastal Ear, Nose & Throat', credentials: '', practiceName: 'Coastal Ear, Nose & Throat', phone: '(912) 597-2878', address: { city: 'Savannah', state: 'GA' }, specialties: ['Balloon Sinuplasty', 'Sinus Surgery'] },
    ],
    faqs: [
      { id: '1', question: 'What is Sinusitis?', answer: 'Sinusitis is an inflammation or swelling of the tissue lining the sinuses. Chronic sinusitis lasts 12 weeks or longer and affects nearly 30 million Americans each year.' },
      { id: '2', question: 'Can Sinusitis Be Treated?', answer: 'Yes! Balloon sinuplasty is an FDA-approved, in-office procedure with a 97% success rate. Most patients return to normal activities within 24-48 hours.' },
    ],
    stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
  },
  'tyler-tx-sinus-treatment': {
    locationName: 'Tyler',
    heroHeadline: 'Hey Tyler, Are You Sick and Tired of Sinus Problems?',
    heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our East Texas specialists are ready to help.',
    localPhone: '(430) 209-5700',
    specialists: [
      { name: 'East Texas Sinus Center', credentials: '', practiceName: 'East Texas Sinus & Dizziness Center', phone: '(430) 209-5700', address: { city: 'Tyler', state: 'TX' }, specialties: ['Chronic Sinusitis', 'Balloon Sinuplasty'] },
    ],
    faqs: [
      { id: '1', question: 'What is Sinusitis?', answer: 'Sinusitis is an inflammation or swelling of the tissue lining the sinuses. Chronic sinusitis lasts 12 weeks or longer.' },
      { id: '2', question: 'Is balloon sinuplasty covered by insurance?', answer: 'Yes, balloon sinuplasty is FDA-approved and covered by most major insurance plans, including Medicare. We have a 97% insurance approval rate.' },
    ],
    stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
  },
  'florence-sc-sinusitis-specialists': {
    locationName: 'Florence',
    heroHeadline: 'Florence, SC - Your Solution for Sinus Relief',
    heroSubheadline: 'Stop suffering from sinus problems. Our Florence specialists offer quick, in-office balloon sinuplasty treatment.',
    localPhone: '(843) 942-1274',
    specialists: [
      { name: 'Florence ENT', credentials: '', practiceName: 'Florence ENT & Facial Plastic Surgery', phone: '(843) 942-1274', address: { city: 'Florence', state: 'SC' }, specialties: ['Balloon Sinuplasty', 'Facial Plastic Surgery'] },
    ],
    faqs: [
      { id: '1', question: 'Can Sinusitis Be Treated?', answer: 'Yes! Balloon sinuplasty is an FDA-approved, in-office procedure with a 97% success rate and 95% symptom improvement.' },
    ],
    stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
  },
  'raleigh-nc-sinus-treatment': {
    locationName: 'Raleigh',
    heroHeadline: 'Hey Raleigh, Are You Sick and Tired of Sinus Problems?',
    heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our Raleigh-area specialists are ready to help.',
    localPhone: '(984) 464-3984',
    specialists: [
      { name: 'Triangle Sinus Center', credentials: '', practiceName: 'Triangle Sinus Center', phone: '(984) 464-3984', address: { city: 'Raleigh', state: 'NC' }, specialties: ['Sinus Surgery', 'Balloon Sinuplasty'] },
    ],
    faqs: [
      { id: '1', question: 'What is Sinusitis?', answer: 'Sinusitis is an inflammation or swelling of the tissue lining the sinuses. Chronic sinusitis lasts 12 weeks or longer.' },
      { id: '2', question: 'How long is the recovery?', answer: 'Most patients return to normal activities within 24-48 hours after the procedure.' },
      { id: '3', question: 'Is balloon sinuplasty covered by insurance?', answer: 'Yes, balloon sinuplasty is FDA-approved and covered by most major insurance plans, including Medicare.' },
    ],
    stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
    tracking: { googleAnalyticsId: 'G-XXXXXXXXXX', facebookPixelId: '1234567890' },
  },
  'sarasota-fl-sinus-specialists': {
    locationName: 'Sarasota',
    heroHeadline: 'Sarasota, FL - Breathe Easy Again',
    heroSubheadline: 'Our Sarasota specialists help you get back to enjoying paradise without sinus problems. Quick, in-office treatment available.',
    localPhone: '(941) 205-9444',
    specialists: [
      { name: 'Island ENT', credentials: '', practiceName: 'Island ENT', phone: '(941) 205-9444', address: { city: 'Sarasota', state: 'FL' }, specialties: ['Balloon Sinuplasty', 'Sleep Apnea'] },
    ],
    faqs: [
      { id: '1', question: 'What is Sinusitis?', answer: 'Sinusitis is an inflammation or swelling of the tissue lining the sinuses. Chronic sinusitis lasts 12 weeks or longer.' },
    ],
    stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
  },
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale, landingSlug } = await params
  unstable_setRequestLocale(locale)

  const cmsPage = await getLandingPageBySlug(landingSlug, locale).catch(() => null)

  if (cmsPage) {
    // Map CMS specialists (populated via depth:2) to SpecialistCard props
    const specialists = Array.isArray(cmsPage.specialists)
      ? (cmsPage.specialists as Array<Record<string, unknown>>)
          .filter((s) => typeof s === 'object' && s !== null && 'name' in s)
          .map((s) => ({
            name: s.name as string,
            credentials: (s.credentials as string) || undefined,
            practiceName: s.practiceName as string,
            phone: s.phone as string,
            address: s.address as { city: string; state: string } | undefined,
            specialties: Array.isArray(s.specialties)
              ? (s.specialties as Array<{ specialty: string }>).map((sp) => sp.specialty)
              : undefined,
            hubspotFormId: (s.hubspotFormId as string) || undefined,
          }))
      : []

    // Map CMS FAQs (populated via depth:2) to FAQ component format
    const faqs = Array.isArray(cmsPage.faqs)
      ? (cmsPage.faqs as Array<Record<string, unknown>>)
          .filter((f) => typeof f === 'object' && f !== null && 'question' in f)
          .map((f) => ({
            id: String(f.id),
            question: f.question as string,
            answer: typeof f.answer === 'string'
              ? f.answer
              : richTextToPlainText(f.answer as unknown as Parameters<typeof richTextToPlainText>[0]),
          }))
      : []

    // Map CMS testimonial (populated via depth:2)
    const testimonial = cmsPage.testimonial && typeof cmsPage.testimonial === 'object' && 'name' in (cmsPage.testimonial as Record<string, unknown>)
      ? (cmsPage.testimonial as Record<string, unknown>)
      : null

    const stats = cmsPage.stats as { patientsHelped?: string; successRate?: string; symptomImprovement?: string; insuranceApproval?: string } | undefined
    const tracking = cmsPage.tracking as { googleAnalyticsId?: string; facebookPixelId?: string; excelVoiceId?: string } | undefined
    const locationName = cmsPage.locationName as string
    const localPhone = cmsPage.localPhone as string

    return (
      <>
        {tracking && (
          <TrackingPixels
            googleAnalyticsId={tracking.googleAnalyticsId}
            facebookPixelId={tracking.facebookPixelId}
            excelVoiceId={tracking.excelVoiceId}
          />
        )}

        <Hero
          headline={cmsPage.heroHeadline as string}
          subheadline={cmsPage.heroSubheadline as string}
          showPhone={true}
          phoneNumber={localPhone}
          ctaLink="#specialists"
        />

        <StatsSection stats={stats} />

        <ThreeStepProcess />

        {/* Specialists */}
        <section id="specialists" className="section-padding bg-gray-50">
          <div className="container-custom">
            <h2 className="heading-2 text-center text-gray-900 mb-4">
              Local Specialists in {locationName}
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our board-certified ENT specialists are ready to help you find relief from chronic sinus problems.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {specialists.map((specialist, index) => (
                <SpecialistCard key={index} {...specialist} showForm={true} />
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-gray-600 mb-4">Prefer to call?</p>
              <a
                href={`tel:${localPhone.replace(/\D/g, '')}`}
                className="inline-flex items-center text-2xl font-bold text-primary-600 hover:text-primary-700"
              >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {localPhone}
              </a>
            </div>
          </div>
        </section>

        <FAQ
          faqs={faqs.length > 0 ? faqs : undefined}
          title="Frequently Asked Questions"
          subtitle="Get answers to common questions about balloon sinuplasty"
        />

        {/* Testimonial Video */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-2 text-center text-gray-900 mb-4">
                Hear From Our Patients
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Real stories from real patients who found relief
              </p>
              <VideoEmbed
                url={testimonial?.videoUrl as string || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                title={testimonial?.name ? `${testimonial.name as string}'s Story` : 'Patient Success Story'}
              />
            </div>
          </div>
        </section>

        {/* Qualification Quiz */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <h2 className="heading-2 text-center text-gray-900 mb-4">Do You Qualify?</h2>
              <p className="text-center text-gray-600 mb-10">
                Answer a few quick questions to see if you may be a candidate for balloon sinuplasty
              </p>
              <QualificationQuiz />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-primary-700">
          <div className="container-custom text-center">
            <h2 className="heading-2 text-white mb-6">
              Ready to Breathe Easier, {locationName}?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Take the first step towards sinus relief today. Our specialists are ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${localPhone.replace(/\D/g, '')}`} className="btn-accent text-lg px-8 py-4">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now: {localPhone}
              </a>
              <a href="#specialists" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">
                Schedule Online
              </a>
            </div>
          </div>
        </section>
      </>
    )
  }

  // Fallback to hardcoded landing pages
  const landingPage = fallbackLandingPages[landingSlug]
  if (!landingPage) {
    notFound()
  }

  return (
    <>
      {landingPage.tracking && (
        <TrackingPixels
          googleAnalyticsId={landingPage.tracking.googleAnalyticsId}
          facebookPixelId={landingPage.tracking.facebookPixelId}
          excelVoiceId={landingPage.tracking.excelVoiceId}
        />
      )}

      <Hero
        headline={landingPage.heroHeadline}
        subheadline={landingPage.heroSubheadline}
        showPhone={true}
        phoneNumber={landingPage.localPhone}
        ctaLink="#specialists"
      />

      <StatsSection stats={landingPage.stats} />
      <ThreeStepProcess />

      <section id="specialists" className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-4">
            Local Specialists in {landingPage.locationName}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our board-certified ENT specialists are ready to help you find relief from chronic sinus problems.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {landingPage.specialists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} showForm={true} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Prefer to call?</p>
            <a
              href={`tel:${landingPage.localPhone.replace(/\D/g, '')}`}
              className="inline-flex items-center text-2xl font-bold text-primary-600 hover:text-primary-700"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {landingPage.localPhone}
            </a>
          </div>
        </div>
      </section>

      <FAQ faqs={landingPage.faqs} title="Frequently Asked Questions" subtitle="Get answers to common questions about balloon sinuplasty" />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-2 text-center text-gray-900 mb-4">Hear From Our Patients</h2>
            <p className="text-center text-gray-600 mb-10">Real stories from real patients who found relief</p>
            <VideoEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Patient Success Story" />
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <h2 className="heading-2 text-center text-gray-900 mb-4">Do You Qualify?</h2>
            <p className="text-center text-gray-600 mb-10">
              Answer a few quick questions to see if you may be a candidate for balloon sinuplasty
            </p>
            <QualificationQuiz />
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-6">
            Ready to Breathe Easier, {landingPage.locationName}?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Take the first step towards sinus relief today. Our specialists are ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${landingPage.localPhone.replace(/\D/g, '')}`} className="btn-accent text-lg px-8 py-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now: {landingPage.localPhone}
            </a>
            <a href="#specialists" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">
              Schedule Online
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'landing-pages',
      where: { status: { equals: 'published' } },
      limit: 100,
    })
    if (result.docs.length > 0) {
      return result.docs.flatMap((page: Record<string, unknown>) => [
        { locale: 'en', landingSlug: page.slug as string },
        { locale: 'es', landingSlug: page.slug as string },
      ])
    }
  } catch {
    // Fall back to hardcoded slugs
  }
  return Object.keys(fallbackLandingPages).flatMap((slug) => [
    { locale: 'en', landingSlug: slug },
    { locale: 'es', landingSlug: slug },
  ])
}
