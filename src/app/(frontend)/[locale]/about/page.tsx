import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  // Real leadership team pulled from WordPress
  const leadershipTeam = [
    {
      name: 'Kashif Mazhar, MD, MS',
      role: 'Founder & CEO',
      bio: 'Board-certified ENT physician and visionary founder dedicated to making advanced sinus care accessible to patients nationwide.',
    },
    {
      name: 'Kevin Monty',
      role: 'Chief Revenue Officer',
      bio: 'Drives strategic growth and partnership development across the ExcelENT specialist network.',
    },
    {
      name: 'Zack Casazza',
      role: 'Chief Financial Officer',
      bio: 'Oversees financial operations ensuring sustainable growth and value for patients, providers, and partners.',
    },
    {
      name: 'Pinal Patel, AuD',
      role: 'Director of Operations',
      bio: 'Doctor of Audiology ensuring operational excellence across all ExcelENT partner practices.',
    },
    {
      name: 'Lily Horton',
      role: 'Marketing Manager',
      bio: 'Leads patient outreach and education initiatives to help more people discover sinus relief options.',
    },
    {
      name: 'Josh Pelger',
      role: 'Director Clinical Services',
      bio: 'Directs clinical training programs for our nationwide network of ENT specialists.',
    },
    {
      name: 'Jen Pelger',
      role: 'Customer Service & Sales Support',
      bio: 'Ensures every patient receives responsive, compassionate support from the first contact through treatment.',
    },
    {
      name: 'Eric Honsberger',
      role: 'Director Patient Education & Awareness',
      bio: 'Builds educational resources and patient awareness around balloon sinuplasty and chronic sinusitis treatment.',
    },
    {
      name: 'Samir Patel',
      role: 'Director of IT',
      bio: 'Architects the technology platform that connects patients to specialists and streamlines the care journey.',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 md:py-28">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Helping the World Breathe Better with Exceptional ENT Care
          </h1>
          <p className="text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
            Putting the care back in healthcare — connecting patients with expert ENT specialists and the most advanced, minimally-invasive sinus treatments available.
          </p>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-6">
                Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-navy mb-6 leading-tight">
                Everyone deserves to breathe freely
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-5">
                At ExcelENT Medical, we&apos;re addressing chronic sinusitis through innovative medical technology and comprehensive patient support. Over 38 million Americans suffer from chronic sinusitis — yet only 5% receive the care they need.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-5">
                Our streamlined process connects patients to a sinus specialist who can diagnose the root cause of symptoms and — when appropriate — recommend a simple 20-minute in-office balloon sinuplasty procedure.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Since our founding, we&apos;ve helped over one million patients find lasting relief through balloon sinuplasty and other minimally-invasive procedures.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">1M+</div>
                  <div className="text-gray-600 text-sm md:text-base">Patients Treated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">97%</div>
                  <div className="text-gray-600 text-sm md:text-base">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">95%</div>
                  <div className="text-gray-600 text-sm md:text-base">Symptom Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">97%</div>
                  <div className="text-gray-600 text-sm md:text-base">Insurance Approval</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-center text-navy mb-14">
            What Makes excel<span className="text-primary-700">ENT</span> Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Innovation & Safety */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-navy mb-3">Innovation & Safety</h3>
              <p className="text-gray-600 leading-relaxed">
                FDA-approved technology that enables a 20-minute in-office procedure. State-of-the-art design backed by rigorous testing standards.
              </p>
            </div>

            {/* Comprehensive Care */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-navy mb-3">Comprehensive Care</h3>
              <p className="text-gray-600 leading-relaxed">
                An AI and machine-learning-based support program designed to optimize health outcomes and streamline the patient experience end-to-end.
              </p>
            </div>

            {/* Provider Network */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-lg bg-accent-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-navy mb-3">Expert Provider Network</h3>
              <p className="text-gray-600 leading-relaxed">
                Trained ENT specialists across multiple locations nationwide, delivering consistent quality care close to home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-center text-navy mb-4">
            Leadership Team
          </h2>
          <p className="text-gray-600 text-lg text-center mb-14 max-w-2xl mx-auto">
            The dedicated professionals leading ExcelENT Medical&apos;s mission to help the world breathe better.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipTeam.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <svg className="w-14 h-14 text-primary-700/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-heading text-navy mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-700 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-6 max-w-3xl mx-auto leading-tight">
            Ready To Breathe Better And Live Better?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Click below to experience the excelENT Difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-specialist" className="btn-primary text-base md:text-lg px-10 py-4">
              Find A Local Sinus Specialist
            </Link>
            <Link
              href="/connect"
              className="inline-flex items-center justify-center px-10 py-4 text-base md:text-lg font-semibold text-white bg-white/10 border border-white/30 rounded-full hover:bg-white hover:text-primary-700 transition-colors"
            >
              Take The Next Step
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
