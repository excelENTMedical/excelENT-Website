import type { LegalBlock } from '@/content/legal/privacy'
import MissingTranslationBanner from './MissingTranslationBanner'

interface Props {
  title: string
  lastUpdated?: string
  blocks: LegalBlock[]
  locale?: string
  pathInOtherLocale?: string
}

export default function LegalPage({
  title,
  lastUpdated,
  blocks,
  locale,
  pathInOtherLocale,
}: Props) {
  return (
    <>
      {locale && (
        <MissingTranslationBanner locale={locale} pathInOtherLocale={pathInOtherLocale} />
      )}
    <article className="bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <header className="mb-12 pb-8 border-b border-edge">
          <h1 className="heading-1-patient text-balance">{title}</h1>
          {lastUpdated && (
            <p className="byline-meta text-ink-tertiary mt-3">Last updated: {lastUpdated}</p>
          )}
        </header>
        <div className="prose-patient">
          {blocks.map((block, i) => {
            if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>
            if (block.type === 'h3') return <h3 key={i}>{block.text}</h3>
            if (block.type === 'p') return <p key={i}>{block.text}</p>
            if (block.type === 'ul') {
              return (
                <ul key={i}>
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )
            }
            return null
          })}
        </div>
      </div>
    </article>
    </>
  )
}
