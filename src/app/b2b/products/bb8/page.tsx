import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import Stat from '@/components/b2b/Stat'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'BB8 Balloon — One Device, Five Functions | excelENT',
  description:
    'The BB8 Balloon performs the function of five devices in one — light-guided navigation, tactile feedback, malleable tip, suction, and irrigation.',
}

const functions: Array<{ title: string; description: string }> = [
  {
    title: 'Light-guided navigation',
    description:
      'Visible illumination through the sinus tract for accurate, in-office placement without relying on external imaging.',
  },
  {
    title: 'No navigation requirements',
    description:
      'Works without a CT-guided navigation system in the room. Cleaner workflow, fewer dependencies, no scheduling around shared equipment.',
  },
  {
    title: 'Navigation compatible',
    description:
      'When you do want to use CT-guided navigation, BB8 plays cleanly with major nav systems.',
  },
  {
    title: 'Tactile feedback',
    description:
      'Real-time haptic feedback during placement — the surgeon feels the anatomy, not just the screen.',
  },
  {
    title: 'Malleable tip',
    description:
      'Shapeable to the patient anatomy in the moment, reducing the need for multiple instrument exchanges.',
  },
  {
    title: 'Integrated suction & irrigation',
    description:
      'Suction and irrigation built into the same device — reduces instrument count, room turnover, and time on case.',
  },
]

const performance: Array<{ value: string; label: string; caption?: string }> = [
  {
    value: '750+',
    label: 'Patients operated',
    caption: 'Across multiple partner ENT practices and markets.',
  },
  {
    value: '3,000+',
    label: 'Sinuses addressed',
    caption: 'Average ~4 sinuses per patient procedure.',
  },
  {
    value: '100%',
    label: 'Surgical success rate',
    caption: 'Sinus access and dilation achieved in every recorded case.',
  },
  {
    value: '0%',
    label: 'Intra/post-op complication rate',
    caption: 'No recorded intra-operative or post-operative complications.',
  },
]

const support: Array<{ title: string; description: string }> = [
  {
    title: 'Live trials in your office',
    description:
      'Our sales team performs live trials on-site so you can evaluate BB8 in the actual workflow it would replace.',
  },
  {
    title: 'Anesthesia protocol training',
    description:
      'We provide anesthesia tips, ICD-10 coding context, and procedural anatomy training to your team during onboarding.',
  },
  {
    title: 'Pre-op, intra-op, and post-op flow review',
    description:
      'We walk through the full procedural workflow with your team to identify friction and align on best practice.',
  },
  {
    title: 'Ongoing provider training',
    description:
      'New staff onboarding, refresher sessions, and continuing-education touchpoints. Your reps stay engaged after the sale.',
  },
]

export default function BB8Page() {
  return (
    <>
      <PageHero
        eyebrow="BB8 Balloon"
        title="One device. Five functions. 100% surgical success."
        description="Built for in-office balloon sinuplasty by ENT surgeons who do the procedure themselves. BB8 collapses five tools into one — no navigation system required, malleable to the patient's anatomy, with integrated suction and irrigation."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/b2b/request-demo" className="btn-b2b-primary">
            Request a Demo
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

      {/* Product image placeholder slot */}
      <section
        aria-label="BB8 product visual"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="border border-dashed border-edge-strong bg-surface aspect-[16/9] flex items-center justify-center">
            <div className="text-center px-6">
              <p className="eyebrow mb-2 text-ink-tertiary">Asset placeholder</p>
              <p className="font-display text-lg md:text-xl text-ink-secondary">
                BB8 5-functions-in-1 diagram
              </p>
              <p className="text-sm text-ink-tertiary mt-2 max-w-md mx-auto">
                Replace with /public/images/products/bb8-5-in-1.svg (or .png)
                when the diagram lands.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="functions-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="accent">5 functions, 1 device</EyebrowTag>
            <h2
              id="functions-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              Each function pulled from a tool you&rsquo;d otherwise carry separately.
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {functions.map((f, i) => (
              <li key={f.title} className="flex flex-col gap-3">
                <span className="font-display font-bold text-sm tracking-widest text-[color:var(--color-accent-primary)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                  {f.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="performance-heading"
        className="bg-surface-alt border-b border-edge relative"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Clinical performance</EyebrowTag>
            <h2
              id="performance-heading"
              className="font-display font-bold tracking-tight leading-tight text-2xl md:text-3xl lg:text-4xl text-ink text-balance"
            >
              The metrics behind 750+ procedures.
            </h2>
          </div>
          <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {performance.map((p) => (
              <li
                key={p.label}
                className="border-l-2 border-[color:var(--color-accent-primary)] pl-5"
              >
                <Stat
                  value={p.value}
                  label={p.label}
                  caption={p.caption}
                  size="lg"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="support-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="default">Sales support</EyebrowTag>
              <h2
                id="support-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Our team trains your team.
              </h2>
              <p className="body-lead mt-2">
                We don&rsquo;t just ship a device. Our reps come on-site to
                educate, run live trials, and stay engaged after the sale.
              </p>
            </div>
            <ul role="list" className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {support.map((s) => (
                <li key={s.title} className="flex flex-col gap-3 border-l-2 border-edge pl-5">
                  <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                    {s.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
