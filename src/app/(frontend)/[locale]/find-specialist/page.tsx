import { unstable_setRequestLocale } from 'next-intl/server'
import { getAllSpecialists } from '@/lib/payload'
import SpecialistDirectory from '@/components/SpecialistDirectory'

interface FindSpecialistPageProps {
  params: Promise<{ locale: string }>
}

// Fallback data
const fallbackSpecialists = [
  {
    name: 'Dr. Sarah Johnson',
    credentials: 'MD, FACS',
    practiceName: 'Carolina Sinus & Allergy Center',
    phone: '(919) 555-0123',
    email: 'contact@carolinasinus.com',
    address: { street: '123 Medical Plaza', city: 'Raleigh', state: 'NC', zip: '27601' },
    specialties: ['Balloon Sinuplasty', 'Sinus Surgery'],
    location: 'raleigh-nc',
  },
  {
    name: 'Dr. Michael Chen',
    credentials: 'MD',
    practiceName: 'Coastal ENT Associates',
    phone: '(912) 555-0456',
    email: 'info@coastalent.com',
    address: { street: '456 Harbor Drive', city: 'Savannah', state: 'GA', zip: '31401' },
    specialties: ['Chronic Sinusitis', 'Allergy Treatment'],
    location: 'savannah-ga',
  },
  {
    name: 'Dr. Emily Rodriguez',
    credentials: 'MD, FAAOA',
    practiceName: 'Florence Sinus Specialists',
    phone: '(843) 555-0789',
    email: 'hello@florencesinus.com',
    address: { street: '789 Palmetto Street', city: 'Florence', state: 'SC', zip: '29501' },
    specialties: ['Pediatric ENT', 'Balloon Sinuplasty'],
    location: 'florence-sc',
  },
  {
    name: 'Dr. James Wilson',
    credentials: 'MD, FACS',
    practiceName: 'Venice Sinus & Sleep Center',
    phone: '(941) 555-0321',
    email: 'appointments@venicesinus.com',
    address: { street: '321 Gulf Coast Blvd', city: 'Venice', state: 'FL', zip: '34285' },
    specialties: ['Balloon Sinuplasty', 'Sleep Apnea'],
    location: 'venice-fl',
  },
  {
    name: 'Dr. Lisa Park',
    credentials: 'MD',
    practiceName: 'Triangle ENT Center',
    phone: '(919) 555-0654',
    address: { street: '654 Research Triangle', city: 'Durham', state: 'NC', zip: '27701' },
    specialties: ['Sinus Surgery', 'Rhinoplasty'],
    location: 'raleigh-nc',
  },
  {
    name: 'Dr. Robert Martinez',
    credentials: 'MD, FACS',
    practiceName: 'Lowcountry Sinus Care',
    phone: '(843) 555-0987',
    address: { city: 'Charleston', state: 'SC', zip: '29401' },
    specialties: ['Balloon Sinuplasty', 'Chronic Sinusitis'],
    location: 'charleston-sc',
  },
]

export default async function FindSpecialistPage({ params }: FindSpecialistPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  const cmsSpecialists = await getAllSpecialists(locale).catch(() => [])

  // Map CMS data to component props
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

  // Derive location options dynamically from specialist data
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
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">Find a Specialist Near You</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              Connect with board-certified ENT specialists in your area who are
              experienced in balloon sinuplasty and minimally invasive sinus
              treatment.
            </p>
          </div>
        </div>
      </section>

      <SpecialistDirectory specialists={specialists} locations={locations} />

      {/* CTA */}
      <section className="section-padding bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-6">
            Don&apos;t See a Specialist in Your Area?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            We&apos;re always expanding our network. Contact us and we&apos;ll help you
            find a qualified specialist near you.
          </p>
          <a href="/connect" className="btn-accent text-lg px-8 py-4">
            Contact Us
          </a>
        </div>
      </section>
    </>
  )
}
