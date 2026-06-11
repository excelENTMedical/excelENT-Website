import type { Metadata } from 'next'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import PageHero from '@/components/b2b/PageHero'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'About — excelENT Medical',
  description:
    'excelENT Medical develops products and platform technology for independent ENT practices. Built by practicing otolaryngologists.',
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="excelENT Medical."
        description="A medical-device and platform-technology company built by practicing otolaryngologists for independent ENT practices."
      />

      <section
        aria-labelledby="overview-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <EyebrowTag tone="default">Company</EyebrowTag>
              <h2
                id="overview-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                What we do, where we&rsquo;re based, and how to reach us.
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-8">
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-1">
                  <dt className="eyebrow text-ink">Headquarters</dt>
                  <dd className="text-base text-ink-secondary">Raleigh, NC</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="eyebrow text-ink">Founded</dt>
                  <dd className="text-base text-ink-secondary">
                    By a team of practicing ENT and medical-device veterans
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="eyebrow text-ink">Focus</dt>
                  <dd className="text-base text-ink-secondary">
                    Independent ENT practices and the products and platform
                    technology that support them
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="eyebrow text-ink">Reach us</dt>
                  <dd className="text-base text-ink-secondary">
                    <Link
                      href="/b2b/contact"
                      className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
                    >
                      Contact page
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="/b2b/request-demo"
                      className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
                    >
                      Request a demo
                    </Link>
                  </dd>
                </div>
              </dl>

              <div className="border-t border-edge pt-8 flex flex-col gap-3">
                <p className="body-lead text-pretty">
                  Our portfolio spans FDA-approved medical devices for in-office
                  ENT and a Practice Solutions software platform that handles
                  patient prospecting, AI front-desk operations, and revenue
                  cycle management.
                </p>
                <p className="text-base text-ink-secondary leading-relaxed text-pretty">
                  Our customers are independent ENT practices that want to
                  remain physician-led and community-focused. We don&rsquo;t
                  consolidate. We supply the products, the patient flow, and
                  the operational tools that let those practices compete and
                  win.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-2">
                <Link href="/b2b/why-excelent" className="btn-b2b-secondary">
                  Meet the Team
                </Link>
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
