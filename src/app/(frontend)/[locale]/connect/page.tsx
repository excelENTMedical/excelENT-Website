import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import QualificationQuiz from '@/components/QualificationQuiz'
import { Link } from '@/i18n/routing'

interface ConnectPageProps {
  params: Promise<{ locale: string }>
}

export default async function ConnectPage({ params }: ConnectPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">Connect With Us</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              Take the first step towards sinus relief. Answer a few questions to
              see if you may be a candidate for balloon sinuplasty, or connect
              directly with a specialist in your area.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Quiz Section */}
            <div>
              <h2 className="heading-3 text-gray-900 mb-4">
                Do You Qualify for Balloon Sinuplasty?
              </h2>
              <p className="text-gray-600 mb-8">
                Answer a few quick questions to see if you may be a candidate for
                this minimally invasive sinus treatment.
              </p>
              <QualificationQuiz />
            </div>

            {/* Contact Form Section */}
            <div>
              <h2 className="heading-3 text-gray-900 mb-4">
                Have Questions? Contact Us
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and one of our patient coordinators will
                reach out to help you find a specialist in your area.
              </p>

              <form className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City/Zip Code *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    placeholder="Enter your city or zip code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    How can we help you?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your sinus symptoms or questions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    required
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to receive communications from ExcelENT Medical and
                    understand that my information will be handled according to the{' '}
                    <a href="#" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <button type="submit" className="w-full btn-primary text-lg py-4">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Options */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-12">
            Other Ways to Connect
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Call Us */}
            <div className="text-center p-8 rounded-xl bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Call Us Directly
              </h3>
              <p className="text-gray-600 mb-4">
                Speak with a patient coordinator who can answer your questions
                and help you find a specialist.
              </p>
              <a
                href="tel:1-800-EXCEL-ENT"
                className="text-xl font-semibold text-primary-600 hover:text-primary-700"
              >
                1-800-EXCEL-ENT
              </a>
            </div>

            {/* Find Specialist */}
            <div className="text-center p-8 rounded-xl bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-secondary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Find a Specialist
              </h3>
              <p className="text-gray-600 mb-4">
                Browse our directory of board-certified ENT specialists in your
                area.
              </p>
              <Link
                href="/find-specialist"
                className="inline-block text-primary-600 font-medium hover:text-primary-700"
              >
                View Directory →
              </Link>
            </div>

            {/* Learn More */}
            <div className="text-center p-8 rounded-xl bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Learn More
              </h3>
              <p className="text-gray-600 mb-4">
                Read about sinus conditions and treatment options in our
                educational resources.
              </p>
              <Link
                href="/sinus-education"
                className="inline-block text-primary-600 font-medium hover:text-primary-700"
              >
                View Resources →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
