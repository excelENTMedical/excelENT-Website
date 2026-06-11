# Information Architecture: patients.excelentmedical.com

Sister artifact to `.design/b2b-rebuild/INFORMATION_ARCHITECTURE.md`. Reads from and extends `.design/patient-rebuild/DESIGN_BRIEF.md`.

The site exists for **one job**: get a sinusitis sufferer from "I should probably see somebody" to "I have an appointment booked," with two trust beats handled along the way (*these are real doctors* / *one is near me*). Every IA decision below is justified against that job.

---

## Site Map

```
/                                          Home
/find-a-specialist                         Specialist directory + zip-match
/specialists/[slug]                        Individual specialist profile
/schedule                                  Dedicated booking page (Pattern A widget)
/sinusitis                                 Sinusitis hub (lead-in to subpages)
/sinusitis/what-is                         What is sinusitis (verbatim from WP)
/sinusitis/symptoms                        Symptoms (verbatim from WP)
/sinusitis/management-and-treatment        Management & treatment (verbatim from WP)
/balloon-sinuplasty                        Treatment explainer (verbatim from WP, light edits)
/resources                                 Articles index (paginated, category filter)
/resources/[slug]                          Article detail
/about                                     About ExcelENT (rewritten for patient audience)
/{city}-{condition}                        Paid landing template (e.g. /raleigh-nc-sinus-treatment)
/privacy                                   Privacy policy (mirror B2B)
/terms                                     Terms (mirror B2B)
/cookies                                   Cookie policy (mirror B2B)
/hipaa                                     HIPAA notice (mirror B2B; flagged Draft)
/es/...                                    Spanish mirror of every above path
```

The English site lives at the root of `patients.excelentmedical.com`. Spanish lives under `/es/...` via `next-intl` with `localePrefix: 'as-needed'`. The B2B site at `/b2b/*` is untouched and unreachable from this subdomain (cross-domain link only via header utility area + footer).

### Why a `/sinusitis` hub instead of three flat pages

The brief allowed flat or hub. Hub wins for three reasons:
1. **SEO topical authority** — a hub page that internally links to the three subpages aggregates more topical signal than three orphans.
2. **WP URL parity** — the existing WP site uses `/sinusitis/...` URLs. The hub is the parent that hosts the 301 from `/sinusitis/` itself.
3. **Patient navigation** — patients arriving from search to "what is sinusitis" can pivot to "symptoms" or "treatment" in one click via the hub-to-sibling pattern.

### Why `/specialists/[slug]` instead of `/find-a-specialist/[slug]`

Shorter and semantically distinct. `/find-a-specialist` is the *directory*; `/specialists/[slug]` is the *canonical detail page*. Avoids triple-nested URLs (`/find-a-specialist/triangle-sinus/dr-mazhar` would be worse). Internal linking from the directory cards points cleanly to `/specialists/{slug}`.

### Why flat `/{city}-{condition}` for paid landing pages

Matches the WP convention (`/raleigh-nc-sinus-treatment-popup/` → new: `/raleigh-nc-sinus-treatment`). Drop the `-popup` suffix as part of the rewrite — it's an internal artifact, not user-facing language. Flat URLs at root are fine because:
- The hyphenated slug is descriptive enough on its own.
- They co-exist with article slugs and locale paths without collision (none of those use the `{city}-{condition}` shape).
- Google Ads quality score historically prefers shorter URLs with the keyword visible.

If we ever need a programmatic SEO matrix (deferred to phase 2), `/{condition}-in-{city}` and `/{city}-{condition}` are both fine; settle then.

---

## Navigation Model

### Primary navigation (4 items, visible on tablet+)

The four links a patient might want before they're ready to book.

1. **Sinusitis** → `/sinusitis` (the education hub; hover/tap reveals subnav with What is, Symptoms, Treatment)
2. **Find a Specialist** → `/find-a-specialist`
3. **Resources** → `/resources`
4. **About** → `/about`

That's it. Schedule is **not** a nav link; it's a button (see utility nav).

### Utility navigation (right side of header)

Smaller, lower-emphasis, sits to the right of the primary nav.

1. **Schedule an appointment** — pill button, brand purple, opens booking widget modal (Pattern C). Always visible. This is the universal CTA from the brief.
2. **EN / ES** — language toggle. Links the current path to its locale equivalent; falls back to `/es/` (Spanish home) or `/` if no equivalent.
3. **For practices →** — small text link to `excelentmedical.com/b2b`. External link, opens in new tab. Visually deemphasized (smaller, ink-tertiary color).

The order is deliberate: book first, then language, then the unrelated B2B doorway last.

### Mobile navigation (sm screens)

Drawer model (matches the B2B `MobileMenu` pattern that already works in the codebase).

- Header on mobile: logo (left), **Schedule** pill button (right, **always visible**), hamburger (right of Schedule).
- Tap hamburger → full-height drawer slides from right; backdrop dims the page; body scroll locks.
- Drawer content: primary nav (vertical stack), divider, utility nav (EN/ES toggle, For practices →), footer-style sign-off ("ExcelENT Medical").
- Esc, backdrop click, or close button (X) dismisses; focus returns to the hamburger.

The Schedule pill stays in the header bar even when the drawer is open and on every page. **It is the only CTA that survives every device size.**

### Secondary navigation (within sections)

Two contextual patterns:

**Sinusitis hub navigation.** The `/sinusitis` hub page presents the three subpages (What is, Symptoms, Treatment) as a left-side stacked nav on desktop / inline TOC on mobile. Each subpage shows a "next: …" / "previous: …" pair at the bottom plus a "Back to Sinusitis hub" breadcrumb-style link.

**Resources filter bar.** `/resources` shows a horizontal pill bar of category filters above the article grid (e.g. *All*, *Sinus health*, *Allergies*, *Treatments*, *Recovery*). Filter state lives in `?category=` query string; deep-linkable.

No global sidebar; the site is shallow enough not to need one.

---

## Content Hierarchy

For each significant page, the priority order. Items above the line are above-the-fold for the relevant breakpoint. The **Schedule an appointment** CTA appears on every page in the header, and once more inline at a body location specified per-page.

### Home `/`

1. **Hero — editorial photo + headline + primary CTA.** Full-bleed clinician/clinic photo on right, big headline + subhead + Schedule CTA on left (split on tablet+, stacked on mobile). Headline locks on the primary job: "Sinus pain, real specialists, fast appointments." Subhead names the operational promise: typically seen within five days. *Above the fold.*
2. **Trust bar.** A horizontal strip of 3-4 numbers — "5 partner practices," "1M+ patients treated," "97.5% surgical success," "< 5 days to appointment." Specific numbers, no claims. *Just below the fold.*
3. **The three-step explainer.** "We connect → They treat you → You breathe better" (the existing Raleigh landing page narrative). One sentence per step. Schedule CTA at the bottom of the section. Reinforces clarity.
4. **Find a specialist near you.** Embedded zip-match preview — shows partner-practice cities on a small map or list with a "Find your specialist →" link to the full directory. Trust beat #2 ("one is near me"), with the directory as the spillover.
5. **Featured education.** 3 cards from the sinusitis education hub (What is / Symptoms / Treatment), styled as editorial article cards. Earns SEO crosslinking.
6. **Patient testimonial.** Single-card quote with patient name + city + condition. (Limited inventory — currently 1 in Payload — placeholder layout works for 1 or 3.)
7. **Inline schedule CTA.** Big, repeating, with operational reassurance ("Most appointments confirmed in under 24 hours").
8. **FAQ accordion.** Top 4-5 patient questions from `FAQs` collection. Reuses B2B's `FAQAccordion`.
9. **Footer.**

### Find a Specialist `/find-a-specialist`

1. **Page hero with zip input.** "Find a sinus specialist near you." Compact hero. Single-input form: zip code → "Find specialists near me" button. *Above the fold.*
2. **Suggestion banner (after zip submit).** "Closest to you: Triangle Sinus in Raleigh, NC — 18 miles." With a Schedule CTA scoped to that practice. Renders only after zip submission.
3. **Specialist grid.** All 16 `Specialists`, ordered by distance from the entered zip (default order = no zip = grouped by city, alphabetical). Each card: photo, name + credentials, practice, city, top 2-3 specialties, "Schedule" + "View profile" CTAs.
4. **Filter sidebar (desktop) / collapsible (mobile).** City filter, specialty filter. Filter state in querystring.
5. **"Outside our footprint?" fallback section.** Banner near the bottom: "We currently partner with 5 practices in the Southeast. Outside our area? Contact us — we'll point you to a trusted ENT in your region." Honest about the geographic scope per Q3 = "national but honest."
6. **Footer.**

### Specialist detail `/specialists/[slug]`

1. **Specialist hero.** Photo (full-bleed left half on desktop, stacked top on mobile), name + credentials + practice + city, "Schedule" CTA. *Above the fold.*
2. **Quick facts strip.** "Years in practice," "Specialties," "Languages spoken," "Insurance accepted." Minimal claims.
3. **Bio.** Localized rich text from Payload. Set in `ConditionContent` typography.
4. **Practice info card.** Address, phone (tap-to-call on mobile), hours, map link. Sidebar on desktop / inline on mobile.
5. **Schedule CTA inline.** Big purple button: "Schedule with Dr. {LastName}." Opens widget modal; once preselect ships, pre-fills the right location.
6. **Related specialists at the same practice.** Up to 3 cards.
7. **Footer.**

### Schedule `/schedule`

This page is *just* the widget. Pattern A from the integration spec — auto-init.

1. **Page hero (compact).** "Schedule your appointment." One-sentence sub: "Choose your location and time. We'll handle the rest."
2. **The widget itself.** Full-width container, generous padding around it. The widget is the entire body.
3. **Below-widget reassurance strip.** Three small icons + labels: "HIPAA-compliant," "Confirmation by SMS + email," "No insurance? We'll help."
4. **Footer.**

### Sinusitis hub `/sinusitis`

1. **Hero.** Editorial portrait of a clinician + headline: "Sinusitis, explained by ENTs." Subhead: "Understand what's happening, what's normal, and when to get help." *Above the fold.*
2. **The three pillar pages as cards.** What is sinusitis / Symptoms / Management & treatment. Each card has a 1-sentence preview and a "Read →" link. Visually equivalent — no preferential ordering.
3. **One-paragraph "When should I see a doctor?" callout** with Schedule CTA.
4. **FAQ accordion.** Top sinusitis-specific questions from `FAQs`.
5. **Footer.**

### Sinusitis subpages `/sinusitis/{what-is,symptoms,management-and-treatment}`

Reading-optimized layout. Verbatim content from WP per Q9 = hybrid (medical/educational verbatim).

1. **Compact page hero.** Page title + 1-sentence summary. Breadcrumb back to `/sinusitis`.
2. **Body.** Long-form prose (`ConditionContent`). Inline subheadings (H2, H3). Capped at ~70ch column width. Optional pull quotes. Inline images where the WP source had them.
3. **Inline Schedule CTA after section 1 of body.** A break-out block: "Sound familiar? Talk to a sinus specialist." Widget modal trigger.
4. **Next/previous pair at bottom.** "Next: Symptoms →" / "← Back to Sinusitis hub."
5. **Footer.**

### Balloon Sinuplasty `/balloon-sinuplasty`

Same structure as a sinusitis subpage, but with one extra section above the body — a stat block ("20-min procedure," "in-office," "high success rate"). Branded slightly more marketing-forward. Schedule CTA at end.

### Resources index `/resources`

1. **Compact page hero.** "Resources." Sub: "Articles by ENT specialists on sinus health, treatment, and recovery."
2. **Featured article (top).** Full-width card with a large image and a longer excerpt. Either an editorial pick or the most recent.
3. **Category filter pill bar.** Horizontal scrolling on mobile.
4. **Article grid.** 1 col mobile, 2 col tablet, 3 col desktop. 12 articles per page; pagination.
5. **Inline Schedule CTA every 6 articles** (or once at the page midpoint).
6. **Footer.**

### Article detail `/resources/[slug]`

Reading-optimized like a sinusitis subpage, plus a few content-marketing patterns.

1. **Compact page hero.** Article title, byline (author + date), category pill, est. reading time. Breadcrumb.
2. **Hero image.** Full-width.
3. **Body (`ConditionContent`).** Long-form prose, ~70ch column width on desktop.
4. **Inline Schedule CTA after section 1.**
5. **Author bio block** (if author is a partner specialist) with "Schedule with Dr. X" CTA → links to `/specialists/[slug]`.
6. **Related articles.** 3 cards from same category.
7. **Footer.**

### About `/about`

1. **Hero.** Photo of Dr. Mazhar + ExcelENT origin headline. Editorial register.
2. **Why we exist.** Long-form prose (rewritten for patient audience per Q9). First-person plural, doctor-led.
3. **The 5-practice network.** Map or grid of partner practices with cities.
4. **The team.** Reuse the four headshots (Kashif, Kevin, Josh, Eric) from the B2B `team/` directory but with patient-friendly bios (no "PEAP Director" jargon — translate to "patient connection lead").
5. **Schedule CTA at bottom.**
6. **Footer.**

### Paid landing page `/{city}-{condition}` (e.g. `/raleigh-nc-sinus-treatment`)

Conversion-tuned. **Different from the marketing pages — this is the funnel.**

1. **City-specific hero.** Headline includes city: "Sinus treatment in Raleigh, NC." Sub: operational promise. Big Schedule CTA + phone-tap secondary.
2. **Trust strip.** Same metrics as home but city-scoped if possible ("Raleigh patients seen in 5 days").
3. **The three-step explainer** (We connect / They treat / You breathe). Same narrative as home.
4. **Specialist preview.** 1-3 cards from the city's matching practice (Triangle Sinus in this Raleigh example), full-width with photo + Schedule CTAs.
5. **Condition explainer.** Compact version of the sinusitis hub's content. 3-4 paragraphs. Builds confidence without diluting the funnel.
6. **Patient testimonial.**
7. **Inline Schedule CTA** (full-width breakout section).
8. **FAQ accordion** (city-specific questions if any; otherwise general).
9. **Footer (compact).**

These pages are authored in Payload's `LandingPages` collection. The template is one React component; Payload provides the per-city / per-condition content slots.

### Legal pages `/privacy`, `/terms`, `/cookies`, `/hipaa`

Mirrored from B2B legal pages with patient-appropriate framing on the lead-in (use `PageHero` with `variant="compact"`). Same body copy. HIPAA still flagged "Draft for review" pending counsel.

---

## User Flows

### Flow A: Symptomatic patient via organic search

1. Patient searches "what is sinusitis" → lands on `/sinusitis/what-is`.
2. Reads two paragraphs. Sees inline Schedule CTA mid-article: *"Sound familiar? Talk to a sinus specialist."*
3. Decides to investigate further before booking. Clicks "Symptoms →" at bottom → `/sinusitis/symptoms`.
4. Confirms what they suspected. Clicks Schedule CTA at bottom of body.
5. Booking widget modal opens (Pattern C). Patient picks location in Step 1 (no preselect).
6. Completes 5-step widget flow.
7. Lands on widget's confirmation step. Receives SMS + email confirmation.

**Trust beats hit.** *These are real doctors* (medical content quality). *One is near me* (location selection in widget Step 1, with a list of 5 cities).

### Flow B: Symptomatic patient via paid Google Ad

1. Patient in Raleigh searches "ent doctor raleigh." Sees ad → clicks → lands on `/raleigh-nc-sinus-treatment`.
2. Hero loads: "Sinus treatment in Raleigh, NC. Most patients seen within 5 days." Schedule CTA right there.
3. Patient takes 10 seconds to skim the trust strip + 3-step. Sees Triangle Sinus specialist card with photos.
4. Clicks Schedule CTA in the hero or in the specialist card.
5. Widget opens. **Until preselect ships:** patient selects "Raleigh" in Step 1 (already primed by hero copy). **After preselect ships:** Step 1 is skipped.
6. Completes 5-step widget flow.

**Source attribution.** The widget captures `utm_source=google`, `utm_medium=cpc`, `utm_campaign=raleigh-ent-q2`, `gclid=...` automatically into ExcelVoice's `booking_sessions`. We don't need to do anything for attribution beyond embedding the widget.

### Flow C: Patient browsing for a specialist directly

1. Patient on a colleague's recommendation searches for ExcelENT directly → lands on `/`.
2. Clicks "Find a Specialist" in primary nav → `/find-a-specialist`.
3. Enters zip code → page reorders, shows "Closest to you: Mountain ENT in Asheville, NC — 12 miles" banner.
4. Clicks "View profile" on that specialist's card → `/specialists/dr-{name}`.
5. Reads bio, scrolls to Schedule CTA. Clicks.
6. Widget opens; patient picks Asheville (primed by which page they came from).
7. Completes flow.

### Flow D: Education-first patient who isn't ready to book

1. Patient reads `/sinusitis/what-is` → bookmarks for later. Bounces.
2. Returns 4 days later via direct visit. Clicks Schedule CTA.
3. Booking widget captures `referrer=direct`, no UTMs.
4. Completes flow.

(This flow exists to validate that the conversion path works without a campaign attribution chain. The Schedule CTA is universal.)

### Flow E: Spanish-speaking patient

1. Patient lands on `/` (English; default). Sees EN/ES toggle in header.
2. Clicks ES → routes to `/es/`.
3. Browses Spanish-mirrored content, hits Schedule CTA.
4. Widget opens. Widget itself may not be Spanish in v1 (ExcelVoice's responsibility — flag in handoff). If widget is English-only, document the workaround on the Spanish schedule page (+ banner: *"El proceso de reserva está actualmente en inglés"*).
5. Completes flow.

If a Spanish path doesn't exist (e.g. a paid landing page authored only in English):
- Detect missing translation in Payload at request time.
- Render a fallback page at `/es/` (Spanish home) with a banner: *"Esta página no está disponible en español. ¿Te gustaría visitar la versión en inglés?"* with a link back to the English path.
- Don't 404. Patients lost mid-flow are worse than a graceful redirect.

### Flow F: Patient outside the 5-city footprint

1. Patient in Boise lands on `/find-a-specialist`. Enters Idaho zip.
2. Distance calc returns ~1,400 miles to nearest practice.
3. Page shows the footprint banner: *"We currently partner with 5 practices in the Southeast. Outside our area? Contact us — we'll point you to a trusted ENT in your region."*
4. Patient either scrolls the directory anyway (some are willing to travel) or clicks "Contact us" → opens `mailto:` or routes to a contact form (TBD — keep simple for v1: `mailto:` to a triage inbox).

This flow keeps us **honest about scope** per Q3.

---

## Naming Conventions

Patient-facing labels. Pick one word and use it everywhere — drift kills trust.

| Concept | Label in UI | Notes |
|---|---|---|
| Booking action | **Schedule an appointment** | Universal CTA copy. Never "book" or "reserve" or "request" in the v1 site. The widget itself uses "Book" in some screens — out of our control until ExcelVoice updates copy; flag for them. |
| Booking | **Appointment** | "Book a visit" → "Schedule an appointment." Once booked, refer to it as the patient's "appointment." |
| Partner practice | **Specialist** (in nav, copy) / **Practice** (in directory, location pages) | "Find a Specialist" feels human. "Practice" is correct for the location entity. Don't say "office" or "clinic." |
| Doctor | **Specialist** when context is general; **Dr. [Name]** when specific. Never "provider" — too HMO-corporate. |
| Sinusitis | **Sinusitis** in clinical contexts; **sinus issues / sinus pain** in marketing copy. Don't simplify to "sinus" alone in headlines. |
| Treatment | **Treatment** (preferred); avoid "procedure" except where clinically required (balloon sinuplasty page may use it). |
| Patient | **You** in second person; **Patients** in stats/aggregates. Never "client," "customer," "user." |
| Education | **Sinus health** in the hub label, **Resources** for the article index. Don't mix them. |
| ENT | Spell out **otolaryngologist** once on About + Specialist detail pages, then "ENT specialist" everywhere else. ENT alone is OK after first use. |
| Insurance | **Insurance** (don't say "coverage" or "benefits"). |
| Cost | Don't volunteer cost copy in v1. If asked, FAQ entry: "Cost varies by insurance and procedure. Your specialist's office can give you a quote." |
| Phone | **Call us** for the action; **Phone** for the field label. Tap-to-call on mobile uses telephone icon + practice name, not the bare number. |
| Five days promise | **"Typically seen within five days"** — never "always," never "guaranteed." Operational reality phrased honestly. |

---

## Component Reuse Map

Maps which structural shells/containers/navigation elements appear on which pages. Lower-level component reuse (cards, buttons, etc.) lives in the Component Inventory section of the design brief.

| Component | Used on | Variations |
|---|---|---|
| `HeaderPatient` | Every page except `/{city}-{condition}` paid landings | Paid landing pages get a stripped-down header (`HeaderPatientCompact`) — logo + Schedule + phone-tap, no nav |
| `FooterPatient` | Every page except paid landings | Paid landings get `FooterPatientCompact` — single row, no link grid |
| `BookingWidgetModal` (Pattern C) | Every page (mounted globally in patient layout) | None — single global modal instance |
| `BookingWidgetInline` (Pattern A) | `/schedule` only | None |
| `PatientPageHero` | `/find-a-specialist`, `/sinusitis`, `/sinusitis/*`, `/balloon-sinuplasty`, `/resources`, `/resources/[slug]`, `/about`, `/specialists/[slug]`, legal pages | `compact` variant for legal + sinusitis subpages; `editorial` variant for `/about` and the resources index featured article |
| `EditorialHero` (the home + paid landing version) | `/`, `/{city}-{condition}` | City-specific copy slot for landing pages |
| `TrustBar` | `/`, `/{city}-{condition}` | Stats may differ per landing page (city-scoped numbers if available) |
| `ScheduleCTAInline` | All marketing + content pages | One-line CTA variant (compact) for narrow pages; full-width breakout variant for home/landing |
| `ZipCodeMatcher` | `/find-a-specialist` only | None |
| `SpecialistCard` | `/find-a-specialist`, `/`, `/{city}-{condition}`, related-specialist sections | Default vs. featured (larger, full-width on home) |
| `ArticleCard` | `/resources`, `/`, related-articles sections | Default vs. featured (larger, longer excerpt) |
| `ConditionContent` | `/sinusitis/*`, `/balloon-sinuplasty`, `/resources/[slug]`, `/about` long-form sections | None — typography is intrinsic |
| `FAQAccordion` (reused from B2B) | `/`, `/sinusitis`, `/{city}-{condition}` | None |
| `LanguageSwitcher` | Header (every page) | None |
| `MobileMenuPatient` | Header (every page) | None |
| `BackLink` (small breadcrumb-style) | `/sinusitis/*`, `/specialists/[slug]`, `/resources/[slug]` | None |

The **booking widget modal is mounted once at the layout level**, not per-page. Every Schedule CTA on every page calls a global `openBookingModal()` function. This is the cleanest way to honor the brief's universal CTA principle.

---

## Content Growth Plan

What grows over time, and how the IA absorbs growth without redesign.

### Articles (`/resources`)

19 today; expected 50-200 over 12 months. Already designed for growth: pagination (12 per page), category filter, optional search input later. URL pattern stable (`/resources/[slug]`). When the count exceeds ~60, add a featured-by-category strip on the index page; below that, the grid is fine.

### Specialists (`/find-a-specialist`)

16 today, may grow modestly (PS | Connect adds practices). Each new practice = 1 city + 1-3 specialists. The directory accommodates by adding city-grouped sections and expanding the city filter list. If practice count exceeds 15 cities, switch the directory hero from "list with filter" to "map with filter" — but defer that until needed.

### Paid landing pages (`/{city}-{condition}`)

19 today in `LandingPages` Payload, more added per campaign. URL pattern is flat at root, generated at build time from Payload entries (`generateStaticParams` from the Payload query). New entries = new routes auto-generated; no code change needed.

### FAQs

Currently 8. Reused on home + sinusitis hub + paid landings. Tagged in Payload by topic (`general`, `sinusitis`, `treatment`, `insurance`) so the right subset surfaces per page. Growth is fine; just add tags + entries.

### Sinusitis education

The 3 subpages (+ balloon sinuplasty) are the v1 lock. If we add a 5th condition page in 6 months (e.g. `/deviated-septum`), it lives at the same level — a sibling under `/sinusitis` if sinusitis-related, or a peer at the root if it's a separate condition. Keep `/sinusitis/*` reserved for sinusitis itself; broader ENT conditions get root-level slugs.

### Testimonials

1 today. As they accumulate, the home + paid-landing testimonial sections rotate through them. Once we have 6+, build a `/testimonials` aggregate page if SEO data shows demand; not in v1.

### Spanish parity

Every English page has a `/es/` equivalent. New English pages that lack a Spanish translation render the fallback banner per Flow E. The IA assumes parity is a goal, not a guarantee, and degrades gracefully.

---

## URL Strategy

### Patterns

```
/                                Home (English)
/es                              Home (Spanish, locale prefix)
/<flat-slug>                     Top-level marketing pages: /about, /find-a-specialist, /schedule, /resources, /balloon-sinuplasty, /privacy, /terms, /cookies, /hipaa
/<entity>/<slug>                 Detail pages: /specialists/[slug], /resources/[slug]
/<hub>/<sub>                     Education hub subpages: /sinusitis/what-is, /sinusitis/symptoms, /sinusitis/management-and-treatment
/<city>-<condition>              Paid landing pages: /raleigh-nc-sinus-treatment, /asheville-balloon-sinuplasty, etc. — flat at root, no segment prefix
/es/...                          Spanish mirror of all of the above
```

### Dynamic segments

| Segment | Source | Validation |
|---|---|---|
| `[locale]` | `next-intl` middleware (`'en' \| 'es'`, default `en`, prefix as-needed) | Middleware enforces |
| `[slug]` for `/specialists/[slug]` | `Specialists` Payload collection — generated from `practiceName` + `name` slug (e.g. `triangle-sinus-dr-mazhar`) | `generateStaticParams` from Payload query at build time. 404 on miss. |
| `[slug]` for `/resources/[slug]` | `Articles` Payload `slug` field | `generateStaticParams`. 404 on miss. |
| `[slug]` for `/{city}-{condition}` | `LandingPages` Payload — `slug` field stores the full hyphenated path (e.g. `raleigh-nc-sinus-treatment`) | `generateStaticParams`. 404 on miss. |

### Query parameters

Used for state-only — never required for the page to render.

| Page | Param | Use |
|---|---|---|
| `/find-a-specialist` | `?zip=27703&city=raleigh&specialty=sinus` | Filter state. Driven from the form input. Deep-linkable for sharing. |
| `/resources` | `?category=sinus-health&page=2` | Filter and pagination. Default = no filter, page 1. |
| Schedule modal trigger | `?schedule=open` | Optional. If present at any URL, the layout opens the booking modal on mount. Useful for email/SMS deeplinks ("schedule now" → `https://patients.excelentmedical.com/?schedule=open`). |

### Trailing slash and case

- No trailing slash. Next.js default; `next.config` aligned.
- Slugs are lowercase, hyphenated, ASCII. Spanish slugs use unaccented English-Spanish hybrid where the equivalent is obvious (e.g. `/es/encuentre-un-especialista`); medical terms stay in their natural Spanish form (`/es/sinusitis/que-es`).
- Locale stays at the path prefix only — no `?lang=` fallback.

### Canonical and 301s from WordPress

WordPress URL → new patient site URL. Document in a `redirects.json` or `next.config.js redirects` array.

| WP path | New path | Type |
|---|---|---|
| `/` | `/` | n/a |
| `/about-excelent/` | `/about` | 301 |
| `/balloon-sinuplasty/` | `/balloon-sinuplasty` | 301 |
| `/be-seen-within-5-days/` | `/` (the promise lives in home hero now) | 301 |
| `/20-min-in-office-procedure/` | `/balloon-sinuplasty` | 301 |
| `/connect-with-us/` | `/about#contact` (or `/contact` if added) | 301 |
| `/find-a-local-sinus-specialist/` | `/find-a-specialist` | 301 |
| `/local-sinus-specialists/` | `/find-a-specialist` | 301 |
| `/next-steps/` | `/schedule` | 301 |
| `/resources/` | `/resources` | 301 |
| `/sinus-education/` | `/sinusitis` | 301 |
| `/sinusitis/what-is-sinusitis/` | `/sinusitis/what-is` | 301 |
| `/sinusitis/symptoms-of-sinusitis/` | `/sinusitis/symptoms` | 301 |
| `/sinusitis/sinusitis-management-and-treatment/` | `/sinusitis/management-and-treatment` | 301 |
| `/raleigh-nc-sinus-treatment-popup/` | `/raleigh-nc-sinus-treatment` | 301 |
| All other `/raleigh-*-popup/` → `/raleigh-*` | flat slug, drop `-popup` | 301 |
| `/cookie-policy/` | `/cookies` | 301 |
| `/privacy-policy/` | `/privacy` | 301 |
| `/terms-and-conditions/` | `/terms` | 301 |
| `/es/...` (any) | `/es/...` (mirror) | per-page 301, parallel to English |
| `/[article-slug]/` (root-level WP article) | `/resources/[slug]` | 301 — preserves SEO juice on individual articles |

### Sitemap.xml

Auto-generated at build via `next-sitemap` (or equivalent). Includes:
- All static patient routes (English + Spanish)
- All `Specialists`, `Articles`, `LandingPages` from Payload (English + Spanish where translated)
- Excludes legal pages from priority but includes them for completeness

### Robots

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: https://patients.excelentmedical.com/sitemap.xml
```

---

## Notes for the Build

A few cross-cutting reminders for `/design-tokens` and `/frontend-design`:

1. **Hostname routing not done yet.** The plan is `patients.excelentmedical.com` resolves to the same Next.js app. Until hostname middleware is wired, the patient site can be developed under `/patient/*` (or `(patient)` route group exposed at root with a tag-team middleware split). Confirm with infra before locking on a path.
2. **Booking widget script must load on every page.** The `<link>` + `<script>` tags belong in the patient route-group `layout.tsx`, not per-page. Use Next.js `<Script>` for the JS with `strategy="afterInteractive"` to avoid blocking render but ensure it's available before any modal trigger fires.
3. **Modal and inline widget can coexist.** The integration spec (§2) confirms Pattern C and Pattern A coexist as long as their container IDs differ. Our IDs: `excelent-booking-modal-mount` (modal) and `excelent-booking-widget` (inline `/schedule`).
4. **Env vars to add.** `NEXT_PUBLIC_GTM_CONTAINER_ID`, `NEXT_PUBLIC_BOOKING_WIDGET_BASE_URL` (default `https://app.excelentmedical.com/widget`).
5. **Locale-aware metadata.** Each page's `generateMetadata` produces `<title>`, OG tags, and canonical URLs in the right language. Default `lang` attribute on `<html>` set per locale.
6. **Internal linking funnel rule.** Education pages link to other education pages **only through their hub** (`/sinusitis`), and to `/schedule` directly. They do not cross-link sideways to articles. This honors the "one clear next step" principle.
