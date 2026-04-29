import Link from 'next/link'

export default function FooterB2B() {
  return (
    <footer
      role="contentinfo"
      className="bg-surface-inverse text-[color:var(--color-text-inverse)] mt-auto"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="font-display font-bold text-2xl tracking-tight">
              excel<span className="text-[color:var(--color-accent-primary)]">ENT</span>
            </span>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
              Practice Solutions Platform for independent ENT practices. Built
              by practicing otolaryngologists.
            </p>
          </div>

          <Link
            href="/b2b/request-demo"
            className="btn-b2b-primary self-start md:self-auto"
          >
            Request a Demo
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs md:text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} excelENT Medical. All rights reserved.</p>
          <nav aria-label="Footer legal">
            <ul role="list" className="flex gap-6">
              <li>
                <Link href="/b2b/privacy" className="hover:text-neutral-300 transition-colors duration-fast">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/b2b/hipaa" className="hover:text-neutral-300 transition-colors duration-fast">
                  HIPAA
                </Link>
              </li>
              <li>
                <Link href="https://patients.excelentmedical.com" className="hover:text-neutral-300 transition-colors duration-fast">
                  For Patients
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
