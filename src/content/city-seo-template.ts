import type { CityEntry, StateEntry } from './locations'

/**
 * Templated SEO content for a city landing page. Each function returns either
 * a string or an array of paragraph strings, with `{city}`, `{state}`, and
 * `{region}` interpolated from the city/state record.
 *
 * Per the patient-site positioning: never name partner practices or call
 * doctors "ENTs" / "specialists" in copy. Use "doctor" / "we" / "ExcelENT".
 */

export interface CityContext {
  city: CityEntry
  state: StateEntry
}

function fill(template: string, ctx: CityContext) {
  return template
    .replace(/\{city\}/g, ctx.city.city)
    .replace(/\{state\}/g, ctx.state.abbr)
    .replace(/\{stateFull\}/g, ctx.state.state)
    .replace(/\{region\}/g, ctx.city.region ?? ctx.city.city)
}

const SYMPTOMS = [
  'Nasal Congestion',
  'Sinus Headaches',
  'Sinus Pressure',
  'Runny Nose',
  'Snoring',
] as const

export function getSymptoms() {
  return SYMPTOMS
}

export function heroHeadline(ctx: CityContext) {
  return `Hey ${ctx.city.city}, are you suffering from sinus pain?`
}

export function heroSubhead(ctx: CityContext) {
  return fill(
    `If chronic congestion, headaches, or sinus pressure are slowing you down in {city}, you don't have to live with it. A simple 20-minute in-office procedure is all it takes to get you back on track.`,
    ctx,
  )
}

export function valueProps(ctx: CityContext) {
  void ctx
  return [
    {
      title: 'A streamlined evaluation',
      body: 'You connect with a doctor who diagnoses the root cause of your symptoms and walks you through what treatment will look like — in plain language.',
    },
    {
      title: 'Minimally invasive treatment',
      body: 'Most patients are candidates for balloon sinuplasty — a 20-minute, in-office procedure performed under local anesthesia. No cutting bone or tissue.',
    },
    {
      title: 'Back to your life — fast',
      body: 'Most patients drive themselves home and return to normal activities the same day. No general anesthesia, no hospital stay, no week of downtime.',
    },
  ]
}

export function localTrustTitle(ctx: CityContext) {
  return fill(`Sinus relief in {city} you can trust.`, ctx)
}

export function localTrustParagraphs(ctx: CityContext): string[] {
  return [
    fill(
      `If you live in {city}, {state}, and you've been dealing with cold-like symptoms — headaches, nasal congestion, postnasal drip — that just won't go away, it's worth taking a serious look at whether you have an underlying sinus problem. Treating it sooner rather than later prevents the kind of complications that turn a manageable condition into a chronic one.`,
      ctx,
    ),
    fill(
      `ExcelENT makes it straightforward to get evaluated locally in {region}. Schedule online, and a doctor will follow up within about 36 hours to confirm your appointment and answer any early questions.`,
      ctx,
    ),
    fill(
      `Don't let a sinus infection disrupt your day-to-day in {city}. Take the first step toward relief today — most appointments are confirmed in under 24 hours.`,
      ctx,
    ),
  ]
}

export function treatmentSectionTitle(ctx: CityContext) {
  return fill(`Sinus infection treatment in {city}, {state}.`, ctx)
}

export function treatmentSectionParagraphs(ctx: CityContext): string[] {
  return [
    fill(
      `Sinus infections — painful inflammations of the air-filled passages around your nose — are common in {city} and across {stateFull}. If you're experiencing persistent cold-like symptoms, it's worth treating the possibility of a sinus infection seriously, especially if symptoms have lingered past the 10-day mark or keep returning after a course of medication.`,
      ctx,
    ),
    fill(
      `Common symptoms include facial pressure, headaches, postnasal drip, tooth pain, discolored nasal discharge, fever, and fatigue. Local doctors in {city} can prescribe antibiotics where appropriate, recommend nasal saline rinses or sprays, and — for chronic or recurring cases — discuss whether balloon sinuplasty is right for you.`,
      ctx,
    ),
    fill(
      `For most {city} patients, a path to lasting relief looks like this: get evaluated, try non-invasive treatments first, and consider an in-office procedure if those don't fully resolve the issue. We'll walk you through every step.`,
      ctx,
    ),
  ]
}

export function symptomsSectionTitle(ctx: CityContext) {
  void ctx
  return 'Sinus infection: symptoms, causes, and treatments.'
}

export function symptomsSectionParagraphs(ctx: CityContext): { heading?: string; text: string }[] {
  return [
    {
      heading: 'Identifying symptoms',
      text: fill(
        `Symptoms of sinus infections vary, but commonly include facial pressure, nasal congestion, postnasal drip, tooth pain, colored nasal discharge, fever, fatigue, and bad breath. Getting evaluated in {city} means you can narrow down the cause quickly — viral, bacterial, allergic, or structural — and get on the right treatment path.`,
        ctx,
      ),
    },
    {
      heading: 'Common causes',
      text: `Sinusitis is most often triggered by a viral infection, which sometimes leads to a secondary bacterial infection. It can also be driven by allergies, nasal polyps, a deviated septum, or environmental irritants like smoke or air pollution. Identifying the root cause is the difference between treating symptoms again and again versus actually fixing the problem.`,
    },
    {
      heading: fill(`Local care in {city}`, ctx),
      text: fill(
        `In {city}, your doctor may prescribe antibiotics or recommend over-the-counter therapies — saline washes, steroid nasal sprays, antihistamines, and decongestants — to ease symptoms. If you've already cycled through medications without lasting relief, an in-office balloon sinuplasty may be the right next step.`,
        ctx,
      ),
    },
    {
      heading: 'Prevention and ongoing care',
      text: `Once your acute symptoms are under control, ongoing care matters. Daily saline rinses, allergy management, controlling indoor air quality, and staying hydrated all help prevent flare-ups. For chronic cases, a long-term plan with a doctor will keep you out of the antibiotic-rotation cycle.`,
    },
  ]
}

export function localFaqs(ctx: CityContext): { q: string; a: string }[] {
  const f = (s: string) => fill(s, ctx)
  return [
    {
      q: f(`Where can I get sinus infection treatment in {city}, {state}?`),
      a: f(
        `In {city}, {state} you can find sinus infection care at urgent care centers, retail clinics, primary care offices, and pharmacies for short-term symptom relief. For chronic or recurring sinus problems, a dedicated sinus visit will get you a clearer picture of what's actually going on. Schedule with ExcelENT online and a doctor will reach out within 36 hours to coordinate your appointment in the {city} area.`,
      ),
    },
    {
      q: f(`How can I book sinus infection treatment in {city}?`),
      a: f(
        `The fastest way is to book online — pick a time that works for you and we'll handle the rest. You'll get an SMS and email confirmation, and a doctor will follow up to confirm details before your visit in {city}.`,
      ),
    },
    {
      q: f(`Can I make a same-day appointment in {city}, {state}?`),
      a: f(
        `Same-day and next-day availability vary, but if your symptoms are severe or worsening, contact us through the booking flow and note the urgency. Most {city} patients are seen within five business days of scheduling.`,
      ),
    },
    {
      q: f(`How do I find a top-rated sinus doctor in {city}?`),
      a: f(
        `ExcelENT works with locally-owned clinics in {region} that we've vetted for quality and patient experience. Booking through us means you don't have to comb through reviews — you'll be connected with a doctor who treats sinus problems every day.`,
      ),
    },
    {
      q: 'Who should consider sinus infection treatment?',
      a: `If you're dealing with congestion, facial pain, fever, cough, fatigue, or tooth pain that won't quit — or if your sinus symptoms come back the moment you stop taking medication — it's worth getting evaluated. The earlier you treat the underlying cause, the easier it is to fix.`,
    },
    {
      q: f(`Are video visits available with doctors in {city}?`),
      a: `A full sinus exam usually requires an in-person visit, but telemedicine can be a useful first step for evaluating common symptoms like sinus pressure, headache, or congestion. Your doctor will tell you whether a video visit is the right place to start, or whether you should come in directly.`,
    },
  ]
}

export function ctaTitle(ctx: CityContext) {
  return fill(`Ready for sinus relief in {city}?`, ctx)
}

export function ctaBody(ctx: CityContext) {
  return fill(
    `Most appointments are confirmed in under 24 hours. No insurance? We'll help you figure it out.`,
    ctx,
  )
}
