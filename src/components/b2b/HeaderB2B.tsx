import Image from 'next/image'
import Link from 'next/link'
import MobileMenu, { type NavItem } from './MobileMenu'

const navItems: NavItem[] = [
  {
    label: 'Solutions',
    href: '/b2b/solutions',
    children: [
      { label: 'PS | Connect', href: '/b2b/solutions/connect' },
      { label: 'PS | Lexi', href: '/b2b/solutions/lexi' },
      { label: 'PS | RCM', href: '/b2b/solutions/rcm' },
    ],
  },
  {
    label: 'Products',
    href: '/b2b/products',
    children: [
      { label: 'BB8 Balloon', href: '/b2b/products/bb8' },
      { label: 'AllergyX Rinse Kit', href: '/b2b/products/allergyx' },
      { label: 'Microdebrider Shaver Blades', href: '/b2b/products/shaver-blades' },
    ],
  },
  { label: 'How It Works', href: '/b2b/how-it-works' },
  { label: 'Why excelENT', href: '/b2b/why-excelent' },
]

const ChevronDown = () => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="ml-1 transition-transform duration-fast group-hover:rotate-180 group-focus-within:rotate-180"
  >
    <polyline points="2,4 6,8 10,4" />
  </svg>
)

export default function HeaderB2B() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-[1020] bg-surface-translucent backdrop-blur supports-[backdrop-filter]:bg-surface-translucent-strong border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/b2b"
            aria-label="excelENT home"
            className="flex items-center"
          >
            <Image
              src="/images/logo.png"
              alt="excelENT"
              width={1920}
              height={641}
              priority
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Primary nav (desktop) */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-8"
          >
            {navItems.map((item) =>
              item.children ? (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    className="inline-flex items-center text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-fast py-2"
                  >
                    {item.label}
                    <ChevronDown />
                  </Link>
                  <div
                    role="menu"
                    aria-label={`${item.label} sub-menu`}
                    className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 absolute left-0 top-full pt-2 transition-opacity duration-fast"
                  >
                    <div className="min-w-[240px] bg-surface border-l-4 border-[color:var(--color-accent-primary)] border-y border-r border-edge shadow-lg py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          className="block px-4 py-2.5 text-sm text-ink hover:bg-surface-alt hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-fast"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href="https://patients.excelentmedical.com"
              className="text-sm font-medium text-ink-tertiary hover:text-ink transition-colors duration-fast"
            >
              For Patients
            </Link>
          </nav>

          {/* Demo CTA + mobile menu trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/b2b/request-demo"
              className="btn-b2b-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              <span className="hidden md:inline">Request a Demo</span>
              <span className="md:hidden">Demo</span>
            </Link>

            <MobileMenu navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  )
}
