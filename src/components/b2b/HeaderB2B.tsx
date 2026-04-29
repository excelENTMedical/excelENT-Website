import Link from 'next/link'

const navItems: Array<{ label: string; href: string }> = [
  { label: 'Solutions', href: '/b2b/solutions' },
  { label: 'Products', href: '/b2b/products' },
  { label: 'How It Works', href: '/b2b/how-it-works' },
  { label: 'Why excelENT', href: '/b2b/why-excelent' },
]

export default function HeaderB2B() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-[1020] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-6">
          {/* Wordmark */}
          <Link
            href="/b2b"
            aria-label="excelENT home"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
          >
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-ink">
              excel<span className="text-[color:var(--color-accent-primary)]">ENT</span>
            </span>
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

          {/* Demo CTA + mobile menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/b2b/request-demo"
              className="btn-b2b-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              <span className="hidden md:inline">Request a Demo</span>
              <span className="md:hidden">Demo</span>
            </Link>

            {/* Mobile menu button (placeholder — wired up in later component pass) */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-ink hover:bg-surface-subtle transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
