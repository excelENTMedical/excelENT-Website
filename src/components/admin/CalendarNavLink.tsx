'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Rendered in the admin sidebar via admin.components.afterNavLinks.
// Links to the custom Social Content Calendar view (/admin/social-calendar).
const HREF = '/admin/social-calendar'

export default function CalendarNavLink() {
  const pathname = usePathname()
  const active = pathname === HREF
  return (
    <Link
      href={HREF}
      className="nav__link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        fontWeight: active ? 600 : undefined,
      }}
    >
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>📅</span>
      <span className="nav__link-label">Content Calendar</span>
    </Link>
  )
}
