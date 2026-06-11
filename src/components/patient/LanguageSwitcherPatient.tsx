'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

export default function LanguageSwitcherPatient() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggle = () => {
    const next = locale === 'en' ? 'es' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${locale === 'en' ? 'Spanish' : 'English'}`}
      className="hidden sm:inline-flex items-center justify-center w-12 h-9 px-2 rounded-full text-xs font-semibold text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors duration-fast border border-edge"
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  )
}
