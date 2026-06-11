import Link from 'next/link'
import EyebrowTag from './EyebrowTag'

export default function InlineDemoCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-surface-alt border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8">
          <EyebrowTag tone="accent">Get Started</EyebrowTag>

          <h2
            id="cta-heading"
            className="font-display font-bold tracking-tight leading-[1.05] text-3xl md:text-5xl lg:text-6xl text-ink text-balance"
          >
            Ready to grow your ENT practice?
          </h2>

          <p className="body-lead text-pretty max-w-2xl">
            Schedule a working session with our team. We&rsquo;ll walk through
            what&rsquo;s actually possible for your specific practice — your
            patient mix, your EMR, your local market.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 pt-2">
            <Link
              href="/b2b/request-demo"
              className="btn-b2b-primary"
              aria-label="Request a demo of the excelENT Practice Solutions platform"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
