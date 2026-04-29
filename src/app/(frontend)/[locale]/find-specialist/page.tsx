import { unstable_setRequestLocale } from 'next-intl/server'
import { getAllSpecialists } from '@/lib/payload'
import SpecialistDirectory from '@/components/SpecialistDirectory'
import { Link } from '@/i18n/routing'

interface FindSpecialistPageProps {
  params: Promise<{ locale: string }>
}

// Fallback data (used if CMS is empty)
const fallbackSpecialists = [
  {
    name: 'Coastal Ear, Nose & Throat',
    credentials: '',
    practiceName: 'Coastal Ear, Nose & Throat',
    phone: '(912) 597-2878',
    address: { city: 'Savannah', state: 'GA' },
    specialties: ['Balloon Sinuplasty', 'Sinus Surgery'],
    location: 'savannah-ga',
  },
]

// Locations grouped by state with landing page URLs
const locationGroups = [
  {
    state: 'North Carolina',
    locations: [
      { city: 'Asheville', slug: 'asheville-nc-sinus-specialists' },
      { city: 'Charlotte', slug: 'charlotte-nc-sinus-specialist' },
      { city: 'Raleigh', slug: 'raleigh-nc-sinus-treatment' },
    ],
  },
  {
    state: 'South Carolina',
    locations: [
      { city: 'Florence', slug: 'florence-sc-sinusitis-specialists' },
      { city: 'Columbia', slug: 'columbia-sc-sinus-specialist' },
      { city: 'Greenville', slug: 'greenville-sc-sinus-specialist' },
      { city: 'Myrtle Beach', slug: 'myrtle-beach-sc-sinus-specialist' },
    ],
  },
  {
    state: 'Georgia',
    locations: [
      { city: 'Savannah', slug: 'savannah-ga-sinusitis-specialist' },
    ],
  },
  {
    state: 'Florida',
    locations: [
      { city: 'Miami', slug: 'miami-fl-sinus-specialist' },
      { city: 'Fort Lauderdale', slug: 'fort-lauderdale-sinus-specialists' },
      { city: 'Sarasota', slug: 'sarasota-fl-sinus-specialists' },
      { city: 'Venice', slug: 'venice-sinus-specialists' },
    ],
  },
  {
    state: 'Texas',
    locations: [
      { city: 'Tyler', slug: 'tyler-tx-sinus-treatment' },
      { city: 'Longview', slug: 'longview-tx-sinusitis-specialists' },
    ],
  },
  {
    state: 'Minnesota',
    locations: [
      { city: 'Minneapolis', slug: 'minneapolis-sinus-specialists' },
    ],
  },
]

export default async function FindSpecialistPage({ params }: FindSpecialistPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  const cmsSpecialists = await getAllSpecialists(locale).catch(() => [])

  const specialists = cmsSpecialists.length > 0
    ? cmsSpecialists.map((s: Record<string, unknown>) => ({
        name: s.name as string,
        credentials: (s.credentials as string) || undefined,
        practiceName: s.practiceName as string,
        phone: s.phone as string,
        email: (s.email as string) || undefined,
        photo: s.photo && typeof s.photo === 'object' && (s.photo as Record<string, unknown>).url
          ? (s.photo as Record<string, string>).url
          : undefined,
        address: s.address as { street?: string; city: string; state: string; zip?: string } | undefined,
        specialties: Array.isArray(s.specialties)
          ? (s.specialties as Array<{ specialty: string }>).map((sp) => sp.specialty)
          : undefined,
        location: (s.location as string) || undefined,
      }))
    : fallbackSpecialists

  const locationMap = new Map<string, string>()
  for (const s of specialists) {
    if (s.location && s.address) {
      const label = `${s.address.city}, ${s.address.state}`
      locationMap.set(s.location, label)
    }
  }
  const locations = Array.from(locationMap.entries()).map(([value, label]) => ({ value, label }))

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 md:py-28">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Find a Local Sinus Specialist
          </h1>
          <p className="text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
            We&apos;ve made finding the top sinus specialist near you easier. Take the first step towards clearer sinuses and a healthier you.
          </p>
        </div>
      </section>

      {/* Locations by State */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-center text-navy mb-4">
            Our Locations
          </h2>
          <p className="text-gray-600 text-lg text-center mb-14 max-w-2xl mx-auto">
            Board-certified ENT specialists across the country, bringing advanced sinus care close to home.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locationGroups.map((group) => (
              <div key={group.state} className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 md:p-8 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold font-heading text-primary-700 mb-5 pb-3 border-b border-primary-200">
                  {group.state}
                </h3>
                <ul className="space-y-3">
                  {group.locations.map((loc) => (
                    <li key={loc.slug}>
                      <Link
                        href={`/${loc.slug}` as never}
                        className="flex items-center gap-2 text-navy hover:text-primary-700 font-medium transition-colors group"
                      >
                        <svg className="w-4 h-4 text-primary-500 group-hover:text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{loc.city}</span>
                        <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialist Directory (searchable list) */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-center text-navy mb-4">
            Featured Specialists
          </h2>
          <p className="text-gray-600 text-lg text-center mb-12 max-w-2xl mx-auto">
            Search our directory of trusted ENT specialists by location.
          </p>
        </div>
        <SpecialistDirectory specialists={specialists} locations={locations} />
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-6 max-w-3xl mx-auto leading-tight">
            Don&apos;t See a Specialist in Your Area?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            We&apos;re always expanding our network. Contact us and we&apos;ll help you find a qualified specialist near you.
          </p>
          <Link href="/connect" className="btn-primary text-base md:text-lg px-10 py-4">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
