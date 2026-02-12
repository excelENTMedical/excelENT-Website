'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import HubSpotForm from './HubSpotForm'

interface SpecialistCardProps {
  name: string
  credentials?: string
  practiceName: string
  photo?: string
  practiceLogo?: string
  missionStatement?: string
  phone: string
  email?: string
  address?: {
    street?: string
    city: string
    state: string
    zip?: string
  }
  specialties?: string[]
  hubspotFormId?: string
  showForm?: boolean
}

export default function SpecialistCard({
  name,
  credentials,
  practiceName,
  photo,
  practiceLogo,
  missionStatement,
  phone,
  email,
  address,
  specialties,
  hubspotFormId,
  showForm = false,
}: SpecialistCardProps) {
  const t = useTranslations('common')

  return (
    <div className="card card-hover">
      <div className="p-6">
        {/* Practice Logo */}
        {practiceLogo && (
          <div className="mb-4">
            <Image
              src={practiceLogo}
              alt={`${practiceName} logo`}
              width={160}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}

        <div className="flex items-start space-x-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            {photo ? (
              <Image
                src={photo}
                alt={name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {name}
              {credentials && (
                <span className="text-gray-500 font-normal">, {credentials}</span>
              )}
            </h3>
            <p className="text-primary-600 font-medium">{practiceName}</p>

            {specialties && specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 text-xs font-medium bg-secondary-100 text-secondary-700 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mission Statement */}
        {missionStatement && (
          <p className="mt-3 text-sm text-gray-500 italic leading-relaxed">
            {missionStatement}
          </p>
        )}

        {/* Contact Info */}
        <div className="mt-4 pt-4 border-t space-y-2">
          {address && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 mt-0.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {address.street && `${address.street}, `}
                {address.city}, {address.state}
                {address.zip && ` ${address.zip}`}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <svg
              className="w-4 h-4 text-gray-400"
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
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {phone}
            </a>
          </div>

          {email && (
            <div className="flex items-center space-x-2 text-sm">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href={`mailto:${email}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {email}
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="btn-primary flex-1 text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            {t('callNow')}
          </a>
          <button className="btn-secondary flex-1 text-sm">{t('contactUs')}</button>
        </div>
      </div>

      {/* HubSpot Form */}
      {showForm && hubspotFormId && (
        <div className="px-6 pb-6">
          <div className="border-t pt-6">
            <HubSpotForm formId={hubspotFormId} />
          </div>
        </div>
      )}
    </div>
  )
}
