'use client'

import { useTranslations } from 'next-intl'

interface Step {
  title: string
  description: string
  icon: React.ReactNode
}

interface ThreeStepProcessProps {
  steps?: {
    step1Title?: string
    step1Description?: string
    step2Title?: string
    step2Description?: string
    step3Title?: string
    step3Description?: string
  }
}

export default function ThreeStepProcess({ steps }: ThreeStepProcessProps) {
  const t = useTranslations('landing')

  const defaultSteps: Step[] = [
    {
      title: steps?.step1Title || t('step1Title'),
      description: steps?.step1Description || t('step1Description'),
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
    },
    {
      title: steps?.step2Title || t('step2Title'),
      description: steps?.step2Description || t('step2Description'),
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      title: steps?.step3Title || t('step3Title'),
      description: steps?.step3Description || t('step3Description'),
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {defaultSteps.map((step, index) => (
            <div key={index} className="rounded-xl overflow-hidden shadow-md bg-white">
              {/* Purple top with icon */}
              <div className="bg-gradient-to-br from-primary-700 to-primary-800 p-10 flex items-center justify-center text-white">
                {step.icon}
              </div>
              {/* White bottom with text */}
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
