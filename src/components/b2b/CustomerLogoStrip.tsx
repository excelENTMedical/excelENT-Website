import EyebrowTag from './EyebrowTag'

/**
 * CustomerLogoStrip — TODO: PRE-PRODUCTION
 *
 * Currently renders text-only placeholders pending real logo assets from
 * partner practices (Q17 sign-off in DESIGN_BRIEF). Before shipping:
 *   1. Drop logo image files into /public/images/customers/
 *      (e.g. coastal-ent.png, florence-ent.png, mountain-ent.png,
 *       island-ent.png, triangle-sinus.png)
 *   2. Replace each <li> body with <Image> referencing the asset.
 *   3. Confirm marketing-clearance per practice before logos appear publicly.
 *   4. Keep the location subtitle for context.
 */
const partners: Array<{ name: string; location: string }> = [
  { name: 'Coastal ENT', location: 'Savannah, GA' },
  { name: 'Florence ENT', location: 'Florence, SC' },
  { name: 'Mountain ENT', location: 'Asheville, NC' },
  { name: 'Island ENT', location: 'Coastal NC' },
  { name: 'Triangle Sinus', location: 'Raleigh, NC' },
]

export default function CustomerLogoStrip() {
  return (
    <section
      aria-labelledby="partners-heading"
      className="bg-surface border-b border-edge"
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-8">
          <EyebrowTag tone="default" className="text-center">
            <span id="partners-heading">
              Trusted by independent ENT practices
            </span>
          </EyebrowTag>

          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2 w-full max-w-5xl"
          >
            {partners.map((p) => (
              <li
                key={p.name}
                className="flex flex-col items-center justify-center text-center px-4 py-6 md:py-8 hover:bg-surface-alt transition-colors duration-fast"
              >
                <span className="font-display font-bold text-base md:text-lg text-ink leading-tight tracking-tight">
                  {p.name}
                </span>
                <span className="text-xs text-ink-tertiary mt-2">
                  {p.location}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
