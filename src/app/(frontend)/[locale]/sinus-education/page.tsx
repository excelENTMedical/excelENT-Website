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

  const rarsSymptoms = [
    'Sinus pressure',
    'Facial pain',
    'Headache',
    'Severe congestion',
    'Need for antibiotic treatment',
    'Decreased smell and taste',
    'Discolored nasal drainage',
  ]

  const chronicSymptoms = [
    'Facial tenderness or pressure (nose, eyes, forehead)',
    'Post-nasal drip',
    'Thick yellow or green nasal discharge',
    'Nasal stuffiness or obstruction',
    'Toothache, ear pain, or headache',
    'Cough and fatigue',
    'Loss of taste and smell',
    'Halitosis (bad breath)',
  ]

  const benefits = [
    { title: 'Safe and Effective', description: 'Clinical studies have indicated the Balloon Sinuplasty system to be safe and effective in relieving symptoms.' },
    { title: 'Minimally Invasive', description: 'Local anesthesia eliminates the need for general anesthesia, enabling convenient outpatient procedures.' },
    { title: 'Quick Recovery', description: 'Most people can return to normal activities within just 1-2 days — not weeks.' },
    { title: 'Improved Function', description: 'Widened sinus openings enhance drainage and ventilation, reducing facial pain, congestion, and breathing difficulties.' },
    { title: 'Reduced Complications', description: 'Lower bleeding and infection risks compared to traditional sinus surgery approaches.' },
    { title: 'FDA-Approved', description: 'Balloon sinuplasty devices are FDA-approved endoscopic catheter-based instruments specifically designed for sinus procedures.' },
  ]

  const faqItems = [
    { id: '1', question: 'Is Balloon Sinuplasty Painful?', answer: 'Generally painless due to local anesthesia, though mild discomfort or pressure sensations may occur during the procedure.' },
    { id: '2', question: 'How long does the procedure take?', answer: 'Typically 30 minutes to one hour, depending on how many sinuses require treatment.' },
    { id: '3', question: 'What is the recovery timeline?', answer: 'Most patients resume normal activities within 1-2 days. We recommend avoiding strenuous activity for at least one week.' },
    { id: '4', question: 'What are the associated risks?', answer: 'Potential complications include bleeding, infection, and damage to surrounding structures, though these are generally rare.' },
    { id: '5', question: 'How long do the results last?', answer: 'Multi-year effectiveness, varying individually based on sinusitis severity and underlying factors.' },
    { id: '6', question: 'Is it covered by insurance?', answer: 'Many insurance plans provide coverage for balloon sinuplasty. We recommend verifying coverage with your individual carrier.' },
    { id: '7', question: 'How does recovery compare to traditional surgery?', answer: 'Balloon sinuplasty recovery is very quick — patients typically return to normal activities in 1-2 days, compared to weeks or months of recovery from endoscopic sinus surgery.' },
  ]

  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 md:py-28">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Sinus Anatomy 101
          </h1>
          <p className="text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
            Learn about sinusitis — its causes, symptoms, and the treatment options available to help you breathe better and live better.
          </p>
        </div>
      </section>

      {/* Recurrent Acute Sinusitis (RARS) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-6">
                Understanding Sinusitis
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-navy mb-6 leading-tight">
                Recurrent Acute Sinusitis (RARS)
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-5">
                Acute sinusitis represents short-term inflammation frequently accompanied by infection, commonly triggered by colds or bacterial causes. Typical duration is about 10 days, potentially extending to one month, with most patients requiring minimal intervention.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong className="text-navy">Diagnostic Criteria:</strong> Four or more acute sinusitis episodes annually with symptom-free intervals — this pattern distinguishes RARS from chronic variants, where symptoms persist continuously.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold font-heading text-navy mb-4">Characteristic Symptoms</h3>
              <ul className="space-y-3">
                {rarsSymptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Chronic Sinusitis */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-white rounded-2xl p-8 shadow-sm order-2 lg:order-1">
              <h3 className="text-xl font-bold font-heading text-navy mb-4">Symptoms of Chronic Sinusitis</h3>
              <ul className="space-y-3">
                {chronicSymptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 text-sm font-semibold rounded-full mb-6">
                The Long-Term Condition
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-navy mb-6 leading-tight">
                Chronic Sinusitis
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-5">
                Persistent sinus inflammation lasting 12+ weeks characterizes this condition. Your sinuses comprise four paired cavities — ethmoidal, sphenoidal, frontal, and maxillary — interconnected by minute channels.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-5">
                Normal sinus function involves mucus production and drainage through nasal canals, filtering bacteria. When blockage occurs, fluid accumulation enables infection development.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong className="text-navy">Key distinction:</strong> Chronic sinusitis doesn&apos;t go away for long periods — unlike recurrent variants where symptom-free intervals occur between episodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Balloon Sinuplasty Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-6">
              The Treatment
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy mb-6 leading-tight">
              Balloon Sinuplasty
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-5">
              A minimally-invasive procedure addressing chronic sinusitis. A flexible balloon catheter is inserted nasally, then gently inflated to widen sinus openings — facilitating improved drainage and ventilation, all under local anesthesia.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              <strong className="text-navy">Recovery profile:</strong> Patients typically resume normal activities within 1-2 days, demonstrating significantly faster recuperation than traditional surgery.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-heading text-navy mb-6 text-center">Are You a Candidate?</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-navy mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Good Candidates
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Chronic sinusitis diagnosis</li>
                  <li>• Inadequate response to medications</li>
                  <li>• Relatively normal sinus anatomy</li>
                  <li>• No bleeding disorders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-navy mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Not Recommended
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Severely blocked sinuses</li>
                  <li>• Extensive sinus scarring</li>
                  <li>• Severe respiratory complications</li>
                  <li>• Active bleeding disorders</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6 italic">
              Pre-procedure evaluation typically includes CT imaging, MRI, or nasal endoscopy.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-center text-navy mb-4">
            Benefits of Balloon Sinuplasty
          </h2>
          <p className="text-gray-600 text-lg text-center mb-14 max-w-2xl mx-auto">
            A proven, patient-friendly alternative to traditional sinus surgery.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-heading text-navy mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-navy mb-6">
            Patient Success Story
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Learn about Audrey&apos;s journey from debilitating sinusitis to freedom from pain and congestion.
          </p>
          <div className="max-w-3xl mx-auto">
            <VideoEmbed
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              title="Audrey's Story - Balloon Sinuplasty Success"
            />
          </div>
        </div>
      </section>

      <FAQ
        faqs={faqItems}
        title="Balloon Sinuplasty FAQ"
        subtitle="Common questions about the procedure, recovery, and what to expect."
      />

      {/* Disclaimer */}
      <section className="py-10 bg-gray-50 border-t border-gray-200">
        <div className="container-custom max-w-4xl">
          <p className="text-xs text-gray-500 leading-relaxed italic text-center">
            The educational information presented here is not medical advice. Consult your physician for individualized treatment determination. Procedure risks should be fully explained by your healthcare provider. Outcomes and comfort levels vary by patient.
          </p>
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
