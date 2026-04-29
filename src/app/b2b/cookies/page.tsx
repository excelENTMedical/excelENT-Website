import type { Metadata } from 'next'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Cookie Policy — excelENT Medical',
  description:
    'How excelENT Medical uses cookies on excelentmedical.com, what types we use, and how to manage your preferences.',
}

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Cookie Policy"
        title="Cookie Policy"
        description="What cookies are, how we use them, and how to manage your preferences."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <p className="text-sm text-ink-tertiary italic">
              Effective Date: 24-Jul-2023 · Last Updated: 24-Jul-2023
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              What are cookies?
            </h2>
            <p>
              This Cookie Policy explains cookie usage, types employed,
              information collected, and management options. &ldquo;Cookies
              are small text files that are used to store small pieces of
              information&rdquo; on your device when the website loads. They
              enhance functionality, security, user experience, and provide
              performance analytics.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              How do we use cookies?
            </h2>
            <p>
              The website uses first-party and third-party cookies. First-party
              cookies are &ldquo;mostly necessary for the website to function
              the right way, and they do not collect any of your personally
              identifiable data.&rdquo;
            </p>
            <p>
              Third-party cookies serve purposes including website performance
              analysis, interaction tracking, security, relevant advertising
              delivery, and improved user experience.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Manage cookie preferences
            </h2>
            <p>
              Different browsers provide distinct methods for blocking and
              deleting cookies. You may adjust browser settings accordingly.
              Support resources for major browsers:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Chrome:</strong>{' '}
                <a
                  href="https://support.google.com/accounts/answer/32050"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-accent-primary)] underline hover:no-underline break-words"
                >
                  support.google.com/accounts/answer/32050
                </a>
              </li>
              <li>
                <strong>Safari:</strong>{' '}
                <a
                  href="https://support.apple.com/en-in/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-accent-primary)] underline hover:no-underline break-words"
                >
                  support.apple.com/guide/safari/sfri11471/mac
                </a>
              </li>
              <li>
                <strong>Firefox:</strong>{' '}
                <a
                  href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-accent-primary)] underline hover:no-underline break-words"
                >
                  support.mozilla.org/kb/clear-cookies-and-site-data-firefox
                </a>
              </li>
              <li>
                <strong>Internet Explorer:</strong>{' '}
                <a
                  href="https://support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer-bca9446f-d873-78de-77ba-d42645fa52fc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-accent-primary)] underline hover:no-underline break-words"
                >
                  support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer
                </a>
              </li>
            </ul>
            <p>
              For other browsers, consult their official support documentation.
            </p>

            <p className="text-sm text-ink-tertiary border-t border-edge pt-6 mt-4 italic">
              A complete cookie inventory will be published here as the site
              telemetry stack is finalized.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
