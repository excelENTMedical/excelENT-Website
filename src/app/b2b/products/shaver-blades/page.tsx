import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'Microdebrider Shaver Blades — excelENT',
  description:
    'High-quality ENT microdebrider shaver blades engineered for clean, consistent tissue removal across procedure types.',
}

const features: Array<{ title: string; description: string }> = [
  {
    title: 'Engineered for Tissue Precision',
    description:
      'Sharp, consistent edges throughout the lifespan of each blade — designed to perform predictably from first case to last.',
  },
  {
    title: 'Compatible With Major Systems',
    description:
      'Works with the microdebrider handpieces and consoles already in most ENT operating rooms and procedure suites.',
  },
  {
    title: 'Available Now',
    description:
      'Approved device. In stock with established supply chain — no waiting list, no special-order delays.',
  },
  {
    title: 'Trained Sales Support',
    description:
      'Our reps know the device, the procedure, and the codes. Ongoing in-office support and staff training included.',
  },
]

export default function ShaverBladesPage() {
  return (
    <>
      {/* Hero — text left, product image right */}
      <section
        aria-labelledby="shaver-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">Microdebrider Shaver Blades</EyebrowTag>
              <h1
                id="shaver-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                High-quality blades. Consistent across cases.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                A core ENT consumable engineered for clean tissue removal.
                Compatible with major microdebrider systems. Backed by an
                experienced sales team that supports your OR staff before,
                during, and after the sale.
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

            <aside aria-label="Shaver blades" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-surface p-6 md:p-8">
                <Image
                  src="/images/products/shaver-blades.webp"
                  alt="excelENT microdebrider shaver blades — close-up of two consumable cutter tips with x|cutter branding"
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

      {/* Why these blades — purple left borders */}
      <section
        aria-labelledby="features-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="accent">Why these blades</EyebrowTag>
            <h2
              id="features-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              Built for the cases ENT actually does.
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
