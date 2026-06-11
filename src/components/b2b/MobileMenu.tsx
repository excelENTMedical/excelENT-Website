'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export default function MobileMenu({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll while open + restore focus on close.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)

    // Move focus into the drawer.
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      // Restore focus to the trigger button.
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="b2b-mobile-menu"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-ink hover:bg-surface-subtle transition-colors duration-fast"
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

      {/* Drawer */}
      {open && (
        <div
          id="b2b-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          className="lg:hidden fixed inset-0 z-[1050] flex flex-col bg-surface"
        >
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-edge">
            <span className="font-display font-bold text-lg text-ink">
              Menu
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 text-ink hover:bg-surface-subtle transition-colors duration-fast"
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
                  d="M6 6l12 12M6 18L18 6"
                />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Mobile primary"
            className="flex flex-col flex-1 px-4 sm:px-6 py-6 gap-1 overflow-y-auto"
          >
            {navItems.map((item) => (
              <div key={item.href} className="border-b border-edge">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-2xl font-display font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast py-4"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 pb-2 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="text-base font-medium text-ink-secondary hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast py-2"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="https://patients.excelentmedical.com"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-ink-secondary hover:text-ink transition-colors duration-fast py-4 mt-2"
            >
              For Patients
              <span className="block text-xs text-ink-tertiary mt-1 font-normal">
                patients.excelentmedical.com
              </span>
            </Link>
          </nav>

          <div className="p-4 sm:p-6 border-t border-edge">
            <Link
              href="/b2b/request-demo"
              onClick={() => setOpen(false)}
              className="btn-b2b-primary w-full"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
