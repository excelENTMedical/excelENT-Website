import Image from 'next/image'
import EyebrowTag from './EyebrowTag'

interface StatePresence {
  abbr: string
  name: string
  svg: string
  /** intrinsic SVG dimensions (used for next/image width/height ratio) */
  w: number
  h: number
}

const states: StatePresence[] = [
  { abbr: 'NC', name: 'North Carolina', svg: '/images/states/nc.svg', w: 200, h: 81 },
  { abbr: 'SC', name: 'South Carolina', svg: '/images/states/sc.svg', w: 200, h: 161 },
  { abbr: 'GA', name: 'Georgia',         svg: '/images/states/ga.svg', w: 174, h: 200 },
  { abbr: 'FL', name: 'Florida',         svg: '/images/states/fl.svg', w: 200, h: 183 },
]

export default function CustomerLogoStrip() {
  return (
    <section
      aria-labelledby="partners-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-10">
          <EyebrowTag tone="default" className="text-center">
            <span id="partners-heading">
              Trusted by independent ENT practices across the Southeast
            </span>
          </EyebrowTag>

          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl"
          >
            {states.map((s) => (
              <li
                key={s.abbr}
                className="flex flex-col items-center justify-start text-center gap-3 px-4 py-6"
              >
                <div className="h-20 md:h-24 w-full flex items-end justify-center">
                  <Image
                    src={s.svg}
                    alt={`${s.name} state outline`}
                    width={s.w}
                    height={s.h}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
                <span className="text-base md:text-lg font-semibold text-ink leading-snug">
                  {s.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
