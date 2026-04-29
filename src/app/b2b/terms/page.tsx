import type { Metadata } from 'next'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Terms of Use — excelENT Medical',
  description:
    'Terms governing use of the excelENT Medical marketing site at excelentmedical.com.',
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Terms of Use"
        title="Site terms."
        description="Plain-language terms governing use of this marketing site."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-2">
              About these terms
            </h2>
            <p>
              These terms apply to your use of the excelentmedical.com
              marketing website. Use of the excelENT Practice Solutions
              platform itself is governed separately by the master services
              agreement and BAA between your practice and excelENT Medical.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Content
            </h2>
            <p>
              Content on this site is provided for informational purposes.
              Product specifications, performance metrics, and customer
              references are accurate as of the dates indicated and may be
              updated as the platform evolves. Marketing claims are not
              clinical advice.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Trademarks
            </h2>
            <p>
              excelENT, BB8, AllergyX, PS | Connect, PS | Lexi, and PS | RCM
              are trademarks of excelENT Medical. Other trademarks referenced
              are the property of their respective owners.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Forward-looking statements
            </h2>
            <p>
              References to products in development (such as the Eustachian
              Tube Balloon and PS | Authorize) describe items pending
              regulatory approval or in active development. Timelines and
              capabilities can change.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Contact
            </h2>
            <p>
              Questions about these terms can go to{' '}
              <a
                href="mailto:legal@excelentmedical.com"
                className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
              >
                legal@excelentmedical.com
              </a>
              .
            </p>

            <p className="text-sm text-ink-tertiary border-t border-edge pt-6 mt-4 italic">
              This is a plain-language summary. A full legal terms document
              will replace this page when finalized.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
