import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  const teamMembers = [
    {
      name: 'Dr. Robert Williams',
      role: 'Chief Medical Officer',
      bio: 'Board-certified otolaryngologist with over 20 years of experience in sinus treatment.',
    },
    {
      name: 'Jennifer Martinez',
      role: 'Director of Patient Relations',
      bio: 'Dedicated to ensuring every patient receives personalized care and support throughout their journey.',
    },
    {
      name: 'Dr. David Kim',
      role: 'Director of Clinical Training',
      bio: 'Leading our efforts to train physicians in the latest balloon sinuplasty techniques.',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">About ExcelENT Medical</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              We&apos;re on a mission to help millions of people breathe easier through
              innovative, minimally invasive sinus treatment options.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-2 text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At ExcelENT Medical, we believe everyone deserves to breathe freely.
                That&apos;s why we&apos;ve built a nationwide network of expert ENT
                specialists who are dedicated to providing the most advanced,
                patient-friendly sinus treatments available.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Since our founding, we&apos;ve helped over one million patients find
                lasting relief from chronic sinusitis through balloon sinuplasty
                and other minimally invasive procedures.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our commitment to innovation, education, and patient care drives
                everything we do.
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-700 mb-2">1M+</div>
                  <div className="text-gray-600">Patients Treated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-700 mb-2">97%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-700 mb-2">95%</div>
                  <div className="text-gray-600">Symptom Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-700 mb-2">97%</div>
                  <div className="text-gray-600">Insurance Approval</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Patient-First Care
              </h3>
              <p className="text-gray-600">
                Every decision we make is guided by what&apos;s best for our patients.
                We&apos;re committed to providing compassionate, personalized care.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-secondary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600">
                We continuously invest in research and training to bring patients
                the most advanced treatment options available.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-accent-100 flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-accent-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Expert Network
              </h3>
              <p className="text-gray-600">
                Our specialists are carefully selected and trained to ensure
                patients receive the highest quality care possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-12">
            Leadership Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-6">
            Join the ExcelENT Family
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a patient seeking relief or a physician looking to
            join our network, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connect" className="btn-accent text-lg px-8 py-4">
              Get Started
            </Link>
            <Link
              href="/find-specialist"
              className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4"
            >
              Find a Specialist
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
