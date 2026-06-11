# Design Brief: patients.excelentmedical.com

The patient-facing subdomain for ExcelENT Medical. Counterpart to the B2B site at `excelentmedical.com/b2b`. Sister artifact to `.design/b2b-rebuild/DESIGN_BRIEF.md`.

---

## Problem

Someone with chronic sinus pain — pressure between their eyes, eight months of "just allergies," sleep wrecked by congestion, finally googling at 11pm — lands on a page. They don't want to be educated for ninety seconds before being asked for an email. They don't want a scrolling parade of stock photos of women laughing in lavender fields. They don't want to read that something is "comprehensive, holistic, and patient-centered."

They want one thing: **to be seen by an ENT who actually treats sinus problems, soon, near them, without it becoming a project.**

The existing WordPress site is friendly enough but reads like a brochure. The current redesign-in-progress in this repo (`(frontend)/[locale]/`) was built for a different positioning — softer, more general — and doesn't survive the strategic shift to PS | Connect being the front-and-center conversion path.

## Solution

A site whose entire job is to take a sinusitis sufferer from "I should probably see somebody" to "I have an appointment booked" in under three minutes, with two intermediate confidence-building moments — *these are real doctors* and *one of them is near me* — handled cleanly along the way.

Every page is one of three types:

- **Conversion paths** — home, paid landing pages, `/schedule`. Compress the path.
- **Confidence builders** — `/find-a-specialist`, `/about`, sinusitis education hub, individual specialist pages. Present evidence the patient is asking for between landing and booking.
- **Long-tail SEO** — resources articles, education detail pages. Catch the patient earlier in their search journey and earn the eventual booking.

The booking itself is not ours. ExcelVoice's existing React widget (5-step flow, hosted at `app.excelentmedical.com/widget/`) is embedded — site-wide via a "Schedule an appointment" header CTA opening it in a modal (Pattern C), and on a dedicated `/schedule` page (Pattern A). We don't rebuild form logic, geo-routing, SMS confirmations, or insurance verification. We do own the trust, narrative, and sense of warm professionalism that gets a patient to the widget in the first place.

## Experience Principles

Three principles. Each resolves a real tension this site faces.

1. **Confidence over slickness.** Every page should leave a sinusitis sufferer feeling *these are real doctors who get this*, not *this is a marketing funnel*. *Tension:* trust vs. conversion polish. *Resolution:* trust wins — conversion follows. *In practice:* real photography of clinicians and clinics over stock; specific data points over claims; first-person physician voice over corporate plural; named partner practices on every page.

2. **One clear next step over comprehensive options.** A patient with sinus pain at 11pm doesn't need a hierarchy of twelve paths; they need the one right next move. *Tension:* information architecture vs. action architecture. *Resolution:* action wins. *In practice:* one primary CTA per screen ("Schedule an appointment"); secondary CTAs deemphasized typographically; no hub-and-spoke navigation that forces a choice; education pages funnel back to schedule, not to more education.

3. **Warmth without cuteness.** Bold editorial photography and a typeface with personality, but no cartoon noses, no wellness-y "your journey" softness, no flat illustration of friendly mascots. *Tension:* clinical authority vs. consumer warmth. *Resolution:* both, but restrained. *In practice:* big body type, generous line height, magazine-grade photography, warm whites and ink-blacks, brand purple as a deliberate accent — never as a wash.

## Aesthetic Direction

- **Philosophy.** Editorial-medical. The reference points are *Hims/Ro/Hers* (bold display type, full-bleed photography, brand-led narrative) crossed with *Headspace/Calm* (soft warmth, friendly typography). Not Mayo Clinic clean-clinical. Not WebMD content-heavy. Definitely not the consolidator-PE ENT sites that all look like the same template.

- **Tone.** Warm, direct, operationally honest. "We can usually see you within five days" rather than "compassionate care, when you need it most." Specific over poetic. Doctor-led voice in the prose where it makes sense (Dr. Mazhar wrote this, signed it, means it).

- **Reference points.**
  - Hims/Ro/Hers — bold sans display, narrow column body type, photo-led hero, restrained palette
  - Headspace/Calm — generous whitespace, soft photography, type with personality
  - Apothékary, Function Health — editorial DTC health brands that earn medical credibility
  - One Medical's storytelling pages (not their app) — long-form clinical warmth

- **Anti-references.**
  - Generic ENT practice WordPress themes (lavender fields, three columns of feature icons)
  - Corporate medical (gradient blue + smiling stock doctors with crossed arms)
  - Wellness-cute (soft pastels, illustrations of cartoon body parts, "your journey to relief")
  - The B2B Swiss aesthetic at `/b2b` — deliberately the opposite register

- **Color use.** Brand purple `#89007a` as a deliberate accent — CTAs, key moments, links. Brand blue `#459fdc` as a secondary accent (e.g. testimonial blocks, sub-CTAs). Pink-purple `#C25BAB` saved for special moments (limited use). Pale blue `#c8dfff` is the inverse-bg already in tokens — works for footer / quiet sections. Body palette is warm white + ink black + a single neutral scale. No gradients. No third-party color hacks.

## Existing Patterns

The site lives inside the same Next.js 15 + Payload 3 monorepo at `/home/bitnami/stack/excelent-site` that hosts the B2B site. The patient route group will be net-new under `src/app/(patient)/` with full localization support (English root + `/es` mirror). The existing `(frontend)/[locale]/` code will be deleted as part of this work (per Q8 = full scrap).

### Tokens (already partially scaffolded)

- **`src/app/tokens.css`.** Shared base scale (neutral, type ramp, spacing, motion) at `:root`. Theme variants under `[data-theme="b2b"]` (already used) and `[data-theme="patient"]` (already stubbed but not yet used at runtime). Patient theme defines:
  - Primary bg `#ffffff`, secondary `#fafafa`, tertiary `#f4f4f5`
  - Inverse bg `#c8dfff` (the WP-era pale blue)
  - Accent primary `#89007a` (brand purple), secondary `#459fdc` (brand blue), tertiary `#C25BAB`
  - `--radius-button: var(--radius-full)` — pill-shaped buttons, **distinct from B2B's sharp-cornered buttons**
  - Section padding scale (mobile 12, tablet 16, desktop 20)

- **`tailwind.config.js`.** Existing semantic bridges (`bg-surface`, `text-ink`, `border-edge`, `bg-accentp` etc.) read theme variables — they automatically pick up patient theme when the layout sets `data-theme="patient"`. Display sizes (`5xl-display`, `6xl-display`) and motion durations are shared across themes.

- **`src/app/globals.css`.** Imports `tokens.css`. Defines utility classes like `.btn-b2b-primary`, `.btn-b2b-secondary`, `.eyebrow`, `.body-lead`, `.stat-display`. Patient build will add parallel utilities — `.btn-patient-primary` (pill, purple, white text), `.btn-patient-secondary` (pill, ghost, ink border) — without modifying B2B utilities.

### Typography (decision deferred to `/design-tokens`)

B2B uses Cabin (body) + Montserrat (headings) loaded via `next/font/google` per-layout. Patient layout will choose its own pairing in the design-tokens phase — likely one expressive display family (e.g. *Fraunces*, *Tiempos Headline*, *Söhne*, *GT Walsheim*) plus one neutral body. **Don't lock typography in the brief; lock it in tokens.**

### Components (B2B inventory, evaluate for reuse)

The B2B site has 22 components under `src/components/b2b/`. A handful are theme-agnostic enough to share: `EyebrowTag`, `ArrowRight`, `Stat`, `FAQAccordion`, possibly `PageHero` (with theme variants). The rest are too B2B-specific to repurpose. Patient components live under `src/components/patient/` (net-new directory).

### Data layer (already populated)

Payload collections that this site reads:

| Collection | Count | Use |
|---|---|---|
| `Specialists` | 16 | `/find-a-specialist`, individual specialist pages, `/schedule` location detail |
| `LandingPages` | 19 | Existing handcrafted landing pages — migrate or supersede with new template |
| `Articles` | 19 | `/resources` index + detail pages |
| `FAQs` | 8 | Embedded on home + sinusitis education + `/schedule` |
| `Testimonials` | 1 | TBD placement once more arrive |
| `Pages` | (varies) | Catch-all for any non-templated page |

`Specialists` schema includes localized rich text bio, photo, phone, email, structured address — sufficient for find-a-specialist + per-specialist pages without backend changes. `Articles` is presumed similarly structured (verify in tokens phase).

### Routing & locale

- `next-intl` middleware already excludes `/api`, `/_next`, `/admin`, `/media`, `/b2b` from locale rewrites. The patient build adds `(patient)` route group under root with locale support. URLs:
  - English (root, no prefix): `/`, `/find-a-specialist`, `/schedule`, `/sinusitis/what-is`, `/resources`, `/resources/[slug]`, `/specialists/[slug]`, `/about`, `/privacy`, `/terms`, `/cookies`, `/hipaa`
  - Spanish mirror: `/es/...` with same paths
  - Paid landing pages: `/{city}-{condition}` (e.g. `/raleigh-nc-sinus-treatment`) — flat at root, no locale prefix in v1
  - B2B remains at `/b2b/*` (untouched)

## Component Inventory

Net-new components live under `src/components/patient/`. Shared components either move to `src/components/shared/` or stay in `b2b/` and get imported (decision per-component during build).

| Component | Status | Notes |
|---|---|---|
| `HeaderPatient` | New | Patient logo, primary nav (Sinusitis, Find a Specialist, Resources, About), "Schedule an appointment" CTA opens widget modal, mobile drawer, footer-only "For practices →" link to `/b2b` |
| `FooterPatient` | New | Patient-themed (warmer than B2B footer), 4-column link grid, legal strip, B2B link, ExcelENT branding |
| `MobileMenuPatient` | New | Client component; same UX pattern as B2B's `MobileMenu` (focus trap, esc, body-scroll lock) but patient theme styling |
| `HeroPatient` | New | Editorial-medical hero — full-bleed photo, big display headline, doctor-signed prose pull-quote, primary CTA opens widget modal, secondary "Find a specialist near me" |
| `BookingWidgetModal` | New | Client component. Renders the global "Book Now" modal markup from ExcelVoice spec Pattern C. `openBookingModal()` / `closeBookingModal()` expose globally; header CTA + any other CTA on the site triggers it. Calls `window.ExcelENTBookingWidget.init/destroy` |
| `BookingWidgetInline` | New | Client component. Pattern A auto-init on `/schedule` page only. Includes the `<link>` to `booking-widget.css` and `<script>` to `booking-widget.js`, container div, fallback skeleton if widget fails to load |
| `SpecialistCard` | New | Photo, name + credentials, practice + city, specialties chips, primary CTA (Schedule), secondary (View profile). Reads from `Specialists` collection |
| `SpecialistGrid` | New | Wraps `SpecialistCard` in a responsive grid; can be filtered by city or specialty |
| `ZipCodeMatcher` | New | Client component on `/find-a-specialist`. Patient enters zip → JS distance lookup against the 5 partner cities → suggests nearest practice → "Schedule" button passes city to widget (Pattern B-ish; falls back to global modal until preselect ships) |
| `ConditionHero` | New | Sinusitis education page hero — minimal, body-set, signaling "this is medical content not marketing" |
| `ConditionContent` | New | Long-form prose template for medical/educational content. Optimized for reading (narrow column, tight type ramp). Used by `/sinusitis/what-is`, `/sinusitis/symptoms`, `/sinusitis/management-and-treatment` and resource articles |
| `ArticleCard` | New | Used in `/resources` index. Photo, category, title, excerpt, read time. Cards link to `/resources/[slug]` |
| `ArticleIndex` | New | Server component, paginated grid of `ArticleCard` reading from `Articles` collection. Optional category filter |
| `ArticleDetail` | New | Single-article layout. Uses `ConditionContent` for body. Includes author byline, related articles, schedule CTA at the bottom |
| `TrustBar` | New | Below-hero homepage strip — "Available in 5 cities," "1M+ patients treated," "97.5% success rate," etc. Source numbers from existing WP/PEAP data |
| `TestimonialCard` | New | Patient testimonial format. Headshot or initials placeholder, quote, condition + city. Reads from `Testimonials` |
| `LocalLandingTemplate` | New | Reusable layout for `/raleigh-nc-sinus-treatment`-style paid landing pages. Hero with city in headline, condition explainer, specialist preview, schedule CTA. One per city/condition combo, content authored in Payload `LandingPages` collection |
| `LanguageSwitcher` | New | Header element. EN/ES toggle. Preserves current path, falls back to home if no Spanish equivalent exists |
| `ScheduleCTAInline` | New | Reusable CTA block — placed at the bottom of education pages, articles, specialist pages. Uniform "Schedule an appointment" copy + button |
| `EyebrowTag` | Reuse | Same component as B2B; respects theme via tokens |
| `ArrowRight` | Reuse | Theme-agnostic SVG |
| `FAQAccordion` | Reuse | B2B's `FAQAccordion` works as-is; patient theme styles automatically via tokens |
| `Stat` | Maybe reuse | Used in `TrustBar` and possibly hero. May need a warmer variant |
| `PageHero` | Maybe reuse | B2B's compact PageHero may work for legal/about; new editorial `HeroPatient` for marquee pages |

## Key Interactions

**Schedule from anywhere.** Every page has a "Schedule an appointment" CTA in the header. Clicking it opens the booking widget in a full-screen modal (Pattern C). The widget's location-selection step (Step 1) is the patient's first interaction inside the modal. On modal close (X button, Esc, or backdrop click), `window.ExcelENTBookingWidget.destroy()` runs to prevent double-mount on re-open.

**Find-a-specialist with zip-code suggestion.** Patient enters their zip on `/find-a-specialist`. Client-side distance calc against the 5 partner cities (haversine on hardcoded coordinates — the cities don't move). Result reorders the `SpecialistGrid` with the nearest specialists at the top, plus a banner ("Closest to you: Triangle Sinus, Raleigh — 18 miles"). Clicking "Schedule" on a specialist card opens the global booking modal; until widget preselect ships, the patient still picks the location in Step 1, but the page primed them for the right answer.

**Education → schedule funnel.** Sinusitis education hub pages (`/sinusitis/what-is`, etc.) and resource articles end with a `ScheduleCTAInline` block. Clicking it opens the booking modal directly. Education pages don't link to other education pages mid-content — they funnel toward action.

**Language switching.** Header `LanguageSwitcher` toggles between EN and ES. URL changes from `/find-a-specialist` to `/es/find-a-specialist`. If a page lacks a Spanish equivalent, falls back to `/es/` (Spanish home) with a toast/banner indicating the requested page isn't translated.

**Paid landing page entry.** Google Ads route to `/{city}-{condition}` URLs. Page loads with city pre-implied in headline + nearest-specialist preview but the booking modal opens to Step 1 (patient confirms location). Source attribution (UTMs, gclid) is captured automatically by the widget into ExcelVoice's `booking_sessions` table — no work for us beyond the widget embed.

## Responsive Behavior

Mobile-first, three breakpoints: `sm` (640px), `md` (768px), `lg` (1024px). Patient site skews mobile-heavy — sinus-pain searches happen on phones at night.

- **Header.** Mobile: logo + hamburger + sticky "Schedule" button (visible). Tablet+: full nav inline. Header CTA is **always visible** on mobile, even when nav is collapsed — it's the primary conversion path.
- **Hero.** Mobile: stacked, full-bleed photo as background with overlay text. Desktop: split-panel (image right, copy left), wider type ramp.
- **Specialist grid.** 1 col mobile, 2 col tablet, 3 col desktop.
- **Article index.** 1 col mobile, 2 col tablet, 3 col desktop. Featured-first article is full-width on tablet+.
- **Booking widget modal.** Full-screen on mobile, centered max-width 1000px on tablet+. The widget itself handles internal responsiveness.
- **Sinusitis education.** Single-column reading flow at all sizes; copy width capped at ~70ch even on desktop.
- **Footer.** 2 col mobile, 4 col desktop.

## Accessibility Requirements

- **WCAG AA contrast.** All body text ≥ 4.5:1 on its background; large text (≥ 18.66px or 24px+) ≥ 3:1. Brand purple `#89007a` has been confirmed at 4.6:1 on white.
- **Keyboard navigation.** Every interactive element reachable via Tab. Logical focus order. Visible focus rings using the existing `--shadow-focus` token. Modal traps focus when open and returns focus to its trigger on close.
- **Screen readers.** Semantic HTML — `<header>`, `<main>`, `<nav>`, `<section>` with `aria-labelledby`, `<article>` for resource detail. Booking modal announced as a dialog (`role="dialog"` + `aria-modal="true"` + `aria-labelledby`).
- **Reduced motion.** Respect `prefers-reduced-motion` — disable transitions and parallax-y hero treatments.
- **Forms.** Form labels are real `<label>` elements, not placeholders. Error messages announced via `aria-live`. (Note: most form burden lives inside the embedded ExcelVoice widget, which is their responsibility — but our find-a-specialist zip input must comply.)
- **Image alt text.** Every photographic image has descriptive alt. Specialist headshots: `"{name}, {credentials} — {practice}"`. Decorative images (hero backgrounds with text overlays) get `alt=""`.
- **Language attribute.** `<html lang="en">` on English routes, `<html lang="es">` on `/es`.

## Conversion Model

The conversion event is a **completed booking via the embedded ExcelVoice widget.** Capture lives in ExcelVoice's MySQL `booking_sessions` table; we never touch patient data on our side.

### Widget integration

Reference docs:
- `/home/bitnami/excevoice-integration/2026-04-28-website-booking-widget-integration-design.md` (full design spec)
- `/home/bitnami/excevoice-integration/2026-04-28-website-booking-widget-integration.md` (companion implementation doc)

We use **Pattern C (site-wide modal) + Pattern A (dedicated `/schedule` page)** from the spec. **Not** Pattern B (per-location pages) — once widget preselect ships, paid landing pages can upgrade to Pattern B; until then, location is selected by the patient in Step 1.

Embed surface:

```html
<!-- Loaded once globally in patient layout -->
<link rel="stylesheet" href="https://app.excelentmedical.com/widget/booking-widget.css">
<script src="https://app.excelentmedical.com/widget/booking-widget.js" defer></script>

<!-- Pattern C — global modal (header CTA opens) -->
<div id="excelent-booking-modal" hidden>...</div>

<!-- Pattern A — only on /schedule -->
<div id="excelent-booking-widget" data-excelent-booking-widget></div>
```

The widget pushes events to `window.dataLayer`:
- `excelent_booking_started` (modal open / page mount)
- `excelent_booking_step_completed` (each of 5 steps)
- `excelent_insurance_verified`
- `excelent_booking_completed`
- `excelent_booking_failed`

These get caught by our GTM container and routed to GA4 + Meta Pixel.

### 5 partner practices (locked)

| ExcelVoice slug | Practice | City |
|---|---|---|
| `raleigh` | Triangle Sinus | Raleigh, NC |
| `savannah` | Coastal ENT | Savannah, GA |
| `florence` | Florence ENT | Florence, SC |
| `asheville` | Mountain ENT | Asheville, NC |
| `venice` | Island ENT | Venice, FL |

All find-a-specialist content + paid landing page templates assume these 5. Patient locations outside this footprint still see content + can submit a booking; widget Step 1 lets them choose anyway, but they're routed to whichever city they pick.

## External Dependencies / Open Items

These are not blockers for design/build but **must be resolved before launch**.

1. **GTM container ID.** The booking widget pushes events to `window.dataLayer`; without a GTM container loaded on the page, those events have nowhere to go. Need either a new container or the existing one. Wire as env var `NEXT_PUBLIC_GTM_CONTAINER_ID` so it's swappable without code change.
2. **ExcelVoice CORS allowlist.** The current allowlist (per integration spec §5.1) includes `54.224.169.112:3000` (staging IP) but not `patients.excelentmedical.com`. Backend team must add it before launch — non-trivially, also any pre-launch staging hostname (e.g. `patients-staging.excelentmedical.com`) if one is created.
3. **Widget preselect feature** (ExcelVoice's "Future Work" item 1). Once shipped, paid landing pages and `/find-a-specialist` zip-match upgrade to pre-fill location, dropping a step from the funnel. Not in v1.
4. **Real photography.** Editorial-medical aesthetic depends on photo quality. Need: clinician portraits (we have 4 from the about page already), clinic interiors (none), patient-with-clinician environmental (none), and potentially commissioned editorial shots. Identify photographer + budget before frontend-design phase.
5. **`Articles` collection schema.** Verified count (19) but not the field shape. Confirm during the design-tokens or frontend-design phase whether category/tag filtering is wired or needs to be added.
6. **Testimonial pipeline.** Only 1 testimonial in Payload. Needs more — minimum 3-5 to be useful in the design.
7. **Domain + DNS.** `patients.excelentmedical.com` subdomain DNS pointed at the same Next.js app, with hostname middleware (or route-group rewrite) gating to the patient route group. Confirm with infra before frontend-design phase.

## Site Map (preview — full IA in next skill)

```
/                                — Home
/find-a-specialist               — Specialist directory + zip-match
/specialists/[slug]              — Individual specialist profile
/schedule                        — Dedicated booking page (Pattern A)
/sinusitis/what-is               — Education: what is sinusitis (verbatim from WP)
/sinusitis/symptoms              — Education: symptoms (verbatim from WP)
/sinusitis/management-and-treatment  — Education: management (verbatim from WP)
/balloon-sinuplasty              — Treatment explainer (verbatim from WP, lightly adapted)
/resources                       — Articles index
/resources/[slug]                — Article detail (19 existing in Payload)
/about                           — About ExcelENT (rewritten for patient audience)
/{city}-{condition}              — Paid landing template (e.g. /raleigh-nc-sinus-treatment)
/privacy                         — Mirror of B2B privacy
/terms                           — Mirror of B2B terms
/cookies                         — Mirror of B2B cookies
/hipaa                           — Mirror of B2B hipaa (still flagged Draft)
/es/...                          — Spanish mirror of all of the above
```

## Phasing

**Single big v1 ship.** WordPress cuts over at launch; no parallel A/B. Everything in the site map is in scope for v1, including full Spanish mirror of medical/educational pages.

Within v1, suggested build order during `/frontend-design`:
1. Layout + theme + header/footer/mobile menu + booking modal (foundation; nothing ships without it)
2. Home + `/schedule` (the conversion path)
3. `/find-a-specialist` + zip-match + specialist detail (the trust layer)
4. Sinusitis education hub (3 pages, verbatim content)
5. Resources index + detail (catches long-tail SEO)
6. About + legal (lower priority but required)
7. Paid landing template (one example built, rest authored in Payload)
8. Spanish mirror

## Out of Scope

Things this brief explicitly does **not** cover. Anything here that creeps in mid-build is a scope conversation, not a silent expansion.

- **Native booking form on our side.** ExcelVoice widget is the form. We don't reimplement it.
- **Geo-pre-selection inside the widget.** We surface "nearest practice" suggestions on our pages; the widget Step 1 still asks. Upgrade after ExcelVoice ships preselect.
- **Programmatic SEO at scale.** Paid landing pages are handcrafted templates per `LandingPages` Payload entry. The pSEO city × condition matrix is a phase 2 project.
- **Patient portal / login / appointment management.** Booking confirmations are SMS + email from ExcelVoice. Patients re-book or modify via direct contact with the practice — no logged-in experience.
- **Telemedicine / virtual consults.** Not part of PS | Connect's current model. If this changes, requires a different conversion model.
- **Insurance verification UI.** Lives entirely inside the widget; we don't preview insurance acceptance per practice.
- **Patient reviews / ratings.** Testimonials yes; structured ratings no. Requires content pipeline + moderation we don't have.
- **Provider portal / specialist self-service.** Specialist profiles are content-managed by the ExcelENT team via Payload, not by the providers themselves.
- **Payment / billing flows.** ExcelVoice + the practice handle this offline. No price-of-care information presented on this site beyond "we accept most insurance."
- **Analytics dashboard for ExcelENT.** All conversion data lives in ExcelVoice's `booking_sessions` table + GA4. We don't build a custom analytics surface.
- **Symptom checker / triage tool.** Patients with non-sinus complaints get the same site; we don't filter or redirect based on symptom self-report. Sinusitis-laser positioning means everything points to "see a sinus specialist" regardless.
- **Multi-locale beyond English + Spanish.** No French, Mandarin, etc. in v1.
- **A/B testing infrastructure.** GTM is enough for events; no formal experimentation framework in v1.
- **Custom CMS pages.** Marketing team writes within existing Payload collections (LandingPages, Articles, FAQs). No new collection required for v1.
