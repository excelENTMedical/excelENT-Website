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

      {/* Find A Local Sinus Specialist CTA */}
      <div className="bg-white py-10 text-center">
        <Link href="/find-specialist" className="btn-secondary px-10 py-3.5">
          Find A Local Sinus Specialist
        </Link>
      </div>

      {/* The excelENT Difference Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block px-5 py-2 bg-primary-700 text-white text-sm font-semibold rounded-full mb-8">
              The excelENT Difference
            </div>
            <p className="text-gray-700 text-xl leading-relaxed mb-8">
              Discover how the excelENT process connects you with the right specialists and solutions to help you live free from sinus issues.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Over 38 million Americans suffer from chronic sinusitis, a condition that results in nasal congestion, swelling, infection and headaches. Only 5% of individuals experiencing sinusitis receive the medical care they need. excelENT&apos;s streamlined process connects patients to a sinus specialist who can diagnose the root cause of the symptoms and potentially recommend a simple 20-minute in-office treatment procedure.
            </p>
          </div>
        </div>
      </section>

      {/* Two CTA Cards */}
      <section className="pb-16 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary-700 to-primary-800 text-white p-10 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Be Seen Within 5 Business Days</h3>
              <Link href="/connect" className="inline-flex items-center text-sm font-semibold bg-navy text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors">
                Learn More
              </Link>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-accent-500 to-accent-600 text-white p-10 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">A Simple 20 Min In-Office Procedure</h3>
              <Link href="/sinus-education" className="inline-flex items-center text-sm font-semibold bg-navy text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Specialized Relief */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy mb-6">
            Discover Specialized Relief From Stubborn Sinus Issues
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-10">
            Discover how the excelENT process connects you with the right specialists and solutions to help you live free from sinus issues
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

      {/* Find A Local Sinus Specialist CTA */}
      <div className="bg-white pb-16 text-center">
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
