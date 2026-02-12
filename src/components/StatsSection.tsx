'use client'

import { useTranslations } from 'next-intl'

interface StatsSectionProps {
  stats?: {
    patientsHelped?: string
    successRate?: string
    symptomImprovement?: string
    insuranceApproval?: string
  }
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const t = useTranslations('home')

  const statItems = [
    {
      value: stats?.patientsHelped || '1+ Million',
      label: t('statPatients'),
    },
    {
      value: stats?.successRate || '97%',
      label: t('statSuccess'),
    },
    {
      value: stats?.symptomImprovement || '95%',
      label: t('statSymptomImprovement'),
    },
    {
      value: stats?.insuranceApproval || '97%',
      label: t('statInsuranceApproval'),
    },
  ]

  return (
    <section className="bg-gray-100 py-14 md:py-20">
      <div className="container-custom">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-center text-gray-900 mb-12">
          {t('statsTitle')}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-navy mb-3">
                {stat.value}
              </div>
              <div className="text-base text-gray-600 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
