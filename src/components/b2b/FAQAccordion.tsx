import type { ReactNode } from 'react'
import EyebrowTag from './EyebrowTag'

export type FAQItem = { question: string; answer: string }

export default function FAQAccordion({
  eyebrow = 'FAQ',
  title = 'Frequently asked',
  items,
}: {
  eyebrow?: string
  title?: ReactNode
  items: FAQItem[]
}) {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4 flex flex-col gap-3">
            <EyebrowTag tone="default">{eyebrow}</EyebrowTag>
            <h2
              id="faq-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
            >
              {title}
            </h2>
          </div>

          <div className="lg:col-span-8">
            <ul role="list" className="border-t border-edge">
              {items.map((item) => (
                <li key={item.question} className="border-b border-edge">
                  <details className="group">
                    <summary className="cursor-pointer list-none py-6 flex items-start justify-between gap-6 hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast">
                      <span className="font-display font-semibold text-lg md:text-xl text-ink leading-snug">
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-6 h-6 mt-1 text-[color:var(--color-accent-primary)] transition-transform duration-normal group-open:rotate-45"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-full h-full"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="pb-6 pr-12 text-base text-ink-secondary leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
