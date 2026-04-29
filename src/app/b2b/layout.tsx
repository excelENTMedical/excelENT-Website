import type { Metadata } from 'next'
import { Cabin, Montserrat } from 'next/font/google'
import HeaderB2B from '@/components/b2b/HeaderB2B'
import FooterB2B from '@/components/b2b/FooterB2B'
import '../globals.css'

const cabin = Cabin({
  subsets: ['latin'],
  variable: '--font-cabin',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'excelENT | Practice Solutions Platform for Independent ENTs',
  description:
    'A complete platform designed to help ENT practices attract, convert, and manage patient care more efficiently. PS | Connect, PS | Lexi, PS | RCM.',
}

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="b2b"
      className={`${cabin.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface text-ink">
        <HeaderB2B />
        <main className="flex-grow">{children}</main>
        <FooterB2B />
      </body>
    </html>
  )
}
