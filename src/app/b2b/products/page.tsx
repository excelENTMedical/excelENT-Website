import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'Products — excelENT Medical Device Portfolio',
  description:
    'FDA-approved medical devices designed for ENT practices: BB8 Balloon, Microdebrider Shaver Blades, AllergyX Rinse Kit, plus a growing R&D pipeline.',
}

const products: Array<{
  name: string
  href: string
  status: 'available' | 'pending'
  tag: string
  description: string
  highlights: string[]
  image: string
  imageAlt: string
}> = [
  {
    name: 'BB8 Balloon',
    href: '/b2b/products/bb8',
    status: 'available',
    tag: '6 functions in 1 device',
    description:
      'A single device performing the function of six — light-guided navigation, no-nav-required flexibility, tactile feedback, malleable tip, suction, and irrigation.',
    highlights: [
      '750+ patients operated',
      '3,000+ sinuses addressed',
      '100% surgical success',
      '0% intra/post-op complications',
    ],
    image: '/images/products/bb8.webp',
    imageAlt: 'BB8 Balloon device',
  },
  {
    name: 'Microdebrider Shaver Blades',
    href: '/b2b/products/shaver-blades',
    status: 'available',
    tag: 'High-quality tissue removal',
    description:
      'Core ENT shaver blades engineered for clean tissue removal with consistent performance across procedure types.',
    highlights: ['Approved device', 'Compatible with major ENT systems'],
    image: '/images/products/shaver-blades.webp',
    imageAlt: 'Microdebrider shaver blade tips',
  },
  {
    name: 'AllergyX Rinse Kit',
    href: '/b2b/products/allergyx',
    status: 'available',
    tag: 'Patient-friendly nasal irrigation',
    description:
      'A nasal irrigation system designed for pre- and post-procedure patient care — easy for patients to use at home, supports better surgical outcomes.',
    highlights: ['Approved device', 'Built for patient compliance'],
    image: '/images/products/allergyx.webp',
    imageAlt: 'AllergyX nasal rinse kit',
  },
  {
    name: 'Eustachian Tube Balloon',
    href: '#',
    status: 'pending',
    tag: 'Pending FDA approval',
    description:
      'An expansion of the BB8 platform engineered for eustachian tube dysfunction. Currently moving through regulatory approval.',
    highlights: ['Built on the BB8 platform', 'Targeted for eustachian tube dysfunction'],
    image: '/images/products/eustachian-tube-balloon.png',
    imageAlt: 'Eustachian Tube Balloon device prototype',
  },
]

export default function ProductsOverviewPage() {
  return (
    <>
      <PageHero
        eyebrow="Medical Device Portfolio"
        title="Best-in-industry devices, built around what your team uses."
        description="FDA-approved products for in-office ENT — minimally invasive, clinically proven, and supported by an experienced sales team that can train your staff on-site."
      />

      <section
        aria-labelledby="products-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <h2 id="products-heading" className="sr-only">
            Available products
          </h2>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {products.map((p) => {
              const isPending = p.status === 'pending'
              const Wrapper: 'a' | 'div' = isPending ? 'div' : 'a'
              return (
                <li key={p.name} className="flex">
                  <Wrapper
                    {...(isPending ? {} : { href: p.href })}
                    className={`group flex flex-col flex-grow border border-edge p-8 md:p-10 transition-colors duration-normal ${
                      isPending
                        ? 'bg-surface-alt cursor-default'
                        : 'bg-surface hover:bg-surface-alt'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-4">
                      <EyebrowTag tone={isPending ? 'default' : 'accent'}>
                        {isPending ? 'Coming soon' : 'Available now'}
                      </EyebrowTag>
                      <span className="text-xs text-ink-tertiary">{p.tag}</span>
                    </div>
                    <div className="bg-surface-alt border border-edge aspect-[16/9] flex items-center justify-center mb-6 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.imageAlt}
                        width={520}
                        height={293}
                        className="max-w-full max-h-full w-auto h-auto object-contain p-4"
                      />
                    </div>
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
                      {p.name}
                    </h3>
                    <p className="body-lead text-pretty mt-3">{p.description}</p>
                    <ul
                      role="list"
                      className="mt-6 flex flex-col gap-2 flex-grow"
                    >
                      {p.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-sm md:text-base text-ink-secondary leading-relaxed flex items-start gap-2"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2.5 inline-block w-1.5 h-1.5 bg-[color:var(--color-accent-primary)] flex-shrink-0"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    {!isPending && (
                      <div className="mt-8 pt-6 border-t border-edge inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast">
                        Explore {p.name}
                        <ArrowRight className="transition-transform duration-fast group-hover:translate-x-1" />
                      </div>
                    )}
                  </Wrapper>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="pipeline-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <EyebrowTag tone="default">R&D Pipeline</EyebrowTag>
              <h2
                id="pipeline-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
              >
                Strong pipeline. Quick regulatory turn. ENT-specific by design.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="body-lead text-pretty">
                Our development cycle goes from concept to manufacturing to
                commercialization without the layers of a generalist medtech
                company. Every product is sized to a real ENT need, not a
                cross-specialty hypothesis.
              </p>
              <Link
                href="/b2b/request-demo"
                className="btn-b2b-primary mt-6"
              >
                Talk to our sales team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
