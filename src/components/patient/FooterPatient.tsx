import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

export default async function FooterPatient() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')

  const groups = [
    {
      heading: t('learn'),
      links: [
        { label: tNav('sinusitis'), href: '/sinusitis' },
        { label: 'What is sinusitis', href: '/sinusitis/what-is-sinusitis' },
        { label: 'Symptoms', href: '/sinusitis/symptoms' },
        { label: 'Treatment', href: '/sinusitis/treatment' },
        { label: 'Balloon sinuplasty', href: '/balloon-sinuplasty' },
        { label: 'FAQs', href: '/sinusitis/faqs' },
      ],
    },
    {
      heading: t('care'),
      links: [
        { label: tNav('locations'), href: '/find-a-specialist' },
        { label: t('schedule'), href: '/schedule' },
        { label: tNav('resources'), href: '/resources' },
      ],
    },
    {
      heading: t('about'),
      links: [
        { label: tNav('about'), href: '/about' },
        { label: 'For practices →', href: 'https://www.excelentmedical.com/b2b', external: true },
      ],
    },
  ]

  return (
    <footer
      role="contentinfo"
      className="bg-surface border-t border-edge mt-auto"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-10 border-b border-edge">
          <div className="md:col-span-5 flex flex-col gap-4">
            <Image
              src="/images/logo.png"
              alt="excelENT"
              width={1920}
              height={641}
              sizes="(min-width: 768px) 360px, 280px"
              className="h-20 md:h-24 w-auto"
            />
            <p className="font-cabin text-sm md:text-base text-ink-secondary leading-relaxed max-w-md">
              {t('tagline')}
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {groups.map((group) => (
              <div key={group.heading} className="flex flex-col gap-3">
                <h3 className="eyebrow-patient text-ink-secondary">
                  {group.heading}
                </h3>
                <ul role="list" className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-cabin text-sm text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="font-cabin text-sm text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs md:text-sm text-ink-tertiary">
          <p>© {new Date().getFullYear()} ExcelENT Medical. All rights reserved.</p>
          <nav aria-label="Footer legal">
            <ul role="list" className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link href="/privacy" className="hover:text-ink">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-ink">{t('terms')}</Link></li>
              <li><Link href="/cookies" className="hover:text-ink">{t('cookies')}</Link></li>
              <li><Link href="/hipaa" className="hover:text-ink">HIPAA</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
