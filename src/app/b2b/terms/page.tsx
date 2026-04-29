import type { Metadata } from 'next'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Terms and Conditions — excelENT Medical',
  description:
    'Terms governing use of the excelentmedical.com website and the excelENT Practice Solutions platform.',
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Terms and Conditions"
        title="Terms and Conditions"
        description="The agreement governing use of this website and the services offered through it."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <p className="text-sm text-ink-tertiary italic">
              Last updated: April 06, 2023
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Interpretation and Definitions
            </h2>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              Interpretation
            </h3>
            <p>
              Words with initial capitalization have meanings defined in these
              conditions and maintain the same meaning in singular or plural
              form.
            </p>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              Definitions
            </h3>
            <p>For purposes of these Terms and Conditions:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Affiliate</strong>: An entity controlling, controlled
                by, or under common control with a party, where
                &ldquo;control&rdquo; means ownership of 50% or more of shares
                or voting securities.
              </li>
              <li>
                <strong>Country</strong>: North Carolina, United States.
              </li>
              <li>
                <strong>Company</strong>: EXCELENT LLC, located at 68 T.W.
                Alexander Drive, PO Box 13628, Research Triangle Park, Durham,
                NC 27709.
              </li>
              <li>
                <strong>Device</strong>: Any device accessing the Service
                (computer, cellphone, tablet, etc.).
              </li>
              <li>
                <strong>Service</strong>: The Website.
              </li>
              <li>
                <strong>Terms and Conditions</strong>: This agreement forming
                the entire understanding between You and the Company regarding
                Service use.
              </li>
              <li>
                <strong>Third-party Social Media Service</strong>: Services or
                content provided by third parties displayed through the
                Service.
              </li>
              <li>
                <strong>Website</strong>: ExcelENT, accessible from
                https://www.excelentmedical.com/.
              </li>
              <li>
                <strong>You</strong>: The individual or legal entity accessing
                or using the Service.
              </li>
            </ul>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Acknowledgment
            </h2>
            <p>
              These Terms govern Service use between You and the Company.
              Access and use are conditioned on your acceptance and compliance.
            </p>
            <p>
              You represent being over 18 years old. The Company does not
              permit those under 18 to use the Service.
            </p>
            <p>
              Your use is also conditioned on accepting the Company&rsquo;s
              Privacy Policy.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Links to Other Websites
            </h2>
            <p>
              The Service may contain links to third-party websites not owned
              by the Company. The Company assumes no responsibility for
              third-party content, privacy policies, or practices and is not
              liable for damages from third-party resources.
            </p>
            <p>
              We advise reviewing third-party terms and privacy policies
              before visiting.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Termination
            </h2>
            <p>
              The Company may terminate or suspend your access immediately
              without notice for any reason, including breach of these Terms.
              Upon termination, your right to use the Service ceases
              immediately.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Limitation of Liability
            </h2>
            <p>
              The Company&rsquo;s entire liability is limited to amounts
              actually paid through the Service or $100 USD if no purchase was
              made.
            </p>
            <p>
              The Company is not liable for special, incidental, indirect, or
              consequential damages, including lost profits, data loss,
              business interruption, or privacy loss, even if advised of such
              possibility.
            </p>
            <p>
              Some states prohibit liability limitations for certain damages,
              so some exclusions may not apply.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; Disclaimer
            </h2>
            <p>
              The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS
              AVAILABLE&rdquo; with all faults. The Company disclaims all
              warranties — express, implied, statutory, or otherwise —
              regarding the Service.
            </p>
            <p>
              The Company makes no representation that the Service will meet
              your requirements, achieve intended results, work with other
              software, operate without interruption, meet performance
              standards, be error-free, or that errors will be corrected.
            </p>
            <p>
              The Company provides no warranty regarding operation,
              availability, information accuracy, uninterrupted service, or
              that servers or content are free from viruses, malware, or
              harmful components.
            </p>
            <p>
              Some jurisdictions prohibit warranty exclusions, so some
              limitations may not apply to you.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Governing Law
            </h2>
            <p>
              These Terms and your Service use are governed by North Carolina
              law, excluding conflict of law rules. Other local, state,
              national, or international laws may also apply.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Disputes Resolution
            </h2>
            <p>
              To resolve any dispute, you agree to first contact the Company
              informally.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              For European Union (EU) Users
            </h2>
            <p>
              EU consumers benefit from mandatory legal provisions of their
              resident country.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              United States Legal Compliance
            </h2>
            <p>
              You represent and warrant that you are not located in countries
              subject to U.S. embargo or designated as &ldquo;terrorist
              supporting&rdquo; and are not on U.S. prohibited or restricted
              parties lists.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Severability and Waiver
            </h2>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              Severability
            </h3>
            <p>
              If any provision is unenforceable, it will be modified to achieve
              its objectives under applicable law, with remaining provisions
              continuing in effect.
            </p>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              Waiver
            </h3>
            <p>
              Failure to exercise rights or enforce obligations does not
              prevent future enforcement, and waiving one breach does not waive
              subsequent breaches.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Translation Interpretation
            </h2>
            <p>
              These Terms may have been translated. The original English text
              prevails in disputes.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Changes to These Terms and Conditions
            </h2>
            <p>
              The Company reserves the right to modify these Terms at any time.
              Material revisions require reasonable 30-day notice. Continued
              use following revisions means you agree to new terms.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Contact Us
            </h2>
            <p>
              For questions about these Terms and Conditions, contact{' '}
              <a
                href="mailto:legal@excelentmedical.com"
                className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
              >
                legal@excelentmedical.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
