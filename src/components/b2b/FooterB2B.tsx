import Image from 'next/image'
import Link from 'next/link'

const linkGroups: Array<{
  heading: string
  links: Array<{ label: string; href: string }>
}> = [
  {
    heading: 'Solutions',
    links: [
      { label: 'PS | Connect', href: '/b2b/solutions/connect' },
      { label: 'PS | Lexi', href: '/b2b/solutions/lexi' },
      { label: 'PS | RCM', href: '/b2b/solutions/rcm' },
    ],
  },
  {
    heading: 'Products',
    links: [
      { label: 'BB8 Balloon', href: '/b2b/products/bb8' },
      { label: 'Shaver Blades', href: '/b2b/products/shaver-blades' },
      { label: 'AllergyX Rinse Kit', href: '/b2b/products/allergyx' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Why excelENT', href: '/b2b/why-excelent' },
      { label: 'How It Works', href: '/b2b/how-it-works' },
      { label: 'Contact', href: '/b2b/contact' },
    ],
  },
  {
    heading: 'For Patients',
    links: [
      { label: 'Patient site', href: 'https://patients.excelentmedical.com' },
      {
        label: 'Find a Specialist',
        href: 'https://patients.excelentmedical.com/find-a-specialist',
      },
    ],
  },
]

export default function FooterB2B() {
  return (
    <footer
      role="contentinfo"
      className="bg-surface-alt border-t border-edge mt-auto"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top row — logo + tagline + CTA */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-12 border-b border-edge">
          <div className="flex flex-col gap-4 max-w-xl">
            <Image
              src="/images/logo.png"
              alt="excelENT"
              width={200}
              height={62}
              className="h-10 md:h-12 w-auto"
            />
            <p className="text-sm md:text-base text-ink-secondary leading-relaxed max-w-md">
              Practice Solutions Platform for independent ENT practices. Built
              by practicing otolaryngologists.
            </p>
          </div>

          <Link
            href="/b2b/request-demo"
            className="btn-b2b-primary self-start md:self-auto whitespace-nowrap"
          >
            Request a Demo
          </Link>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 py-12">
          {linkGroups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-4">
              <h3 className="eyebrow text-ink">{group.heading}</h3>
              <ul role="list" className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm md:text-base text-ink-secondary hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-edge flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs md:text-sm text-ink-tertiary">
          <p>© {new Date().getFullYear()} excelENT Medical. All rights reserved.</p>
          <nav aria-label="Footer legal">
            <ul role="list" className="flex gap-6">
              <li>
                <Link
                  href="/b2b/privacy"
                  className="hover:text-ink transition-colors duration-fast"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b/hipaa"
                  className="hover:text-ink transition-colors duration-fast"
                >
                  HIPAA
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b/terms"
                  className="hover:text-ink transition-colors duration-fast"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
