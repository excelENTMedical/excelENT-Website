import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'AllergyX Nasal Rinse Kit — excelENT',
  description:
    'A patient-friendly nasal irrigation system for pre- and post-procedure care. Designed for compliance, supports better surgical outcomes.',
}

const features: Array<{ title: string; description: string }> = [
  {
    title: 'Designed around patient compliance',
    description:
      'Easy enough that patients actually use it at home. Most nasal rinse failures are compliance failures — we engineered for the bathroom counter, not the lab.',
  },
  {
    title: 'Supports better surgical outcomes',
    description:
      'Pre-procedure preparation and post-procedure recovery both benefit from consistent irrigation. Cleaner anatomy, clearer healing.',
  },
  {
    title: 'Approved device',
    description:
      'FDA-approved, in stock, and available through the same ordering relationship as the rest of the excelENT portfolio.',
  },
  {
    title: 'Patient education built-in',
    description:
      'Ships with patient-facing instructional content so your front desk doesn\'t have to teach the kit during a turnover slot.',
  },
]

export default function AllergyXPage() {
  return (
    <>
      <PageHero
        eyebrow="AllergyX Rinse Kit"
        title="Pre and post-procedure nasal care, built for the patient."
        description="A nasal irrigation system designed for the part of the workflow that happens at home. Easy enough that patients actually use it — pre-op preparation, post-op recovery, and ongoing maintenance for chronic sinus and allergy patients."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/b2b/request-demo" className="btn-b2b-primary">
            Talk to sales
          </Link>
          <Link
            href="/b2b/products"
            className="text-sm font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
          >
            <ArrowRight className="rotate-180" />
            All Products
          </Link>
        </div>
      </PageHero>

      <section
        aria-labelledby="features-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Why AllergyX</EyebrowTag>
            <h2
              id="features-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              The difference between &ldquo;prescribed&rdquo; and &ldquo;actually used.&rdquo;
            </h2>
          </div>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {features.map((f) => (
              <li key={f.title} className="flex flex-col gap-3 border-l-2 border-[color:var(--color-accent-primary)] pl-5">
                <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                  {f.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {f.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
