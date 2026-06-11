import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcherPatient from './LanguageSwitcherPatient'
import MobileMenuPatient from './MobileMenuPatient'
import ScheduleButton from './ScheduleButton'

export default async function HeaderPatient() {
  const t = await getTranslations('nav')

  const navLinks = [
    { label: t('sinusitis'), href: '/sinusitis' },
    { label: t('locations'), href: '/find-a-specialist' },
    { label: t('resources'), href: '/resources' },
    { label: t('about'), href: '/about' },
  ]

  return (
    <header
      role="banner"
      className="sticky top-0 z-[var(--z-sticky)] bg-surface-translucent backdrop-blur border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="excelENT Medical home">
          <Image
            src="/images/logo.png"
            alt="excelENT"
            width={1920}
            height={641}
            priority
            className="h-9 md:h-11 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-cabin text-sm lg:text-base font-medium text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ScheduleButton size="sm" />
          <LanguageSwitcherPatient />
          <MobileMenuPatient links={navLinks} />
        </div>
      </div>
    </header>
  )
}
