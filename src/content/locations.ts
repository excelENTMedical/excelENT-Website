/**
 * Cities and states where ExcelENT serves patients. Each city has a `slug` that
 * maps to a Payload `landing-pages` entry of the same slug — populating the
 * Payload doc activates a customized per-city landing page at /<slug>. When no
 * Payload doc is published, the route at src/app/(patient)/[locale]/[landingSlug]
 * renders a full SEO landing page using the data here.
 */

export interface CityEntry {
  /** City name as displayed (e.g. "Raleigh") */
  city: string
  /** URL slug, also used to look up Payload landing page docs */
  slug: string
  /** One-line blurb shown on /find-a-specialist directory cards */
  blurb?: string
  /** Optional nickname/region label inserted into the local-trust copy ("the Triangle") */
  region?: string
  /** Optional /public/images/cities/<file> for local-trust hero image. Falls back to /images/hero-main.png */
  cityImage?: string
}

export interface StateEntry {
  state: string
  abbr: string
  cities: CityEntry[]
}

export const LOCATIONS: StateEntry[] = [
  {
    state: 'North Carolina',
    abbr: 'NC',
    cities: [
      {
        city: 'Raleigh',
        slug: 'raleigh-nc-sinus-relief',
        blurb: 'Sinus care for the Triangle, Cary, and surrounding communities.',
        region: 'the Triangle',
        cityImage: '/images/cities/raleigh.jpg',
      },
      {
        city: 'Asheville',
        slug: 'asheville-nc-sinus-relief',
        blurb: 'Serving the Asheville area and Western North Carolina.',
        region: 'Western North Carolina',
        cityImage: '/images/cities/asheville.jpg',
      },
    ],
  },
  {
    state: 'South Carolina',
    abbr: 'SC',
    cities: [
      {
        city: 'Florence',
        slug: 'florence-sc-sinus-relief',
        blurb: 'Sinus care for the Pee Dee region of South Carolina.',
        region: 'the Pee Dee',
        cityImage: '/images/cities/florence.jpg',
      },
    ],
  },
  {
    state: 'Georgia',
    abbr: 'GA',
    cities: [
      {
        city: 'Savannah',
        slug: 'savannah-ga-sinus-relief',
        blurb: 'Serving Savannah and the Coastal Empire.',
        region: 'the Coastal Empire',
        cityImage: '/images/cities/savannah.jpg',
      },
    ],
  },
  {
    state: 'Florida',
    abbr: 'FL',
    cities: [
      {
        city: 'Venice',
        slug: 'venice-fl-sinus-relief',
        blurb: 'Sinus care for Venice, Sarasota, and Southwest Florida.',
        region: 'Southwest Florida',
        cityImage: '/images/cities/venice.jpg',
      },
    ],
  },
]
