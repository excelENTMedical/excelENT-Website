import { unstable_setRequestLocale } from 'next-intl/server'
import Hero from '@/components/Hero'
import StatsSection from '@/components/StatsSection'
import ThreeStepProcess from '@/components/ThreeStepProcess'
import FAQ from '@/components/FAQ'
import VideoEmbed from '@/components/VideoEmbed'
import { Link } from '@/i18n/routing'
import { getFAQs } from '@/lib/payload'
import { richTextToPlainText } from '@/components/RichText'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  // Fetch from Payload CMS
  const cmsFaqs = await getFAQs(locale).catch(() => [])

  // Map CMS FAQs to FAQ component format
  const faqItems = cmsFaqs.length > 0
    ? cmsFaqs.map((faq: Record<string, unknown>) => ({
        id: String(faq.id),
        question: faq.question as string,
        answer: typeof faq.answer === 'string'
          ? faq.answer
          : richTextToPlainText(faq.answer as unknown as Parameters<typeof richTextToPlainText>[0]),
      }))
    : undefined

  return (
    <>
      <Hero />

      <StatsSection />

      {/* The excelENT Difference — 4 Column Icon Cards */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy text-center mb-6">
            The excel<span className="text-primary-700">ENT</span> Difference
          </h2>
          <p className="text-gray-600 text-lg text-center max-w-3xl mx-auto mb-14">
            Discover how the excelENT process connects you with the right specialists and solutions to help you live free from sinus issues.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Network */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-10 h-10 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-navy mb-3">Specialist Network</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                We connect you with top-rated local ENT specialists who specialize in minimally invasive sinus treatments.
              </p>
            </div>

            {/* Card 2: Fast Access */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
                <svg className="w-10 h-10 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-navy mb-3">Seen Within 5 Days</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Our streamlined process gets you in front of a specialist quickly — no months-long waits for relief.
              </p>
            </div>

            {/* Card 3: Simple Procedure */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                <svg className="w-10 h-10 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-navy mb-3">20-Minute Procedure</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Balloon sinuplasty is a simple, in-office procedure that takes about 20 minutes with minimal recovery time.
              </p>
            </div>

            {/* Card 4: Insurance */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-navy mb-3">97% Insurance Approved</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Most major insurance plans cover balloon sinuplasty. Our team helps verify your coverage before your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Specialized Relief */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy mb-6">
            Discover Specialized Relief From Stubborn Sinus Issues
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-10">
            Over 38 million Americans suffer from chronic sinusitis. Only 5% receive the care they need. excelENT&apos;s streamlined process connects you to a specialist who can diagnose the root cause and recommend a simple in-office treatment.
          </p>
          <Link href="/find-specialist" className="btn-secondary px-10 py-3.5">
            Find A Local Sinus Specialist
          </Link>
        </div>
      </section>

      {/* Three Step Process */}
      <ThreeStepProcess />

      {/* Video Testimonial Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy mb-6">
            You BREATHE Better. You LIVE Better.
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Learn more about Audrey&apos;s journey from debilitating sinusitis to freedom from pain and congestion.
          </p>
          <div className="max-w-3xl mx-auto">
            <VideoEmbed
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              title="Patient Success Story - Audrey's Journey"
            />
          </div>
        </div>
      </section>

      {/* CTA before FAQ */}
      <div className="bg-white pb-8 text-center">
        <Link href="/find-specialist" className="btn-secondary px-10 py-3.5">
          Find A Local Sinus Specialist
        </Link>
      </div>

      {/* FAQ Section - Two Column */}
      <FAQ faqs={faqItems} />

      {/* Disclaimer */}
      <div className="bg-gray-50 py-6">
        <div className="container-custom">
          <p className="text-xs text-gray-400 leading-relaxed max-w-5xl mx-auto">
            {'1. Procedures like sinus lift, Cadre Dr. Med, Rhinitis ET, SINUSITIS, image culture with computed tomography provide a large database of standardized balloon sinusitis treatment statistics, and procedures. 53% (95%CI 8.02 to 10.7) reported feeling MUCH or MUCH better. 2. Acclarent, Inc. Reimbursement Guide Fact Sheet Q2 Network, COVID-2, & BMP Regulatory Scraps Clinical Assessment: majority of patients continue to experience procedures for <200 patients and 154 Clinical Journals. 24005 Dual-Purpose PC and 3. Randomization Control Protocol (RCP), Third Series.'}
          </p>
        </div>
      </div>
    </>
  )
}
