'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    ExcelENTBookingWidget?: {
      init: (id: string) => void
      destroy: (id: string) => void
    }
    openBookingModal?: () => void
    closeBookingModal?: () => void
  }
}

const MOUNT_ID = 'excelent-booking-modal-mount'
const CONTAINER_ID = 'excelent-booking-modal'

export default function BookingWidgetModal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const isOpenRef = useRef(false)

  useEffect(() => {
    const open = () => {
      const el = document.getElementById(CONTAINER_ID)
      if (!el || isOpenRef.current) return
      triggerRef.current = (document.activeElement as HTMLElement) ?? null
      el.hidden = false
      document.body.classList.add('modal-open')
      isOpenRef.current = true
      // Init the widget after a tick so the modal mount node is visible
      requestAnimationFrame(() => {
        if (window.ExcelENTBookingWidget) {
          try {
            window.ExcelENTBookingWidget.init(MOUNT_ID)
          } catch (_e) {
            /* widget script may not have loaded yet — link will fall through */
          }
        }
      })
      // Focus the close button for keyboard users
      const closeBtn = el.querySelector<HTMLButtonElement>('[data-modal-close]')
      closeBtn?.focus()
    }

    const close = () => {
      const el = document.getElementById(CONTAINER_ID)
      if (!el || !isOpenRef.current) return
      if (window.ExcelENTBookingWidget) {
        try {
          window.ExcelENTBookingWidget.destroy(MOUNT_ID)
        } catch (_e) {
          /* destroy is forgiving */
        }
      }
      el.hidden = true
      document.body.classList.remove('modal-open')
      isOpenRef.current = false
      triggerRef.current?.focus()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenRef.current) close()
    }

    window.openBookingModal = open
    window.closeBookingModal = close
    document.addEventListener('keydown', onKey)

    // Auto-open if URL has ?schedule=open
    const url = new URL(window.location.href)
    if (url.searchParams.get('schedule') === 'open') {
      open()
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      delete window.openBookingModal
      delete window.closeBookingModal
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id={CONTAINER_ID}
      hidden
      role="dialog"
      aria-modal="true"
      aria-labelledby="excelent-booking-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg-overlay)',
        zIndex: 'var(--z-modal-bg)' as unknown as number,
        overflowY: 'auto',
      }}
    >
      <button
        type="button"
        aria-label="Close booking dialog"
        onClick={() => window.closeBookingModal?.()}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 0,
          cursor: 'default',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          maxWidth: '1000px',
          margin: '40px auto',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 1,
        }}
      >
        <button
          type="button"
          data-modal-close
          aria-label="Close"
          onClick={() => window.closeBookingModal?.()}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '44px',
            height: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            background: 'transparent',
            border: 0,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          ×
        </button>
        <div id="excelent-booking-modal-title" className="sr-only">
          Schedule an appointment
        </div>
        <div id={MOUNT_ID} style={{ minHeight: '500px', padding: 'var(--space-8)' }}>
          {/* ExcelENTBookingWidget mounts here on open */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px',
              textAlign: 'center',
              padding: 'var(--space-8)',
              gap: 'var(--space-4)',
            }}
          >
            <p className="body-patient" style={{ color: 'var(--color-text-secondary)' }}>
              Loading booking flow...
            </p>
            <a
              href="https://app.excelentmedical.com/excelvoice/booking-test"
              className="btn-patient-primary btn-patient-md"
            >
              Open booking page directly
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
