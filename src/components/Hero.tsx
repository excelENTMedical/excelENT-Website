'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

interface HeroProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  locationName?: string
  showPhone?: boolean
  phoneNumber?: string
}

export default function Hero({
  headline,
  subheadline,
  ctaText,
  ctaLink = '/connect',
  backgroundImage,
  locationName,
  showPhone = false,
  phoneNumber,
}: HeroProps) {
  const t = useTranslations('home')
  const tLanding = useTranslations('landing')
  const tCommon = useTranslations('common')

  const displayHeadline = locationName
    ? tLanding('heroHeadline', { location: locationName })
    : headline || t('heroHeadline')

  const displaySubheadline = locationName
    ? tLanding('heroSubheadline')
    : subheadline || t('heroSubheadline')

  const displayCta = locationName
    ? tLanding('ctaButton', { location: locationName })
    : ctaText || t('ctaButton')

  // Landing page variant: full-width gradient
  if (locationName) {
    return (
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {backgroundImage && (
          <div className="absolute inset-0">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}

        <div className="relative container-custom py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6 text-balance">
              {displayHeadline}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              {displaySubheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={ctaLink} className="btn-accent text-lg px-8 py-4">
                {displayCta}
              </Link>
              {showPhone && phoneNumber && (
                <a
                  href={`tel:${phoneNumber.replace(/\D/g, '')}`}
                  className="inline-flex items-center justify-center text-lg px-8 py-4 font-semibold text-white bg-white/10 rounded-full hover:bg-white hover:text-primary-700 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {phoneNumber}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>
    )
  }

  // Homepage variant: split layout matching WordPress
  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text content */}
          <div className="py-20 md:py-28 lg:py-36">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white mb-6 text-balance leading-tight">
              {displayHeadline}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed">
              {displaySubheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={ctaLink} className="btn-primary text-base px-8 py-3">
                {displayCta}
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative h-[550px] overflow-hidden">
              <Image
                src="/images/hero-main.png"
                alt="Sinus Care Specialists"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
