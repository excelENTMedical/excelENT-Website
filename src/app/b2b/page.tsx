import HeroB2B from '@/components/b2b/HeroB2B'
import ProofMetricStrip from '@/components/b2b/ProofMetricStrip'
import ProblemFramingGrid from '@/components/b2b/ProblemFramingGrid'
import ThreePillarsSection from '@/components/b2b/ThreePillarsSection'
import PlatformOverviewSection from '@/components/b2b/PlatformOverviewSection'
import SolutionTile from '@/components/b2b/SolutionTile'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import CustomerLogoStrip from '@/components/b2b/CustomerLogoStrip'
import CaseStudyBlock from '@/components/b2b/CaseStudyBlock'
import WhyExcelentTeaser from '@/components/b2b/WhyExcelentTeaser'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export default function B2BHomePage() {
  return (
    <>
      <HeroB2B />
      <ProofMetricStrip />
      <ProblemFramingGrid />
      <ThreePillarsSection />
      <PlatformOverviewSection />

      <section
        aria-labelledby="solutions-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="accent">Practice Solutions</EyebrowTag>
            <h2
              id="solutions-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              The full operations stack for independent ENT practices.
            </h2>
            <p className="body-lead max-w-2xl mt-2">
              Three connected products that drive patients in, handle the
              calls, and recover the revenue. Use one or use all three.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <SolutionTile
              productLabel="PS | Connect"
              title="Patient Prospecting and Growth"
              description="We bring in qualified sinus patients and route them to your practice — fast access, real-time insurance verification, 48-hour appointments."
              bullets={[
                'Real-time insurance verification',
                'Location- and demographic-matched routing',
                'Referring-physician partnership strategies',
              ]}
              href="/b2b/solutions/connect"
            />
            <SolutionTile
              productLabel="PS | Lexi"
              title="Virtual Office Assistant"
              description="An ENT-specific AI assistant that answers calls, schedules appointments, and verifies insurance — HIPAA-compliant, EMR-integrated."
              bullets={[
                'After-hours and overflow call answering',
                'EMR scheduling integration',
                'BAA-backed HIPAA infrastructure',
              ]}
              href="/b2b/solutions/lexi"
            />
            <SolutionTile
              productLabel="PS | RCM"
              title="Revenue Cycle Management"
              description="Reduce denial rates from the 11.8% industry baseline to 2.5%. For ENT, by ENT billing experts — recover revenue and stabilize cash flow."
              bullets={[
                'Denial-rate diagnostic on day one',
                'ENT-specific coding and audit-trail',
                'Cash-flow improvement, not just collections',
              ]}
              href="/b2b/solutions/rcm"
            />
          </div>
        </div>
      </section>

      <CustomerLogoStrip />
      <CaseStudyBlock />
      <WhyExcelentTeaser />
      <InlineDemoCTA />
    </>
  )
}
