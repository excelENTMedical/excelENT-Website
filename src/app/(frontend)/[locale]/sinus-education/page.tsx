import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import FAQ from '@/components/FAQ'
import VideoEmbed from '@/components/VideoEmbed'

interface SinusEducationPageProps {
  params: Promise<{ locale: string }>
}

export default async function SinusEducationPage({ params }: SinusEducationPageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  const symptoms = [
    {
      title: 'Facial Pain & Pressure',
      description:
        'Constant or recurring pain and pressure around your eyes, cheeks, nose, or forehead.',
      icon: '😣',
    },
    {
      title: 'Nasal Congestion',
      description:
        'Difficulty breathing through your nose due to blocked or stuffy nasal passages.',
      icon: '👃',
    },
    {
      title: 'Thick Nasal Discharge',
      description:
        'Discolored (yellow or green) mucus draining from your nose or down your throat.',
      icon: '🤧',
    },
    {
      title: 'Reduced Smell & Taste',
      description:
        'Decreased ability to smell and taste due to inflammation and congestion.',
      icon: '🍃',
    },
    {
      title: 'Headaches',
      description:
        'Persistent headaches, especially when bending forward or lying down.',
      icon: '🤕',
    },
    {
      title: 'Fatigue',
      description:
        'Feeling tired and run-down due to chronic inflammation and poor sleep quality.',
      icon: '😴',
    },
    {
      title: 'Cough',
      description:
        'Persistent cough caused by postnasal drip from inflamed sinuses.',
      icon: '🤒',
    },
    {
      title: 'Bad Breath',
      description:
        'Chronic bad breath (halitosis) caused by infected mucus and bacterial buildup in the sinuses.',
      icon: '😷',
    },
    {
      title: 'Dental Pain',
      description:
        'Pain in your upper teeth and jaw caused by pressure from inflamed sinuses above.',
      icon: '🦷',
    },
  ]

  const treatmentOptions = [
    {
      title: 'Medications',
      description:
        'Antibiotics, decongestants, and nasal corticosteroids can help manage symptoms but may not provide lasting relief.',
      pros: ['Non-invasive', 'First-line treatment'],
      cons: ['May not provide lasting relief', 'Potential side effects'],
    },
    {
      title: 'Traditional Sinus Surgery',
      description:
        'Endoscopic sinus surgery removes bone and tissue to open blocked sinuses.',
      pros: ['Effective for severe cases', 'Covered by insurance'],
      cons: ['General anesthesia required', 'Longer recovery time', 'Tissue removal'],
    },
    {
      title: 'Balloon Sinuplasty',
      description:
        'A minimally invasive procedure that uses a balloon catheter to open blocked sinuses without cutting.',
      pros: [
        'Minimally invasive',
        'In-office procedure',
        'Quick recovery (24-48 hours)',
        'No tissue removal',
        '97% success rate',
      ],
      cons: ['Not suitable for all cases'],
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">Understanding Sinus Problems</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              Learn about chronic sinusitis, its symptoms, and the treatment options
              available to help you breathe easier.
            </p>
          </div>
        </div>
      </section>

      {/* What is Chronic Sinusitis */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-2 text-gray-900 mb-6">
              What is Chronic Sinusitis?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Chronic sinusitis is a condition where the spaces inside your nose and
              head (sinuses) are swollen and inflamed for three months or longer,
              despite treatment attempts. This common condition interferes with the
              way mucus normally drains and makes your nose stuffy.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Breathing through your nose may be difficult, and the area around your
              eyes might feel swollen or tender. Chronic sinusitis can be caused by
              an infection, growths in the sinuses (nasal polyps), or swelling of
              the lining of your sinuses.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              The condition affects nearly 30 million Americans each year, making it
              one of the most common health conditions in the United States.
            </p>
          </div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-4">
            Common Symptoms
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            If you experience two or more of these symptoms for 12 weeks or longer,
            you may have chronic sinusitis.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {symptoms.map((symptom, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{symptom.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {symptom.title}
                </h3>
                <p className="text-gray-600">{symptom.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-2 text-center text-gray-900 mb-4">
            Treatment Options
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            There are several treatment options available for chronic sinusitis,
            ranging from medications to surgical procedures.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {treatmentOptions.map((option, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 ${
                  index === 2
                    ? 'bg-primary-50 border-2 border-primary-200'
                    : 'bg-gray-50'
                }`}
              >
                {index === 2 && (
                  <div className="inline-block px-3 py-1 bg-secondary-500 text-white text-xs font-semibold rounded-full mb-4">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-6">{option.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Pros</h4>
                    <ul className="space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <svg
                            className="w-4 h-4 text-secondary-500 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-600">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cons</h4>
                    <ul className="space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <svg
                            className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span className="text-gray-600">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Balloon Sinuplasty Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-2 text-gray-900 mb-6">
                About Balloon Sinuplasty
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Balloon sinuplasty is an FDA-approved, minimally invasive procedure
                that opens blocked sinus passages using a small, flexible balloon
                catheter. Unlike traditional sinus surgery, balloon sinuplasty:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Requires no cutting or removal of bone and tissue
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Can be performed in-office under local anesthesia
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Has a quick recovery time of 24-48 hours
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Provides lasting relief with a 97% success rate
                  </span>
                </li>
              </ul>
              <Link href="/connect" className="btn-primary">
                See If You Qualify
              </Link>
            </div>
            <div>
              <VideoEmbed
                url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                title="How Balloon Sinuplasty Works"
              />
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      {/* CTA */}
      <section className="section-padding bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-6">
            Ready to Learn More?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Take our qualification quiz or connect with a specialist to discuss
            your treatment options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connect" className="btn-accent text-lg px-8 py-4">
              Take the Quiz
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
