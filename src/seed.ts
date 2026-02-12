import { getPayload } from 'payload'
import config from './payload.config'

function makeLexicalContent(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              detail: 0,
              mode: 'normal' as const,
              version: 1,
              text,
            },
          ],
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr' as const,
    },
  }
}

function makeArticleContent(htmlSections: Array<{ type: 'paragraph' | 'heading' | 'list'; tag?: string; text?: string; items?: string[] }>) {
  const children: unknown[] = []
  for (const section of htmlSections) {
    if (section.type === 'heading') {
      children.push({
        type: 'heading',
        format: '',
        indent: 0,
        version: 1,
        tag: section.tag || 'h2',
        children: [
          { type: 'text', format: 0, style: '', detail: 0, mode: 'normal', version: 1, text: section.text || '' },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })
    } else if (section.type === 'paragraph') {
      children.push({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          { type: 'text', format: 0, style: '', detail: 0, mode: 'normal', version: 1, text: section.text || '' },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })
    } else if (section.type === 'list' && section.items) {
      children.push({
        type: 'list',
        format: '',
        indent: 0,
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
        children: section.items.map((item) => ({
          type: 'listitem',
          format: '',
          indent: 0,
          version: 1,
          value: 1,
          children: [
            { type: 'text', format: 0, style: '', detail: 0, mode: 'normal', version: 1, text: item },
          ],
          direction: 'ltr',
          textFormat: 0,
          textStyle: '',
        })),
        direction: 'ltr',
      })
    }
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  }
}

async function seed() {
  console.log('Seeding database...')

  const payload = await getPayload({ config })

  // Delete existing data to re-seed
  console.log('Clearing existing data...')
  const collections = ['landing-pages', 'testimonials', 'articles', 'faqs', 'specialists'] as const
  for (const collection of collections) {
    const existing = await payload.find({ collection, limit: 100 })
    for (const doc of existing.docs) {
      await payload.delete({ collection, id: doc.id })
    }
    console.log(`  Cleared ${collection}: ${existing.docs.length} docs`)
  }

  // 1. Create Specialists (matching WordPress site)
  console.log('Creating specialists...')
  const specialistsData = [
    {
      name: 'Coastal Ear, Nose & Throat',
      credentials: '',
      practiceName: 'Coastal Ear, Nose & Throat',
      phone: '(912) 597-2878',
      email: 'info@coastalent.com',
      address: { street: '4849 Paulsen St', city: 'Savannah', state: 'GA', zip: '31405' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sinus Surgery' }],
      location: 'savannah-ga',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'East Texas Sinus Center',
      credentials: '',
      practiceName: 'East Texas Sinus & Dizziness Center',
      phone: '(430) 209-5700',
      email: 'info@easttexassinus.com',
      address: { city: 'Tyler', state: 'TX' },
      specialties: [{ specialty: 'Chronic Sinusitis' }, { specialty: 'Balloon Sinuplasty' }],
      location: 'tyler-tx',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'Florence ENT',
      credentials: '',
      practiceName: 'Florence ENT & Facial Plastic Surgery',
      phone: '(843) 942-1274',
      email: 'info@florenceent.com',
      address: { city: 'Florence', state: 'SC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Facial Plastic Surgery' }],
      location: 'florence-sc',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'Triangle Sinus Center',
      credentials: '',
      practiceName: 'Triangle Sinus Center',
      phone: '(984) 464-3984',
      email: 'info@trianglesinus.com',
      address: { city: 'Raleigh', state: 'NC' },
      specialties: [{ specialty: 'Sinus Surgery' }, { specialty: 'Balloon Sinuplasty' }],
      location: 'raleigh-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Mountain ENT',
      credentials: '',
      practiceName: 'Mountain Ear, Nose & Throat',
      phone: '(828) 633-3090',
      email: 'info@mountainent.com',
      address: { city: 'Spruce Pine', state: 'NC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Allergy Treatment' }],
      location: 'spruce-pine-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Island ENT',
      credentials: '',
      practiceName: 'Island ENT',
      phone: '(941) 205-9444',
      email: 'info@islandent.com',
      address: { city: 'Sarasota', state: 'FL' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sleep Apnea' }],
      location: 'sarasota-fl',
      featured: false,
      acceptingNewPatients: true,
    },
  ]

  const createdSpecialists: Record<string, number> = {}
  for (const data of specialistsData) {
    const s = await payload.create({ collection: 'specialists', data: data as never })
    createdSpecialists[data.name] = s.id as number
    console.log(`  Created specialist: ${data.name}`)
  }

  // 2. Create FAQs (matching WordPress site)
  console.log('Creating FAQs...')
  const faqsData = [
    {
      question: 'What is Sinusitis?',
      answer: makeLexicalContent('Sinusitis is an inflammation or swelling of the tissue lining the sinuses. When sinuses become blocked and filled with fluid, germs can grow and cause an infection. Chronic sinusitis lasts 12 weeks or longer and affects nearly 30 million Americans each year. It can be caused by infections, nasal polyps, a deviated septum, or allergies.'),
      category: 'general' as const,
      order: 1,
    },
    {
      question: 'What are the Symptoms of Sinusitis?',
      answer: makeLexicalContent('Common symptoms of sinusitis include facial pain or pressure, nasal congestion, thick nasal discharge, reduced sense of smell, cough, fatigue, bad breath, fever, and dental pain. If you experience two or more of these symptoms for 12 weeks or longer, you may have chronic sinusitis and should consult with a specialist.'),
      category: 'general' as const,
      order: 2,
    },
    {
      question: 'Can Sinusitis Be Treated Effectively?',
      answer: makeLexicalContent('Yes! Treatment options range from medications (antibiotics, decongestants, nasal corticosteroids) to minimally invasive procedures like balloon sinuplasty. Balloon sinuplasty is an FDA-approved, in-office procedure that uses a small balloon catheter to open blocked sinus passages. It has a 97% success rate, 95% symptom improvement, and most patients return to normal activities within 24-48 hours.'),
      category: 'treatment' as const,
      order: 3,
    },
    {
      question: 'How can I find a sinus specialist or ENT doctor in my area?',
      answer: makeLexicalContent('ExcelENT connects you with board-certified ENT specialists in your area who specialize in balloon sinuplasty and minimally invasive sinus treatment. Use our Find a Specialist tool to search by location, or take our quick qualification quiz to get matched with a local specialist who can help you breathe better.'),
      category: 'general' as const,
      order: 4,
    },
    {
      question: 'Is balloon sinuplasty covered by insurance?',
      answer: makeLexicalContent('Yes, balloon sinuplasty is FDA-approved and covered by most major insurance plans, including Medicare. Our specialists have a 97% insurance approval rate and will work with your insurance company to verify coverage and help you understand any out-of-pocket costs.'),
      category: 'insurance' as const,
      order: 5,
    },
    {
      question: 'How long is the recovery from balloon sinuplasty?',
      answer: makeLexicalContent('Most patients return to normal activities within 24-48 hours after the procedure. Unlike traditional sinus surgery, balloon sinuplasty requires no cutting or removal of bone and tissue, which means faster recovery and less discomfort.'),
      category: 'recovery' as const,
      order: 6,
    },
    {
      question: 'Is the balloon sinuplasty procedure painful?',
      answer: makeLexicalContent('Most patients report little to no pain during the procedure. Local anesthesia is used to ensure comfort. After the procedure, patients may experience mild pressure or congestion, but this typically resolves within a few days.'),
      category: 'balloon-sinuplasty' as const,
      order: 7,
    },
    {
      question: 'What is the success rate of balloon sinuplasty?',
      answer: makeLexicalContent('Clinical studies show that balloon sinuplasty has a success rate of 97%, with 95% of patients experiencing significant improvement in their symptoms. The results are long-lasting, with studies showing sustained benefits for years after the procedure.'),
      category: 'general' as const,
      order: 8,
    },
  ]

  const createdFaqs: Record<string, number> = {}
  for (const data of faqsData) {
    const f = await payload.create({ collection: 'faqs', data: data as never })
    createdFaqs[data.question] = f.id as number
    console.log(`  Created FAQ: ${data.question.substring(0, 40)}...`)
  }

  // 3. Create Articles
  console.log('Creating articles...')
  const articlesData = [
    {
      title: 'Understanding Chronic Sinusitis: Causes and Symptoms',
      slug: 'understanding-chronic-sinusitis',
      excerpt: 'Learn about the common causes of chronic sinusitis and how to recognize the symptoms that may indicate you need treatment.',
      content: makeArticleContent([
        { type: 'paragraph', text: 'Chronic sinusitis is a common condition that affects millions of Americans each year. Unlike acute sinusitis, which typically resolves within a few weeks, chronic sinusitis persists for 12 weeks or longer, despite treatment attempts.' },
        { type: 'heading', tag: 'h2', text: 'What Causes Chronic Sinusitis?' },
        { type: 'paragraph', text: 'Several factors can contribute to the development of chronic sinusitis:' },
        { type: 'list', items: ['Nasal polyps: These tissue growths can block the nasal passages or sinuses.', 'Deviated septum: A crooked septum can restrict or block sinus passages.', 'Respiratory tract infections: Infections can inflame and thicken sinus membranes.', 'Allergies: Inflammation from allergies can block your sinuses.', 'Other medical conditions: Complications of conditions such as cystic fibrosis, HIV, and other immune system-related diseases.'] },
        { type: 'heading', tag: 'h2', text: 'Recognizing the Symptoms' },
        { type: 'paragraph', text: 'Common signs and symptoms of chronic sinusitis include:' },
        { type: 'list', items: ['Thick, discolored discharge from the nose or drainage down the back of the throat', 'Nasal obstruction or congestion, causing difficulty breathing through your nose', 'Pain, tenderness, and swelling around your eyes, cheeks, nose, or forehead', 'Reduced sense of smell and taste', 'Cough, bad breath, fatigue, and dental pain'] },
        { type: 'paragraph', text: 'Other signs and symptoms can include ear pain, headache, aching in your upper jaw and teeth, cough or throat clearing, sore throat, bad breath, and fatigue.' },
        { type: 'heading', tag: 'h2', text: 'When to Seek Treatment' },
        { type: 'paragraph', text: "If you've been experiencing these symptoms for 12 weeks or longer, it's time to consult with a specialist. Early diagnosis and treatment can help prevent complications and improve your quality of life." },
      ]),
      category: 'sinus-health' as const,
      publishedDate: '2024-01-15T00:00:00.000Z',
      author: 'ExcelENT Medical',
      status: 'published' as const,
    },
    {
      title: 'Balloon Sinuplasty vs. Traditional Sinus Surgery',
      slug: 'balloon-sinuplasty-vs-traditional-surgery',
      excerpt: 'Compare the benefits and differences between balloon sinuplasty and traditional endoscopic sinus surgery.',
      content: makeArticleContent([
        { type: 'paragraph', text: 'When medications fail to provide relief from chronic sinusitis, surgery may be recommended. Two main surgical options are available: traditional endoscopic sinus surgery (ESS) and balloon sinuplasty. Understanding the differences can help you make an informed decision.' },
        { type: 'heading', tag: 'h2', text: 'Traditional Endoscopic Sinus Surgery (ESS)' },
        { type: 'paragraph', text: 'Traditional sinus surgery involves removing bone and tissue to enlarge the sinus opening and allow proper drainage. This procedure:' },
        { type: 'list', items: ['Is typically performed in an operating room under general anesthesia', 'Involves cutting and removal of tissue', 'May require packing of the nasal cavity', 'Has a recovery time of 1-2 weeks', 'Is effective for severe cases with polyps or structural issues'] },
        { type: 'heading', tag: 'h2', text: 'Balloon Sinuplasty' },
        { type: 'paragraph', text: 'Balloon sinuplasty is a minimally invasive alternative that uses a small balloon to open blocked sinus passages. This procedure:' },
        { type: 'list', items: ['Can be performed in-office under local anesthesia', 'Requires no cutting or removal of bone and tissue', 'Has minimal bleeding and no packing required', 'Has a recovery time of just 24-48 hours', 'Achieves a 97% success rate in clinical studies'] },
        { type: 'heading', tag: 'h2', text: 'Which Is Right for You?' },
        { type: 'paragraph', text: "The best option depends on your specific condition. Balloon sinuplasty is ideal for patients with chronic sinusitis who haven't responded to medication but don't have severe structural issues. Traditional surgery may be necessary for patients with nasal polyps or significant anatomical abnormalities." },
        { type: 'paragraph', text: 'A consultation with a qualified ENT specialist can help determine which procedure is best for your situation.' },
      ]),
      category: 'treatment-options' as const,
      publishedDate: '2024-01-10T00:00:00.000Z',
      author: 'ExcelENT Medical',
      status: 'published' as const,
    },
    {
      title: "Patient Success: Finding Relief from Chronic Sinusitis",
      slug: 'patient-success-story-relief',
      excerpt: 'Read about how patients are finding lasting relief from chronic sinusitis through balloon sinuplasty.',
      content: makeArticleContent([
        { type: 'paragraph', text: 'Many patients suffer from chronic sinusitis for years before discovering balloon sinuplasty. This minimally invasive procedure has transformed the lives of over 1 million patients.' },
      ]),
      category: 'patient-stories' as const,
      publishedDate: '2024-01-05T00:00:00.000Z',
      author: 'ExcelENT Staff',
      status: 'published' as const,
    },
    {
      title: 'How to Prepare for Your Balloon Sinuplasty Procedure',
      slug: 'preparing-for-balloon-sinuplasty',
      excerpt: "Everything you need to know about preparing for your in-office balloon sinuplasty procedure, including what to expect on the day of treatment.",
      content: makeArticleContent([
        { type: 'paragraph', text: 'Preparation for balloon sinuplasty is straightforward. Here is everything you need to know.' },
      ]),
      category: 'treatment-options' as const,
      publishedDate: '2023-12-28T00:00:00.000Z',
      author: 'ExcelENT Staff',
      status: 'published' as const,
    },
    {
      title: '5 Tips for Managing Sinus Problems in Winter',
      slug: 'winter-sinus-tips',
      excerpt: 'Cold weather can worsen sinus symptoms. Learn practical tips for keeping your sinuses healthy during the winter months.',
      content: makeArticleContent([
        { type: 'paragraph', text: 'Winter can be especially challenging for those suffering from sinus problems. Here are 5 tips to help you manage.' },
      ]),
      category: 'sinus-health' as const,
      publishedDate: '2023-12-20T00:00:00.000Z',
      author: 'ExcelENT Staff',
      status: 'published' as const,
    },
    {
      title: 'Insurance Coverage for Balloon Sinuplasty: What You Need to Know',
      slug: 'insurance-coverage-balloon-sinuplasty',
      excerpt: 'Understanding your insurance options for balloon sinuplasty, including Medicare and private insurance coverage.',
      content: makeArticleContent([
        { type: 'paragraph', text: 'Understanding insurance coverage for balloon sinuplasty is important for your treatment planning. With a 97% insurance approval rate, most patients find that their procedure is covered.' },
      ]),
      category: 'news' as const,
      publishedDate: '2023-12-15T00:00:00.000Z',
      author: 'ExcelENT Staff',
      status: 'published' as const,
    },
  ]

  for (const data of articlesData) {
    await payload.create({ collection: 'articles', data: data as never })
    console.log(`  Created article: ${data.title.substring(0, 50)}...`)
  }

  // 4. Create Testimonial
  console.log('Creating testimonial...')
  await payload.create({
    collection: 'testimonials',
    data: {
      name: 'Maria Thompson',
      location: 'Savannah, GA',
      type: 'video',
      content: "After years of suffering from chronic sinusitis, I finally found relief through balloon sinuplasty. The procedure was quick and I was back to my normal routine within two days. I can't believe I waited so long!",
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: 5,
      specialist: createdSpecialists['Coastal Ear, Nose & Throat'],
      featured: true,
    } as never,
  })
  console.log('  Created testimonial: Maria Thompson')

  // 5. Create Landing Pages (matching WordPress locations)
  console.log('Creating landing pages...')
  const landingPagesData = [
    {
      slug: 'savannah-ga-sinusitis-specialist',
      locationName: 'Savannah',
      heroHeadline: 'Savannah, Find Relief from Chronic Sinusitis',
      heroSubheadline: 'Our board-certified specialists in Savannah offer balloon sinuplasty - get back to enjoying the coastal life without sinus problems.',
      localPhone: '(912) 597-2878',
      specialists: [createdSpecialists['Coastal Ear, Nose & Throat']],
      faqs: [createdFaqs['What is Sinusitis?'], createdFaqs['What are the Symptoms of Sinusitis?'], createdFaqs['Can Sinusitis Be Treated Effectively?']],
      stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
      status: 'published',
    },
    {
      slug: 'tyler-tx-sinus-treatment',
      locationName: 'Tyler',
      heroHeadline: 'Hey Tyler, Are You Sick and Tired of Sinus Problems?',
      heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our East Texas specialists are ready to help.',
      localPhone: '(430) 209-5700',
      specialists: [createdSpecialists['East Texas Sinus Center']],
      faqs: [createdFaqs['What is Sinusitis?'], createdFaqs['Is balloon sinuplasty covered by insurance?']],
      stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
      status: 'published',
    },
    {
      slug: 'florence-sc-sinusitis-specialists',
      locationName: 'Florence',
      heroHeadline: 'Florence, SC - Your Solution for Sinus Relief',
      heroSubheadline: 'Stop suffering from sinus problems. Our Florence specialists offer quick, in-office balloon sinuplasty treatment.',
      localPhone: '(843) 942-1274',
      specialists: [createdSpecialists['Florence ENT']],
      faqs: [createdFaqs['Can Sinusitis Be Treated Effectively?'], createdFaqs['How long is the recovery from balloon sinuplasty?']],
      stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
      status: 'published',
    },
    {
      slug: 'raleigh-nc-sinus-treatment',
      locationName: 'Raleigh',
      heroHeadline: 'Hey Raleigh, Are You Sick and Tired of Sinus Problems?',
      heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our Raleigh-area specialists are ready to help.',
      localPhone: '(984) 464-3984',
      specialists: [createdSpecialists['Triangle Sinus Center']],
      faqs: [createdFaqs['What is Sinusitis?'], createdFaqs['How long is the recovery from balloon sinuplasty?'], createdFaqs['Is balloon sinuplasty covered by insurance?']],
      stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
      tracking: { googleAnalyticsId: 'G-XXXXXXXXXX', facebookPixelId: '1234567890' },
      status: 'published',
    },
    {
      slug: 'sarasota-fl-sinus-specialists',
      locationName: 'Sarasota',
      heroHeadline: 'Sarasota, FL - Breathe Easy Again',
      heroSubheadline: 'Our Sarasota specialists help you get back to enjoying paradise without sinus problems. Quick, in-office treatment available.',
      localPhone: '(941) 205-9444',
      specialists: [createdSpecialists['Island ENT']],
      faqs: [createdFaqs['What is Sinusitis?'], createdFaqs['Is the balloon sinuplasty procedure painful?']],
      stats: { patientsHelped: '1M+', successRate: '97%', symptomImprovement: '95%', insuranceApproval: '97%' },
      status: 'published',
    },
  ]

  for (const data of landingPagesData) {
    await payload.create({ collection: 'landing-pages', data: data as never })
    console.log(`  Created landing page: ${data.slug}`)
  }

  console.log('\nSeed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
