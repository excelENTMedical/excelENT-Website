import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Privacy — excelENT Medical',
  description:
    'How excelENT Medical handles personal information collected through our marketing site and demo requests.',
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Privacy"
        title="Privacy notice."
        description="A short summary of how we handle the information you share with us through this site."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 prose-styles">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-2">
              What we collect
            </h2>
            <p>
              When you submit a demo request or contact form, we collect the
              information you provide — typically name, work email, practice
              name, role, and any practice context you choose to share. We also
              collect basic analytics data on how this site is used (page
              views, browser, referrer).
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              How we use it
            </h2>
            <p>
              Form submissions are used to follow up with you about a demo or
              your inquiry. We do not sell or share your information with
              unrelated third parties. Analytics data is aggregated and used
              to improve the site.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Patient information (HIPAA)
            </h2>
            <p>
              This marketing site does not collect or store protected health
              information (PHI). PHI handling on our Practice Solutions
              platform is governed separately under our HIPAA Notice and
              Business Associate Agreements with partner practices. See our{' '}
              <Link
                href="/b2b/hipaa"
                className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
              >
                HIPAA notice
              </Link>{' '}
              for details.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Your choices
            </h2>
            <p>
              You can request deletion of your contact-form data at any time by
              emailing{' '}
              <a
                href="mailto:privacy@excelentmedical.com"
                className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
              >
                privacy@excelentmedical.com
              </a>
              .
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Updates
            </h2>
            <p>
              We update this notice as our practices evolve. Material changes
              will be posted to this page with a revised effective date.
            </p>

            <p className="text-sm text-ink-tertiary border-t border-edge pt-6 mt-4 italic">
              This summary is intended to give a clear, plain-language picture
              of our handling of personal information collected through the
              marketing site. A full legal version of our privacy policy is
              available on request.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
