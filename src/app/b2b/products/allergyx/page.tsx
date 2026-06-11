import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'AllergyX Nasal Rinse Kit — excelENT',
  description:
    'A patient-friendly nasal irrigation system for pre- and post-procedure care. Designed for compliance, supports better surgical outcomes.',
}

const features: Array<{ title: string; description: string }> = [
  {
    title: 'Designed Around Patient Compliance',
    description:
      'Easy enough that patients actually use it at home. Most nasal rinse failures are compliance failures — we engineered for the bathroom counter, not the lab.',
  },
  {
    title: 'Supports Better Surgical Outcomes',
    description:
      'Pre-procedure preparation and post-procedure recovery both benefit from consistent irrigation. Cleaner anatomy, clearer healing.',
  },
  {
    title: 'Approved Device',
    description:
      'FDA-approved, in stock, and available through the same ordering relationship as the rest of the excelENT portfolio.',
  },
  {
    title: 'Patient Education Built-In',
    description:
      "Ships with patient-facing instructional content so your front desk doesn't have to teach the kit during a turnover slot.",
  },
]

export default function AllergyXPage() {
  return (
    <>
      {/* Hero — text left, product image right */}
      <section
        aria-labelledby="allergyx-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">AllergyX Rinse Kit</EyebrowTag>
              <h1
                id="allergyx-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Pre and post-procedure nasal care, built for the patient.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                A nasal irrigation system designed for the part of the workflow
                that happens at home. Easy enough that patients actually use it
                — pre-op preparation, post-op recovery, and ongoing maintenance
                for chronic sinus and allergy patients.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Talk to sales
                </Link>
                <Link
                  href="/b2b/products"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  <ArrowRight className="rotate-180" />
                  All Products
                </Link>
              </div>
            </div>

            <aside aria-label="AllergyX rinse kit" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-surface p-6 md:p-8">
                <Image
                  src="/images/products/allergyx.webp"
                  alt="AllergyX nasal rinse kit — patient-friendly irrigation bottle with water splash"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain p-4"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Why AllergyX — purple left borders */}
      <section
        aria-labelledby="features-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Why AllergyX</EyebrowTag>
            <h2
              id="features-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              The difference between &ldquo;prescribed&rdquo; and &ldquo;actually used.&rdquo;
            </h2>
          </div>
          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
          >
            {features.map((f) => (
              <li
                key={f.title}
                className="flex flex-col gap-3 border-l-4 border-[color:var(--color-accent-primary)] pl-5"
              >
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
