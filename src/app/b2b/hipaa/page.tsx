import type { Metadata } from 'next'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'HIPAA Notice — excelENT Medical',
  description:
    'How excelENT Practice Solutions protects patient health information across PS | Connect, PS | Lexi, and PS | RCM.',
}

export default function HIPAAPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="HIPAA Notice"
        title="How we handle protected health information."
        description="A summary of the HIPAA-compliance posture across the excelENT Practice Solutions platform."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div
            role="note"
            aria-label="Draft notice"
            className="border-l-4 border-[color:var(--color-accent-primary)] bg-surface-alt p-4 md:p-5 mb-8 text-sm text-ink-secondary leading-relaxed"
          >
            <strong className="text-ink">Draft for review.</strong> This HIPAA
            notice is authored as an informational summary and has not yet been
            reviewed by counsel. The legal version will replace this page
            before public launch.
          </div>
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-2">
              HIPAA-compliant infrastructure
            </h2>
            <p>
              The excelENT Practice Solutions platform — including PS | Lexi
              (Virtual Office Assistant), PS | Connect (Patient Routing), and
              PS | RCM (Revenue Cycle Management) — operates on
              HIPAA-enabled infrastructure. Patient information is handled
              according to healthcare privacy standards.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Business Associate Agreements
            </h2>
            <p>
              We maintain BAAs with our technology partners and participating
              practices to ensure all parties handling protected health
              information meet HIPAA requirements.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Data handling
            </h2>
            <p>
              All information collected from patients is encrypted in transit
              and at rest, with strict access controls protecting patient
              privacy. Access is granted only to roles that require it for
              defined operational purposes.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              Controlled data flow
            </h2>
            <p>
              Patient information collected by PS | Lexi and other platform
              components is securely transmitted to your practice workflow
              before being entered into the EMR system you operate.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-4">
              For partner practices
            </h2>
            <p>
              The full scope of our HIPAA program — BAA documentation,
              security controls, and incident response — is provided as part
              of your onboarding. Reach out to your account manager for the
              detailed compliance package.
            </p>

            <p className="text-sm text-ink-tertiary border-t border-edge pt-6 mt-4 italic">
              This summary is intended to describe the HIPAA-compliance posture
              at a high level. The marketing site itself does not collect or
              store protected health information.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
