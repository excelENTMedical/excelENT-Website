import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ExcelENT Medical',
  description: 'Sinus Relief Specialists - Balloon Sinuplasty Treatment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
