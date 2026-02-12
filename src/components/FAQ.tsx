'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface FAQItem {
  id: string
  question: string
  answer: string | { root: unknown }
}

interface FAQProps {
  faqs?: FAQItem[]
  title?: string
  subtitle?: string
  variant?: 'two-column' | 'centered'
}

function renderAnswer(answer: string | { root: unknown }): React.ReactNode {
  if (typeof answer === 'string') {
    return answer
  }
  if (answer && typeof answer === 'object' && 'root' in answer) {
    return extractText(answer.root as LexicalNode)
  }
  return String(answer)
}

interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
}

function extractText(node: LexicalNode): string {
  if (node.type === 'text') return node.text || ''
  if (node.type === 'linebreak') return '\n'
  if (!node.children) return ''
  return node.children.map(extractText).join('')
}

export default function FAQ({ faqs, title, subtitle, variant = 'two-column' }: FAQProps) {
  const t = useTranslations('home')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const defaultFaqs: FAQItem[] = [
    {
      id: '1',
      question: 'What is Sinusitis?',
      answer:
        'Sinusitis is an inflammation or swelling of the tissue lining the sinuses. When sinuses become blocked and filled with fluid, germs can grow and cause an infection. Chronic sinusitis lasts 12 weeks or longer and affects nearly 30 million Americans each year.',
    },
    {
      id: '2',
      question: 'What Are The Symptoms Of Sinusitis?',
      answer:
        'Common symptoms include facial pain or pressure, nasal congestion, thick nasal discharge, reduced sense of smell, cough, fatigue, bad breath, and dental pain. If you experience two or more of these symptoms for 12 weeks or longer, you may have chronic sinusitis.',
    },
    {
      id: '3',
      question: 'Can Sinusitis Be Treated Effectively?',
      answer:
        'Yes! Treatment options range from medications (antibiotics, decongestants, nasal corticosteroids) to minimally invasive procedures like balloon sinuplasty. Balloon sinuplasty is an FDA-approved, in-office procedure with a 97% success rate and quick 24-48 hour recovery.',
    },
    {
      id: '4',
      question: 'How Can I Find A Sinus Specialist Or ENT Doctor In My Area?',
      answer:
        'ExcelENT connects you with board-certified ENT specialists in your area who specialize in balloon sinuplasty and minimally invasive sinus treatment. Use our Find a Specialist tool or take our qualification quiz to get started.',
    },
  ]

  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs

  if (variant === 'centered') {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-4">
            {title || t('faqTitle')}
          </h2>
          {subtitle && (
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="max-w-3xl mx-auto space-y-4">
            {displayFaqs.map((faq, index) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">{renderAnswer(faq.answer)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Two-column layout (WordPress style)
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left column: Description */}
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-navy leading-tight mb-8">
              {t('faqHeading')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              {t('faqDescription')}
            </p>
            <Link href="/find-specialist" className="btn-primary">
              {t('ctaButton')}
            </Link>
          </div>

          {/* Right column: Accordion */}
          <div className="space-y-3">
            {displayFaqs.map((faq, index) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-secondary-600 pr-6 text-base">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 text-base leading-relaxed">
                    {renderAnswer(faq.answer)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
