'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'

export default function FloatingLanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const switchLocale = (newLocale: 'en' | 'es') => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  const currentFlag = locale === 'es' ? '🇪🇸' : '🇺🇸'
  const currentLabel = locale === 'es' ? 'Español' : 'English'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[180px]">
          <button
            onClick={() => switchLocale('en')}
            className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
              locale === 'en'
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-2xl" aria-hidden="true">🇺🇸</span>
            <span className="text-sm">English</span>
            {locale === 'en' && (
              <svg className="w-4 h-4 ml-auto text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => switchLocale('es')}
            className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-t border-gray-100 ${
              locale === 'es'
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-2xl" aria-hidden="true">🇪🇸</span>
            <span className="text-sm">Español</span>
            {locale === 'es' && (
              <svg className="w-4 h-4 ml-auto text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Switch language. Current: ${currentLabel}`}
        aria-expanded={isOpen}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 rounded-full shadow-lg hover:shadow-xl border border-gray-200 pl-3 pr-4 py-2.5 transition-all duration-200 group"
      >
        <span className="text-2xl leading-none" aria-hidden="true">{currentFlag}</span>
        <span className="text-sm font-semibold">{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
