'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'

interface NavLink {
  label: string
  href: string
}

export default function MobileMenuPatient({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    drawerRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="patient-mobile-drawer"
        onClick={() => setOpen((o) => !o)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-subtle transition-colors duration-fast"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M5 5l12 12M17 5L5 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[var(--z-modal-bg)]" id="patient-mobile-drawer">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[color:var(--color-bg-overlay)]"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-label="Site navigation"
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-surface flex flex-col py-8 px-6 gap-6 overflow-y-auto"
          >
            <nav aria-label="Mobile primary" className="flex flex-col gap-1 mt-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-cabin text-xl font-medium text-ink py-3 border-b border-edge-subtle hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-edge">
              <a
                href="https://www.excelentmedical.com/b2b"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-tertiary hover:text-ink transition-colors duration-fast"
              >
                For practices →
              </a>
              <p className="text-xs text-ink-tertiary">
                ExcelENT Medical · Practice Solutions for ENT
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
