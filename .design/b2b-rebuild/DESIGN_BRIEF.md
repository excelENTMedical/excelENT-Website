# Design Brief: B2B Rebuild — excelENT Practice Solutions

**Project:** Reposition `excelentmedical.com` from a patient-clinic site into a B2B platform site that converts independent ENT practices into Practice Solutions partners. Move the existing patient experience to `patients.excelentmedical.com`.

**Scope:** Phase 1 of a 3-phase plan. Phase 1 = B2B site rebuild + patient-subdomain split (with WP content migration). Phase 2 = AI social-content cockpit. Phase 3 = patient-subdomain refinement.

**Branch:** `b2b-rebuild` (cut from `main`; current redesign at commit `995b7ef` preserved on `main` and remains live at `54.224.169.112:3000` until cutover).

**Source of truth for product content:** `/home/bitnami/excelENT Practice Solutions Presentation_March 2026.pdf` (14-page deck by Zack Casazza). Marketing claims and metrics on the site must trace back to this deck or to a named partner practice with marketing clearance.

---

## Problem

A practice owner running an independent ENT clinic in 2026 is being squeezed from four sides at once: rising patient acquisition cost, missed and dropped calls (front-desk understaffing), denied insurance claims (industry baseline 11.8%), and a consolidator landscape pressuring them to sell or merge. They already know what they need — patients walking in the door, calls handled, claims paid, independence preserved. They are *not* shopping for sinus-relief education; they're shopping for an operations partner.

They land on `excelentmedical.com` today and see a patient site about balloon sinuplasty. There's no path that says "we are the platform that solves your operational problems." The B2B story is invisible. They bounce.

The friction is positioning, not content quality. ExcelENT *has* the product (PS | Connect, PS | Lexi, PS | RCM, BB8 portfolio), the proof (named customers, real metrics, FDA-approved devices), and the team (CEO who is a practicing otolaryngologist, CRO with 30+ years in the category). None of that surfaces on the current site.

## Solution

A B2B platform site at `excelentmedical.com` that, in the first scroll of the homepage, communicates: *"ExcelENT is the operations partner for independent ENT practices — we drive patients in, handle the calls, recover the revenue, and supply the clinical tools."* Every secondary path leads to a single conversion goal: **Request a Demo**.

The patient experience moves to `patients.excelentmedical.com` — same brand thread, separate funnel — preserving the existing search-for-a-specialist motion without forcing patients and practice owners to share a homepage.

The site lives on the existing Next.js 15 + Payload 3 codebase. Hostname middleware in `middleware.ts` routes `excelentmedical.com` to a new `(b2b)` route group and `patients.excelentmedical.com` to a `(patients)` route group (the current frontend, content-migrated). One repo, one CMS, one deploy, two clean audiences.

## Experience Principles

Three principles, each resolving a tension. Every design decision must trace back to one.

1. **Authority over warmth.** Clinical, B2B, plainspoken — not patient-friendly cheerful. We're selling to a practice owner who sees five vendor pitches a week and is allergic to fluff. *In practice:* declarative headlines ("Reduce denials. Recover revenue."), no waving emojis, no rounded clinic-photography stock, restrained micro-animation. Purple drops from a hero gradient to a single accent.

2. **Proof over promise.** Every claim is backed by a real number from the deck or a named partner practice cleared for marketing. *In practice:* a homepage proof block leads with `2.5%` denial rate, `100%` BB8 success, `265K` visits, `192` kept appointments — sourced inline. Anonymous claims ("our customers see results") are forbidden. Where we don't yet have a metric cleared for publication, we use anonymized framing ("a Texas-based partner practice grew patient payments 14% across Q1–Q4 2025") rather than fabricating one.

3. **Sales-led over self-serve.** No public pricing. Every secondary CTA leads to "Request a Demo." *In practice:* the demo CTA is sticky in the header on every page; product detail pages end with the same demo block; the demo form is minimal (work email + practice name + role + # providers + free-text "biggest pain") so it doesn't gate qualification.

## Aesthetic Direction

- **Philosophy:** **Swiss / International Typographic.** Strong type hierarchy, grid-locked layouts, generous whitespace, restrained color, objective tone. Editorial in places where credibility benefits — team page, case studies — but the chassis is Swiss.
- **Tone:** authoritative · clinical · confident · spare. Not warm, not playful, not consumer-health. The voice should sound like a senior practicing otolaryngologist explaining to a peer what the platform does.
- **Reference points:**
  - **B2B medtech (primary):** Tebra, NexHealth, Doximity, Phreesia, Notable Health
  - **SaaS taste (secondary, for layout/typography):** Linear, Vercel, Stripe
  - **Editorial credibility (for team / case-study pages):** Stripe Press, NEJM, JAMA Network
- **Anti-references:**
  - The current ExcelENT WordPress site / commit `995b7ef` Payload redesign — purple-clinic-friendly aesthetic, cheerful patient-facing
  - Most consumer telehealth (Hims, Ro) — too B2C, too gradient-heavy
  - Healthcare PowerPoint chrome — dated, corporate-blue, stock-photo-overloaded

## Existing Patterns

The codebase already encodes real decisions. The brief extends, not replaces.

- **Typography:** `Cabin` (body) + `Montserrat` (heading), loaded via `next/font/google` in `src/app/(frontend)/[locale]/layout.tsx`. **Keep both.** Recalibrate scale and weight for stronger Swiss hierarchy: tighter heading line-height, higher contrast between heading and body weights, larger H1 (display 64–80px desktop), generous tracking on caps eyebrows.
- **Colors (Tailwind tokens in `tailwind.config.js`):**
  - `primary` 50–950 (purple, `#89007a` at 700) — **demoted** to a single restrained accent across the B2B site (links, key buttons, eyebrow tags). No more purple gradient hero.
  - `secondary` 50–950 (blue, `#459fdc` at 500) — retained for secondary callouts only, not primary surfaces.
  - `accent` 50–950 (pink-purple, `#C25BAB` at 500) — **drop from the B2B palette.** Reserved for the patient subdomain where the warmer palette still fits.
  - `navy` (`#061b42`), `footer` (`#c8dfff`) — `navy` retained for body text on light surfaces; `footer` retired from B2B (replaced with a near-black or deep-charcoal footer for B2B authority; patient subdomain keeps current).
  - **New tokens to add (in `/design-tokens` step):** a richer neutral scale (gray-50 through gray-950) since Swiss leans on greys, plus dedicated `surface` and `border` semantic tokens.
- **Spacing:** standard Tailwind scale, with custom screens already defined (`xs: 375`, `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1440`). Keep.
- **Buttons:** `.btn-primary`, `.btn-secondary`, `.btn-accent` are pill-shaped (`rounded-full`) per the WP-match work. **Soften** for B2B: `rounded-md` (8px) on the B2B subdomain, keep `rounded-full` on the patient subdomain to preserve the warmer feel. The button utilities will need a hostname-aware variant or a B2B override class.
- **Section utilities:** `.container-custom` (max-w-7xl), `.section-padding` (py-12 md:py-16 lg:py-20), `.heading-1/2/3` — all reusable; the heading utilities will be re-tuned in `/design-tokens`.
- **Components reusable across both subdomains:** `RichText`, `VideoEmbed`, `FAQ`, `Footer` (theme-aware), `Header` (theme-aware), `TrackingPixels`.
- **Components patient-subdomain-only:** `Hero` (current purple-gradient hero), `SpecialistCard`, `SpecialistDirectory`, `QualificationQuiz`, `SymptomsSection`, `ThreeStepProcess`, `StatsSection` (current design). These don't appear on the B2B side.
- **Components to retire:** `HubSpotForm` — replaced by a Payload-backed `DemoForm` writing to a new `DemoRequest` collection.

## Component Inventory

### B2B subdomain (`excelentmedical.com`)

| Component | Status | Notes |
|---|---|---|
| `AppShellB2B` | New | B2B route group layout. Sticky header w/ Demo CTA, Swiss spacing rhythm, dark/charcoal footer. |
| `HeaderB2B` | New (forks from `Header`) | Hostname-aware. Nav: Solutions / Products / How It Works / Why excelENT / For Patients (→ patients subdomain) / Request a Demo (CTA) |
| `FooterB2B` | New (forks from `Footer`) | Charcoal/near-black background, B2B-focused link groups (Solutions, Products, Company, Legal, For Patients) |
| `HeroB2B` | New | Practice-owner hero. Headline: "More Patients. Better Operations. Stronger Revenue." Sub: per spec. Single primary CTA → /request-demo. Sub-CTA: scroll to proof. |
| `ProofMetricStrip` | New | Above-fold metric strip (4–5 stats from deck: 265K visits, 192 appointments, 2.5% denial, 100% BB8 success, etc.) |
| `SolutionTile` | New | Used on Solutions overview. PS \| Connect, PS \| Lexi, PS \| RCM. Icon, headline, 1-line value prop, link → detail page. |
| `SolutionDetailHero` | New | Used on each PS \| * detail page. Tagline + summary + demo CTA. |
| `CapabilityList` | New | Bullet list w/ icon prefix for product capability sections. Reused per PS product page. |
| `PricingTierTable` | **Build but hide.** | Three-tier pricing data exists in deck (Base/Premium/Platinum for Connect; Base/Premium/Unlimited for Lexi). **Build the component shape** but render only when an internal flag (`?internal=1` or admin-only) is on. Public site: not displayed. Future-proof for the day they go price-public. |
| `CaseStudyBlock` | New | Per-customer case study. Practice name (when cleared), product(s), key metric, optional logo, optional pull-quote. Used on Solutions detail pages and homepage proof block. |
| `CustomerLogoStrip` | New | Logo wall — Coastal ENT, Florence ENT, Mountain ENT, Island ENT, Triangle Sinus (logos provided per Q17). One row, grayscale-on-light, color on hover. |
| `MedicalDeviceCard` | New | BB8 / Shaver Blades / AllergyX cards on Products overview. Image, key stat, CTA. |
| `MedicalDeviceDetailHero` | New | BB8 detail page. The 5-device-in-1 visual from the deck — light-guided nav, no nav requirements, navigation compatible, tactile feedback, malleable tip, suction, irrigation. |
| `PlatformOverviewSection` | New | Homepage section: "Medical Devices + Practice Solutions = Business-in-a-Box" — adapted from deck slide 4. |
| `ProblemFramingGrid` | New | Homepage "The Problem": missed calls, staff overload, insurance complexity, billing inefficiency. 4 tiles. |
| `ThreePillarsSection` | New | Educate → Connect → Empower. From deck slide 1, restated B2B-first. |
| `HowItWorksStepper` | New | "Attract → Convert → Optimize" 3-step funnel visual. |
| `WhyExcelentSection` | New | Built-by-ENT-experts framing on homepage. Links to Why excelENT page. |
| `TeamMemberCard` | New | Why excelENT page bios: Kashif Mazhar MD, Kevin Monty, Josh Pelger, Eric Honsberger. Headshot, name, title, 1-paragraph bio, optional credentials. |
| `DemoFormBlock` | New | The /request-demo form. Fields: work email, practice name, role, # providers, optional EMR/EHR, optional current RCM provider, free-text "biggest pain". |
| `DemoFormConfirmation` | New | Post-submit success state. Future hook for Calendly embed (not in v1). |
| `InlineDemoCTA` | New | Recurring inline CTA block ("Ready to grow your ENT practice?") — appears at bottom of every B2B route. |
| `EyebrowTag` | New | Small caps eyebrow ("PRODUCTS", "CASE STUDY", etc.) — Swiss layout pattern for orienting readers in long-scroll pages. |
| `Stat` | New | Big-number display (e.g., `2.5%` over `Denial rate vs 11.8% industry`). Used in `ProofMetricStrip` and across detail pages. |
| `RichText` | Reuse | Existing Lexical renderer, no changes. |
| `VideoEmbed` | Reuse | Existing component, used for any product/demo videos. |
| `FAQ` | Reuse | Existing component. New B2B FAQ content authored in Payload. |
| `TrackingPixels` | Reuse | Existing analytics layer. |

### Patient subdomain (`patients.excelentmedical.com`)

Phase 1 scope = stand up the subdomain with all WP content migrated; deeper polish in Phase 3.

| Component | Status | Notes |
|---|---|---|
| `AppShellPatient` | New | Patient route group layout. Keeps current warmer aesthetic (purple gradient hero, Cabin body, pill buttons, light-blue footer). |
| `Hero` | Reuse | Existing hero stays as the patient hero. |
| `SpecialistCard` | Reuse | Existing component. |
| `SpecialistDirectory` | Reuse | Existing component. |
| `SymptomsSection` | Reuse | Existing component. |
| `ThreeStepProcess` | Reuse | Existing component. |
| `QualificationQuiz` | Reuse | Existing component. |
| `Hero` (current) | Reuse | Patient subdomain only. |
| `Footer` (current) | Reuse | Patient subdomain footer (light-blue). |
| `Header` (current) | Reuse | Patient subdomain nav. |
| `BookingCTA` | New | Replaces current booking flow with one that posts to Excelvoice (`app.excelentmedical.com/excelvoice/booking-test`). Spec inbound (Q18). |
| `WPArticleMigrated` | New page template | For migrated `/sinus-education/`, `/resources/`, `/local-sinus-specialists/` pages. Block-based body so copy can be A/B tested. |

### Shared infrastructure

| Component | Status | Notes |
|---|---|---|
| `middleware.ts` (hostname routing) | Modify | Detect hostname → route to `(b2b)` or `(patients)` route group. Single Next.js app, two route trees. |
| `DemoRequest` Payload collection | New | Fields per `DemoFormBlock` + status (`new`/`contacted`/`qualified`/`demo-scheduled`/`won`/`lost`) + assignee + notes + timestamps. Acts as the v1 CRM. |
| Email/Slack notification webhook | New | Fires on `DemoRequest` create. Payload `afterChange` hook. |
| `Solution` Payload collection | New | PS \| Connect / PS \| Lexi / PS \| RCM data, content-managed. |
| `Product` Payload collection | New | BB8, Shaver Blades, AllergyX, Eustachian Tube. |
| `CaseStudy` Payload collection | New | Customer case studies — practice, products, metrics, quote, marketing-clearance flag. |
| `TeamMember` Payload collection | New | Why excelENT bios. |
| Existing collections | Reuse | `Articles`, `FAQs`, `LandingPages`, `Media`, `Pages`, `Specialists`, `Testimonials`, `Users` all continue. |

## Key Interactions

- **Sticky demo CTA.** `HeaderB2B` is sticky (top-0) on every B2B route. The "Request a Demo" CTA is always visible. On scroll past hero, the header gains a subtle drop-shadow and slight background tint to lift off content. On mobile, the CTA collapses to a compact button (no icon-only — the words matter).
- **Hero → Demo path.** Primary CTA lives above the fold. Click → smooth-scroll to anchor `#request-demo` on long pages, or hard navigate to `/request-demo` from interior pages. No modal — full page treats the form with the gravity it deserves.
- **Demo form submit.** Inline validation on blur (work-email format check), submit-disabled until required fields valid. On submit: optimistic UI ("Submitting…" → confirmation state in <500ms server response budget). Server-side: write to `DemoRequest` collection → fire notification webhook → render confirmation block. No redirect, no page reload — the confirmation replaces the form in-place.
- **Solutions overview → detail.** Clicking a `SolutionTile` navigates to `/solutions/connect` (etc.) with full-page transition (no SPA-modal). Each detail page has the same skeleton: hero → capabilities → case study (if available) → demo CTA.
- **Customer logo strip.** Default state: grayscale on light background. Hover individual logo → color in. Click → scroll to that customer's case study (if present on page).
- **Hostname routing.** First hit on a hostname sets a header that the layout reads to apply the correct route group. Same Next.js process serves both. Cross-subdomain links use full-URL anchors (e.g., `https://patients.excelentmedical.com/local-sinus-specialists/`) so middleware never confuses them.
- **Patient → B2B and back.** "For Patients" link in B2B header → patient subdomain. "For Practices" link in patient footer → B2B home. No login, no auth boundary between the two — they're both anonymous marketing surfaces.

## Responsive Behavior

Mobile-first, starting from `xs: 375px` (already defined in Tailwind config).

- **Header.** Desktop ≥1024px: full horizontal nav. Tablet 768–1023px: nav collapses to a hamburger except for the Demo CTA, which remains visible. Mobile <768px: same but Demo CTA shrinks to "Demo" or icon-text.
- **Hero.** Desktop: two-column (headline/CTA left, optional image right). Tablet: single column, headline above image. Mobile: single column, smaller display type (`text-4xl` vs desktop `text-7xl`).
- **Solutions overview tiles.** Desktop: 3-up grid. Tablet: 2-up. Mobile: stacked single-column.
- **Proof metric strip.** Desktop: 4–5 metrics in a row. Tablet: 2x2 grid. Mobile: vertical stack.
- **Customer logo strip.** Desktop: single horizontal row, 5 logos. Mobile: 2-row grid (2 + 3).
- **Demo form.** Single column always. Inputs full-width on mobile.
- **Behavior changes (not just size):**
  - `CaseStudyBlock` switches from side-by-side metric/quote (desktop) to stacked (metric on top, quote below) (mobile)
  - `MedicalDeviceDetailHero` BB8 5-in-1 visual: desktop = annotated diagram with callouts; mobile = vertical list of capabilities (the diagram doesn't read on small screens)
  - `TeamMemberCard` grid: desktop 2-col with full bios; mobile 1-col with collapsed bio (Read more)

## Accessibility Requirements

WCAG 2.1 AA target across both subdomains.

- **Contrast:** body text ≥4.5:1 on its background. Eyebrow caps ≥4.5:1 (caps text is harder to read; don't go below). Disabled-state text exempt by spec but still legible.
- **Color independence:** no information conveyed by color alone. The customer logo strip's hover color-in cannot be the only signal — pair with focus ring on keyboard.
- **Keyboard navigation:** every interactive element reachable via tab. Visible focus states on all interactive elements (the existing button utilities use `focus:ring-2`; keep and extend). Skip-to-content link in `AppShellB2B`.
- **Screen reader:** semantic headings (one h1 per page, no skipping levels). Forms with proper labels (no placeholder-as-label). Buttons vs links used semantically (link to navigate, button to perform action). The demo CTA in the header is an `<a>` to `/request-demo`, not a `<button>`.
- **Focus management:** demo form confirmation state moves focus to the success heading so screen readers announce it.
- **Motion:** respect `prefers-reduced-motion` — no auto-playing video, no parallax, no large entrance animations when reduced.
- **Forms:** error messages are associated via `aria-describedby` and announced via live regions. Required fields marked in label, not just by asterisk.

## Out of Scope

Explicit non-goals for Phase 1, to prevent scope creep.

- **Public pricing page.** Pricing data lives in the deck, not on the site. `PricingTierTable` is built but hidden behind a flag.
- **PS | Authorize page.** Per Q7, deferred. No "Coming Soon" tile, no nav entry.
- **Multi-tenant practice login / customer portal.** No authenticated practice-side experience in Phase 1. Customers call their account manager.
- **Self-serve demo scheduling.** Phase 1 form → email/Slack alert → human follow-up. Calendly embed deferred.
- **HubSpot or other external CRM.** Payload `DemoRequest` collection is the CRM until volume justifies otherwise (≥30 leads/mo per Q16).
- **Phase 2 — AI social-content cockpit.** Not in this brief. Separate brief and separate `.design/social-cockpit/` folder when we get there.
- **Patient subdomain content polish.** Phase 1 = stand up the subdomain + migrate WP content into Payload. Visual/UX polish of patient pages = Phase 3.
- **Excelvoice integration beyond a form POST.** The patient booking CTA POSTs to `app.excelentmedical.com/excelvoice/booking-test` per spec (Q18, inbound). Anything more (deep links, status reads, calendar sync) is owned by the Excelvoice team.
- **Bilingual B2B content.** B2B subdomain is en-only. Patient subdomain keeps the existing en/es i18n via `next-intl`.
- **New auth provider.** No Clerk, no Firebase, no NextAuth. Payload's existing admin auth handles the only authenticated surface (the Payload admin for content + DemoRequest review).
- **WordPress retirement.** WordPress site stays live during Phase 1 as a reference for content migration. Retirement and DNS cutover are explicit deploy steps after Phase 1 ships.
- **301 redirect map.** Tracked in `MEMORY.md` as a separate future-work item; not produced in Phase 1.

---

## Phase 1 deliverables (for reference downstream)

- `b2b-rebuild` git branch off `main`
- B2B route tree at `src/app/(b2b)/*` with: `/` (home), `/solutions`, `/solutions/connect`, `/solutions/lexi`, `/solutions/rcm`, `/products`, `/products/bb8`, `/products/shaver-blades`, `/products/allergyx`, `/how-it-works`, `/why-excelent`, `/request-demo`, `/about`, `/contact`, `/privacy`, `/hipaa`
- Patient route tree at `src/app/(patients)/*` with: `/` (home), `/find-specialist`, `/sinus-education/*`, `/resources/*`, `/local-sinus-specialists/*`, `/conditions/*`, plus migrated WP pages
- Hostname middleware in `middleware.ts`
- New Payload collections: `Solution`, `Product`, `CaseStudy`, `TeamMember`, `DemoRequest`
- WP content migration script (executable from `package.json` script) covering `/sinus-education/`, `/resources/`, `/local-sinus-specialists/`
- Updated Tailwind config + design tokens (next skill: `/design-tokens`)
- Updated typographic scale + Swiss heading utilities

## Tracked dependencies (don't block downstream design work)

- 🟡 **Excelvoice integration spec** (Q18) — needed for `BookingCTA` implementation
- 🟡 **Customer marketing-clearance + final metrics** for Coastal / Florence / Mountain / Island ENT, Triangle Sinus — needed before final case-study copy is written
- 🟡 **Real customer logos** (image assets) for `CustomerLogoStrip`
- 🟡 **Team headshots** for `TeamMemberCard` (Kashif Mazhar, Kevin Monty, Josh Pelger, Eric Honsberger)
- 🟡 **BB8 product photography + 5-in-1 diagram source** for `MedicalDeviceDetailHero`

---

**Brief written:** 2026-04-28
**Author:** Claude Opus 4.7 (1M context) via `/grill-me` → `/design-brief`
**Source artifacts:** grill-me Q1–Q22 transcript · `excelENT Practice Solutions Presentation_March 2026.pdf` · `REDESIGN-PLAN.md` (commit `995b7ef`) · live codebase inventory at `/home/bitnami/stack/excelent-site/`
