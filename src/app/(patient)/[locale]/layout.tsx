import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, unstable_setRequestLocale } from 'next-intl/server'
import { Cabin } from 'next/font/google'
import Script from 'next/script'
import HeaderPatient from '@/components/patient/HeaderPatient'
import FooterPatient from '@/components/patient/FooterPatient'
import BookingWidgetModal from '@/components/patient/BookingWidgetModal'
import StructuredData from '@/components/StructuredData'
import { organizationSchema, websiteSchema, SITE_URL } from '@/lib/structured-data'
import '../../globals.css'

export const metadata = {
  metadataBase: new URL(SITE_URL),
}

const cabin = Cabin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabin',
  display: 'swap',
})

const locales = ['en', 'es']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const WIDGET_BASE =
  process.env.NEXT_PUBLIC_BOOKING_WIDGET_BASE_URL ||
  'https://app.excelentmedical.com/widget'

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()
  unstable_setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      data-theme="patient"
      className={cabin.variable}
    >
      <head>
        {/* ExcelVoice booking widget assets — load globally for header CTA modal */}
        <link rel="stylesheet" href={`${WIDGET_BASE}/booking-widget.css`} />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-ink font-cabin">
        <StructuredData data={[organizationSchema(), websiteSchema()]} />
        <NextIntlClientProvider messages={messages}>
          <HeaderPatient />
          <main className="flex-grow">{children}</main>
          <FooterPatient />
          <BookingWidgetModal />
        </NextIntlClientProvider>
        <Script
          src={`${WIDGET_BASE}/booking-widget.js`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
