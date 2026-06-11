'use client'

import { useState } from 'react'

interface FAQ {
  id: string | number
  question: string
  answer: string
}

export default function FAQAccordionPatient({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <div className="flex flex-col gap-3" role="list">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id
        return (
          <div
            key={faq.id}
            role="listitem"
            className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 md:px-7 py-5 md:py-6 text-left hover:bg-surface-alt transition-colors duration-fast"
            >
              <span className="font-cabin text-lg md:text-xl font-semibold text-ink leading-snug">
                {faq.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className={`flex-shrink-0 transition-transform duration-normal text-[color:var(--color-accent-primary)] ${isOpen ? 'rotate-180' : ''}`}
              >
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-6 md:px-7 pb-5 md:pb-6">
                <p className="body-patient text-ink-secondary">{faq.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
