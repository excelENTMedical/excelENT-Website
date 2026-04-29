import Image from 'next/image'
import Link from 'next/link'
import MobileMenu, { type NavItem } from './MobileMenu'

const navItems: NavItem[] = [
  { label: 'Solutions', href: '/b2b/solutions' },
  { label: 'Products', href: '/b2b/products' },
  { label: 'How It Works', href: '/b2b/how-it-works' },
  { label: 'Why excelENT', href: '/b2b/why-excelent' },
]

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
              width={180}
              height={56}
              priority
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Primary nav (desktop) */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-8"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-fast"
              >
                {item.label}
              </Link>
            ))}
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
