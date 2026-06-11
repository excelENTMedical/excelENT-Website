# Changelog

All notable changes to the ExcelENT site (patient + B2B) live here. Most recent at top.

## 2026-05-06 — AI-generated heroes, Title Case sweep, subnav, product navy accent, new product images

A long session focused on visual polish, copy consistency, navigation, and a per-section accent system. All B2B-side; patient site got one new hero (home).

### AI-generated hero images (7 total, all WebP)

- New tooling: `scripts/generate-hero.sh` calls Gemini 2.5 Flash Image ("Nano Banana") via the v1beta REST API. API key kept at `~/.gemini_api_key` (chmod 600), never committed.
- Pilot: patient `/` home went from `hero-main.png` placeholder to a coastal woman taking a deep breath of fresh air at golden hour. Lifestyle direction per user — outdoors, person enjoying fresh air, the core promised benefit of balloon sinuplasty.
- Batch (B2B, professional/business direction): `/b2b` home (ENT at desk reviewing a "Practice Performance" dashboard, rear view, no face), `/b2b/solutions`, `/b2b/solutions/connect`, `/b2b/solutions/lexi`, `/b2b/solutions/rcm`, `/b2b/how-it-works`. All 4:3 to fit the right-column hero slot.
- Source 1024×768 PNGs land in `public/images/heroes-generated/` (~1.3 MB each); finalized 16:9-or-4:3 WebP in `public/images/heroes/` at 30–80 KB each (95–97% size reduction). Wired in via `src=` updates on the seven page files.
- Skipped: founder/team photos (Kashif portrait, team grid), patient testimonial poster (Audrey), product photography (Zack owns), city landing pages.
- Workflow scripts: `scripts/generate-b2b-batch.sh` (all 6 B2B heroes in one run) and `scripts/finalize-heroes.sh` (PNG → WebP optimization).

### Title Case sweep (B2B-only — patient site stays sentence-case)

- New standing rule, captured in `feedback_b2b_title_case.md`: AP-style Title Case across all card/tile titles AND stat labels. Lowercase a/an/the/and/but/or/for/nor + short prepositions ≤3 letters (at, by, in, of, on, to, up). Capitalize 4+ letter prepositions (with, from). Hyphenated phrases capitalize both halves (Higher-Quality, Pre-Op, Real-Time, Light-Guided, HIPAA-Compliant).
- Card/tile sweep — 46 titles across 9 files via `scripts/title-case-sweep.sh`: `ProblemFramingGrid` (4), `solutions/{connect,lexi,rcm}` (8 + 5 + 7), `products/{bb8,allergyx,shaver-blades}` (10 + 4 + 4), `how-it-works` (3), `request-demo` (5).
- Stat-label sweep — 15 labels across `ProofMetricStrip`, `solutions/rcm`, `solutions/connect`, `products/bb8`. Examples: "Patients reached" → "Patients Reached", "Industry denial rate" → "Industry Denial Rate", "Intra/post-op complication rate" → "Intra/Post-Op Complication Rate".
- One-off: `HIPAA-compliant infrastructure` (Lexi compliance card) and `HIPAA-compliant cloud` (Lexi staircase step 4) → `HIPAA-Compliant Infrastructure` / `HIPAA-Compliant Cloud`.

### B2B home hero proof points

- Connector arrow padding `pt-5 md:pt-7` → `pt-2.5 md:pt-3.5` so the arrow lines up with the vertical center of the `12%` / `2.5%` numerals (was sitting too low at the label's centerline).
- "excelENT Partner Denial Rate" now breaks across two lines: `excelENT Partner` / `Denial Rate`.

### State-presence row (`CustomerLogoStrip.tsx`)

- Removed the `NC / SC / GA / FL` abbreviation row. The four state-outline SVGs now sit above just the full state name.
- Bumped state name from `text-sm text-ink-secondary` to `text-base md:text-lg font-semibold text-ink` so it carries the visual weight the abbreviation used to.

### Lexi page — "How it works" staircase

- Steeper stairs: `marginTop: i * 40px` → `i * 72px`. Final step now sits 288 px below the first instead of 160 px.
- L-connector `top: -12px` → `22px` so the horizontal segment begins at the vertical midline of the `01 / 02 / …` step numerals (was floating above them).
- Vertical drop length `52px` → `50px`, arrowhead `top: 42px` → `40px` to land cleanly above each next number.

### B2B nav — subnav under Solutions and Products (`HeaderB2B`, `MobileMenu`)

- `NavItem` type extended with optional `children?: NavItem[]`.
- Desktop: `Solutions` and `Products` get a hover/focus-within dropdown with chevron. Dropdown panel uses the universal `border-l-4 border-[color:var(--color-accent-primary)]` left-purple-border pattern + thin border-y / border-r + shadow.
- Solutions menu: PS | Connect, PS | Lexi, PS | RCM. Products menu: BB8 Balloon, AllergyX Rinse Kit, Microdebrider Shaver Blades.
- Mobile: children render inline indented (pl-4) under their parent in the drawer.
- Parent items still link to their overview page; the dropdown is purely additive.

### New product photography

- User supplied three transparent-background RGBA PNGs (4830×6250 each, 1–9 MB): AllergyX nasal rinse bottle with water splash, BB8 balloon device, Microdebrider shaver blade.
- Resized to 1200 px wide and converted to WebP (`-q 90 -alpha_q 100`). Final sizes: AllergyX 116 KB, BB8 23 KB, Shaver Blades 50 KB.
- Replaced the old PNGs at `public/images/products/{bb8,allergyx,shaver-blades}.webp`. The patient `/balloon-sinuplasty` page also picked up the new BB8 asset.
- Hero container background: `bg-surface-alt` (light gray) → `bg-surface` (white) on the three product detail pages so the transparent PNGs sit on pure white.

### Per-section accent system — Solutions purple, Products navy

- New rule in `tokens.css`: `[data-section="product"]` overrides `--color-accent-primary` (and -hover/-active/-fg/-subtle) plus `--color-border-focus` from the brand purple `#89007a` → navy `#061b42`.
- New `src/app/b2b/products/layout.tsx` wraps every `/b2b/products/*` page in `<div data-section="product">`. Cascades to all left-purple-borders, icons, dot bullets, link hovers, top accent strips automatically — no per-class edits.
- Solutions pages, home, how-it-works, why-excelent, etc. all stay purple. Header/footer global, also stay purple.
- Captured in `feedback_section_accents.md` as a standing rule for any future section-level accent decisions.

### CTA decoupled from accent — buttons stay purple everywhere

- New variables in `tokens.css`: `--color-cta-primary` (and -hover/-active/-fg). Always `#89007a` regardless of section.
- `.btn-b2b-primary` now reads from `--color-cta-primary*` instead of `--color-accent-primary*`.
- Result: every "Request a Demo" CTA stays brand purple even on product pages where everything else turned navy. The `[data-section="product"]` block deliberately leaves CTA variables alone.

### BB8 — "5 functions" → "6 functions" (3 places)

- `/b2b/products` BB8 card tag and description — "5 functions in 1 device" → "6", "function of five" → "function of six".
- `/b2b/products/bb8` SEO metadata title and description — "Five Functions" → "Six Functions"; description rebalanced to enumerate six.
- `/b2b` home (`PlatformOverviewSection`) — `"5 functions in 1 device · 100% success"` → `"6 functions..."`.

### Verified

- `next build` clean across all routes after each major change.
- `pm2 restart excelent-site` after every deploy step; all 7 hero pages return 200 with the right WebP via `_next/image` optimizer.
- Curl spot-checks confirmed: title case live across 9 B2B files, stat labels live, subnav links present in HTML, `data-section="product"` on all 4 product routes, CTA `var(--color-cta-primary)` resolved to `#89007a` in compiled CSS.

### Pending

- Push: blocked, no git remote configured. Hold for now per user.
- Other 4 Lexi flowStep titles ("Patient calls / your phone line", etc.) are still sentence-case — flagged but not swept; user can call when ready.
- ZAC review queue: items 2 (patient stat block), 3 (R&D pipeline + Eustachian Tube card), 5 (anti-PE positioning) still open.
- Cutover infra: DNS + nginx + SSL for `patients.excelentmedical.com`, GTM + booking-widget env vars.

---

## 2026-05-05 (PM) — Patient site, Phase 1: design-system alignment with B2B

First pass on porting the new B2B visual vocabulary to the patient site. All component-layer + token-layer changes — single-file edits propagate across all 16 patient routes (× 2 locales). Page-by-page hero / section work is Phase 2.

### Token-layer change (propagates everywhere)

- **Patient theme: tan → gray.** `[data-theme="patient"]` `--color-bg-secondary` (`#faf8f3` warm ivory) → `var(--neutral-50)`; `--color-bg-tertiary` (`#f5f1e8` warm paper) → `var(--neutral-100)`. `--color-bg-inverse` (`#c8dfff` pale brand blue) → `#ffffff`. Every `bg-surface-alt`, `bg-surface-subtle`, and `bg-surface-inverse` reference across the patient surface area now renders neutral gray / white instead of warm ivory / blue.

### Components

- **`FooterPatient`.** Background `bg-[color:var(--color-bg-inverse)]` (pale blue) → `bg-surface border-t border-edge` (white, matching B2B footer). Logo bumped `h-10 md:h-12` → `h-20 md:h-24` with `sizes="(min-width: 768px) 360px, 280px"` so Next.js `srcset` picks the higher-res variant. All `text-[color:var(--color-text-inverse)]` references rewritten for light bg (`text-ink`, `text-ink-secondary`, `text-ink-tertiary`).
- **`TrustBar`.** Background `bg-surface-subtle` → navy `#061b42` with a 1px purple top accent line. All text white (heading, eyebrow, stats, labels). Same pattern as B2B's `ProofMetricStrip` and RCM "Financial reality".
- **`StepCard`.** Replaced the 48×48 pink-circle number with **`#1 / #2 / #3`** in `text-3xl md:text-4xl` purple, on a white card with `border-l-4 border-[color:var(--color-accent-primary)]` and `p-6 md:p-8` padding. Same format as B2B `/b2b/how-it-works` and `/b2b/request-demo`.
- **`FAQAccordionPatient`.** Full border + `radius-card` rounded corners replaced with the universal `border-l-4` purple pattern (no other border, no radius). Tightened padding (`p-6 md:p-7` → `px-6 py-5`, `pb-6 md:pb-7` → `pb-5 md:pb-6`). Switched the row to `items-center` for vertical alignment of question + chevron. Chevron recolored purple. Hover bg → `bg-surface-alt`.
- **`ArticleCard`.** Full border + `radius-card` rounded corners dropped, `border-l-4` purple applied. Featured variant keeps the side-by-side layout.

### Heading overflow fixes (FAQ overlap)

- **`/[locale]/page.tsx` (home).** Removed `lg:whitespace-nowrap` from the FAQ section heading. With `heading-1-patient` + a 4-col container at `lg`, the nowrap forced the heading to overflow into the FAQ list column (visually overlapping the questions). Now wraps naturally with `text-balance`.
- **`ScheduleCTABreakout`.** Same fix — removed `lg:whitespace-nowrap` from the centered title.

### Local SEO landing pages (`/[landingSlug]`, e.g. `/asheville-nc-sinus-relief`)

- **Treatment + Symptoms sections restructured.** Both were wrapped in `max-w-3xl mx-auto` (768px centered column inside the 1440px page container) AND the inner `prose-patient` enforced its own `max-width: 65ch`. Combined effect: content felt "boxed" inside a narrow strip with whitespace on either side.
- New layout: `grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14`, heading on `col-span-5` (left), prose on `col-span-7` (right) with `max-w-none` to override the prose's 65ch cap. Content now fills the full page-width container while keeping prose at a readable line length on the right side.

### Foundation kept (Phase 2 will build on these)

- Cabin font stays everywhere on the patient site (per standing memory rule).
- Patient blue `#459fdc` retained as the secondary accent — only stat sections use navy `#061b42`.
- Hero radius (`--radius-image-hero`) and other patient-only design tokens left intact.
- Patient site is bilingual (EN + ES) — every component change flows through both locales since translations are in i18n message files, not component strings.

### Verified

- `next build` clean across all routes after each change.
- HTML spot-checks on `/en` and `/asheville-nc-sinus-relief` confirmed: `background:#061b42` on TrustBar, `border-l-4 border-[color:var(--color-accent-primary)]` on cards, `#1` / `#2` / `#3` in StepCard, `prose-patient max-w-none` on landing-page prose sections, `bg-surface border-t border-edge mt-auto` on footer, `h-20 md:h-24` on footer logo.

### Pending (Phase 2 — page-by-page)

Per-page hero + section-specific layout work, iterating with the user the way we did B2B. Routes to revisit: home, sinusitis hub, the 4 sinusitis education pages, find-a-specialist, about, resources, schedule, balloon-sinuplasty, individual landing pages.

### ZAC review impact

- Item #2 (patient stat block — substantiation/claims risk) is **NOT yet addressed.** TrustBar copy + numbers unchanged — only the visual treatment moved to navy. Surface this when ZAC returns.

---

## 2026-05-05 — B2B design-system overhaul + visual polish pass

A multi-session refactor of the entire B2B surface area (10 pages + ~12 components). Established a unified visual vocabulary — left-purple-border boxes, navy `#061b42` stat sections, 75px icons, larger body type — and resolved several open ZAC items (partner logo strip, team swap). Also added a Virtual Office Assistant rename, state-presence imagery, and a responsive how-it-works staircase on the Lexi page.

### Site-wide design system

- **Universal box pattern.** Every card-style component standardized on `border-l-4 border-[color:var(--color-accent-primary)]` (purple) with no other border. Eliminated the previous mix of full borders, divide-x grids, and right-side accents. Applied across `SolutionTile`, `DemoForm`, RCM compliance + business-impact cards, Lexi audience + HIPAA cards, How-it-works step cards, Why-excelENT team + philosophy cards, Request-demo trust + next-step cards, BB8 sales-support card.
- **Navy stat treatment.** Sections that present aggregate numbers now use `background: #061b42` with white text and a 1px purple top accent line. Applied to `ProofMetricStrip` (B2B home), Lexi's "Why this works", RCM "Financial reality", BB8 "Clinical performance" (which also moved *above* the 6 functions per ZAC). Replaced the previous purple-left-border-on-white treatment for these specific blocks.
- **Body font bump.** `globals.css` body now `text-lg md:text-xl` (was `text-base md:text-lg`).
- **Inline-SVG icons → 75px.** Standardized icon size site-wide (Problem framing, Connect capabilities, Lexi audience cards, BB8 6-function grid).
- **Section padding -20%.** Every B2B section's `py-` shrunk one step (a continuation of the 2026-05-01 cut).
- **`#061b42` is the standard "blue".** Saved as a standing memory rule (`feedback_blue_color.md`). Never use `#459fdc` for B2B blue accents anymore.
- **Solutions tiers naming.** Renamed "Service tiers" → "Solutions tiers" on Connect, Lexi, RCM pages.
- **FAQ headings → 2 lines.** `FAQAccordion`'s `title` prop changed from `string` → `ReactNode` so callers can pass `<>Common Questions<br />About PS | Connect</>`. Applied to all 3 solutions pages.

### Home page (`/b2b`)

- **Hero restructured.** Text + CTAs left (`col-span-7`), image (`em-site-photo.jpg`) right (`col-span-5`). Proof strip rebuilt as `12%` → arrow → `2.5%` (Industry Baseline → excelENT Partner Denial Rate) using a CSS line + fixed-size SVG arrowhead (so the connector stretches but the arrowhead stays crisp).
- **Problem section.** 75px centered SVG icons (PhoneOff, Users, Shield, Dollar) replace `01–04`; eyebrow → accent purple; left border removed; layout flipped to `col-span-7` heading + `col-span-5` body with `items-end` so the headline stays on tighter line breaks. Also tightened the gap between the description and the data sentence in each problem card (removed `mt-auto pt-4` so the parent's `gap-4` controls spacing).
- **Three Pillars.** Removed `01/02/03` numbers; bg recolored from accent-subtle pink to `bg-surface-alt` gray.
- **Platform Overview.** Medical Devices side recolored navy `#061b42` (border, eyebrow, h3 "Best-in-industry medical devices", product names, link). Practice Solutions side now has purple `text-[color:var(--color-accent-primary)]` on the h3 ("Software-grade practice operations") and the three product names ("PS | Connect / Lexi / RCM"). Two halves are visually distinct.
- **Practice Solutions tile names title-cased** everywhere: "Patient Prospecting and Growth", "Virtual Office Assistant", "Revenue Cycle Management" (also propagated to PlatformOverviewSection, solutions overview, how-it-works framing labels, hipaa parentheticals).
- **Customer logo strip → state-presence.** ZAC item #1 resolved. Removed all 5 named partner-practice logos. Replaced with cartographically accurate state outlines for NC, SC, GA, FL — generated from the standard `us-atlas-10m` topojson dataset (Douglas-Peucker simplified, equirectangular cos-latitude correction so widths aren't stretched at southern latitudes, north-up orientation). Stored as static SVGs in `/public/images/states/{nc,sc,ga,fl}.svg` filled in brand purple `#89007a`.

### `/b2b/solutions` overview

- Custom hero with `em-site-photo.jpg`, padding shrunk, fit-matrix cards on `border-l-4` purple, eyebrow → accent.

### `/b2b/solutions/connect`

- Custom hero with `next-steps-poster.jpg`. Capabilities row now has 75px centered icons (Zap, Target, CheckCircle, TrendingUp); left border removed. "Why this works" recolored navy with white text. Business-impact cards on `border-l-4` purple. FAQ heading → two lines.

### `/b2b/solutions/lexi`

- Custom hero with `audrey-poster.jpg`. Audience cards: 75px icons (User, Users, Building) centered.
- **How-it-works staircase rebuilt.** 5 steps with `01–05` numbers, `min-h-[260px]`, each `marginTop: i * 40px` for diagonal rhythm, gap-x-6.
- **Connector.** Originally fixed-width SVG (down-then-right) — wasn't responsive. Now a CSS L-connector: `position:absolute; top:-12px; left:84px; right:-60px; height:64px` with horizontal `top:0; h-[2px]` line, vertical `right:0; w-[2px]; height:52px` drop, and a small fixed-size SVG down-arrowhead at the bottom-right. Spans every viewport correctly because `right:-60px` extends past the column gutter so the down arrow lands above the next "0N".
- **Step titles forced to 2 lines.** `flowSteps` `title` field changed from `string` → `ReactNode` so each title can include `<br />`. Splits: "Patient calls / your phone line", "PS | Lexi conducts / the conversation", "Encrypted transmission / and transcript", "Secure / HIPAA-compliant cloud", "Handoff / to your EMR".
- **Section padding -25%.** `py-12 md:py-20 lg:py-24` → `py-9 md:py-[60px] lg:py-[72px]`; heading `mb-10 md:mb-12` → `mb-8 md:mb-9`.
- **HIPAA cards** on `border-l-4` purple.

### `/b2b/solutions/rcm`

- Custom hero with `animation-poster.jpg`. H1 "Cut denials" → **"Reduce Denials"**. "Financial reality" recolored navy. "Bad billing" → **"Faulty billing"**. Compliance + business-impact cards on `border-l-4`. FAQ heading → two lines.

### Product pages (`/b2b/products/{bb8,allergyx,shaver-blades}`)

- Product image moved out of the page body and inlined in the hero right column (`aspect-[4/3]`, `object-contain`).
- **BB8.** Now lists **6 functions** (was 5), with 75px inline-SVG icons (Sun, Unlock, Link, Hand, Wand, Droplet) replacing numbered chips. **Clinical Performance moved above** the 6 functions per ZAC; recolored navy. Sales-support card on `border-l-4`.
- AllergyX + Shaver Blades: same hero pattern; feature cards on `border-l-4`.

### `/b2b/why-excelent`

- ZAC item #4 resolved. Custom hero with `kashif-mazhar-portrait.jpg`. **6 team members in 2-col grid** ordered Kashif/Zack, Kevin/Josh, Samir/Eric. Added **Zack Casazza (CFO)** with `/images/team/zack-casazza.webp` and **Samir Patel (Director of IT)** with `/images/team/samir-patel.webp` (downloaded from production).
- **"Decades of real-world ENT" restructure.** 12-col grid: title + 2×4 expertise list left (`col-span-8` `flex flex-col gap-8 md:gap-10`), stat block right (`col-span-4` with `lg:pt-10` for 40px top padding to align with title baseline).
- **Removed `detail` line** from each team card (e.g., "Practicing otolaryngologist · Raleigh, NC"). The `detail` field also dropped from the `team` data + type so the schema is clean.
- Team + philosophy cards on `border-l-4`.

### `/b2b/how-it-works`

- Custom hero with `em-site-photo.jpg`. Steps now use **`#1 / #2 / #3`** in `text-3xl md:text-4xl` purple, with `items-baseline` on the grid so number + title baseline-align. Step framings updated to "AI Virtual Front Desk" → "Virtual Office Assistant" and "Revenue Cycle Management" title case. Philosophy cards on `border-l-4`.

### `/b2b/request-demo`

- Trust points bumped `border-l-2` → `border-l-4`. Eyebrow `default` → `accent`. Next-step cards on `border-l-4` with `01/02/03` → **`#1 / #2 / #3`** (`text-3xl md:text-4xl`).
- **`DemoForm`.** Container `border border-edge` → `border-l-4 border-[color:var(--color-accent-primary)]`. All field labels title-cased: "Full Name", "Work Email", "Practice Name", "Your Role", **"Number of Providers"**, "Phone (Optional)", "Current EMR / EHR", "Current RCM Provider", "What's Your Biggest Pain Right Now?". (User explicitly corrected to keep capital P in "Providers".)

### "AI Virtual Front Desk" → "Virtual Office Assistant"

- Renamed across all 7 occurrences: home tile, solutions overview tile, lexi metadata title + H1 + image alt + bio description, how-it-works framing, hipaa parenthetical, PlatformOverviewSection tag. The `AI` prefix was dropped per user direction.

### Component changes

- **`InlineDemoCTA`.** Background `var(--color-accent-primary-subtle)` (light pink) → `bg-surface-alt` (gray). Single change propagates to every page using the component.
- **`FooterB2B`.** Background `bg-surface-alt` → `bg-surface` (white). Logo bumped `h-10 md:h-12` → `h-20 md:h-24` with `sizes="(min-width: 768px) 360px, 280px"` so Next.js `srcset` picks a higher-res variant.
- **`CaseStudyBlock`.** Customer/partner phrasing changed to "local ENT partner" (heading, body, attribution, aria-label).
- **`HeroB2B`.** Reduced from 4 proof points to a single before/after pair with arrow connector.
- **`FAQAccordion`.** `title?: string` → `title?: ReactNode` (with `import type { ReactNode } from 'react'`).

### Memory + reference

- **New `feedback_blue_color.md`** standing rule: B2B "blue" defaults to `#061b42` (navy), never `#459fdc` (which remains valid for the patient site only). Indexed in `MEMORY.md`.

### Verified

- `next build` ran clean across all routes after each change.
- `pm2 restart excelent-site` triggered after each rebuild; production mode is `next start`, not dev — hot reload doesn't apply.
- HTML spot-checks confirmed each rename / reflow took (no stale "Industry baseline" lowercase, no stale "Patient prospecting" lowercase, no "Virtual Front Desk" remaining anywhere on the served HTML).

---

## 2026-05-01 (PM) — ZAC review batch #1: copy/layout straight-through fixes

Round 1 of the PDF review (`ZAC Website Notes_043026.pdf`, 52 comments). The straightforward edits — copy tweaks, layout fixes, capitalization, blinding the named customer, logo normalization. Strategic decisions (named partner-practice logo strip, patient stat claims, R&D pipeline section, anti-PE positioning, team swap to add Zack, Eustachian Tube card) deferred for ZAC sign-off.

### B2B copy edits
- **Hero proof strip:** "No marketing hand-waves" → **"No empty marketing promises"**
- **Problem section:** "squeezed from four sides" → **"squeezed from all sides"** + `text-balance` / `text-pretty` on cards to avoid orphan-word wraps
- **Three Pillars (`Educate. Connect. Empower.`):** removed "not surgery" framing → **"minimally invasive, in-office procedures"**; added **"local partner practices for immediate relief"** to the Connect pillar
- **Platform Overview ("Business-in-a-Box"):** card titles dropped from `text-3xl` → `text-2xl` + `text-balance` to keep on a single visual block; body rewritten to **"Three connected tools — Connect, Lexi, and RCM —"** + **"built for your in-office practice — built for ENTs, by ENTs"**
- **RCM card** (B2B home + Solutions page): added **"For ENT, by ENT billing experts —"** to description
- **Solutions page heading:** "Pick the bottleneck. We'll fix it." → **"How Our Solutions Work Together"** with subhead **"Pick the bottleneck. We'll remove it and unlock your potential."**
- **Products page hero:** removed the word "actually"; dropped trailing **"Plus a growing R&D pipeline."** sentence
- **How It Works steps:** step number now sits inline with the step title (vertically centered, single horizontal axis) instead of stacked above; titles forced `whitespace-nowrap`. Right-column header **"Products in play" → "Solutions Utilized"**
- **Why excelENT:** Eric Honsberger bio rewritten to **"15 years assisting ENTs grow their practice presence across the Northeast"**; left-column ↔ stats whitespace tightened (`gap-10 lg:gap-16` → `gap-6 lg:gap-8`)
- **Capitalization:** "Observed Cases", "Combined Years in ENT", "Meet the Team" — applied on `/b2b/why-excelent`, `WhyExcelentTeaser`, and `/b2b/about`
- **Final CTA (`InlineDemoCTA`):** deleted "We respond within one business day."

### B2B blinding the customer
- **Triangle Sinus → Southeast Customer.** `CaseStudyBlock` heading rewritten to "A Southeast partner runs the full Practice Solutions stack." Quote attribution: "Practice administrator, Southeast Customer" (no city). Removed link to nonexistent `/b2b/customers/triangle-sinus` (also pulled the now-unused `Link` and `ArrowRight` imports). Source caption: "Customer name withheld at customer's request."
- **Pending strategic decision (deferred):** the named partner-practice logo strip on B2B home (`CustomerLogoStrip`, 5 named practices). ZAC: "we'd just create targets for other competitors." Awaiting decision: remove vs. anonymize vs. keep with anonymized label.

### Patient site copy edits (EN + ES)
- **Hero subhead:** "Chronic congestion, sinus headaches…" → **"Learn about your treatment options, and schedule an appointment with us if you're interested in seeing a professional ENT."**
- **Three steps relabeled:** "We connect / We treat / You breathe" → **"Connect / Personalized Treatment / Improved Quality of Life"**
- **Education section:** "Understand what's happening" → **"Understand your symptoms"**; "Plain-language guides" → **"Helpful guides"** (applied on home + sinusitis hub subhead)
- **Final CTA + FAQ headings:** added `lg:whitespace-nowrap` so "Ready to feel like yourself again?" and "What patients ask first." stay single-line on desktop (still wrap on mobile via `text-balance`); CTA breakout container widened `max-w-3xl` → `max-w-4xl`

### Logo aspect-ratio normalization (4 components)
- All four logo declarations (`HeaderB2B`, `FooterB2B`, `HeaderPatient`, `FooterPatient`) now declare native source dimensions `width={1920} height={641}` so Next.js/Image preserves the exact 2.9954:1 native ratio. Previous mix of `180×60` (3.0:1) and `210×70` (3.0:1) introduced ~0.15% horizontal stretch that ZAC kept noticing. Patient footer logo upsized: `h-10` → `h-10 md:h-12`.
- B2B footer tagline rewritten + `Practice Solutions Platform` forced `whitespace-nowrap` so it stops wrapping mid-sentence.

### Site-wide spacing + accent color
- Cut heaviest section padding **B2B:** `py-16 md:py-24 lg:py-32` → `py-12 md:py-20 lg:py-24` across all home/solutions/products/how-it-works/why-excelent sections (11 files, sed-applied).
- Cut heaviest section padding **Patient:** `py-20 md:py-28` → `py-16 md:py-20` across home + about.
- Added new **`navy`** tone (`#061b42`, the brand dark blue) to `EyebrowTag`. Applied to "The Platform" and "The Problem" eyebrows on B2B home as a first taste of dark-blue accent that ZAC asked for site-wide.

### Pending strategic items (in ZAC's review queue)
1. **Named partner-practice logo strip** on B2B home — remove vs. anonymize vs. keep
2. **Patient stat block** (1M+ / 97% / 95% / 20 min) — substantiation/claims-risk concern
3. **R&D pipeline section** + Eustachian Tube card on `/b2b/products` — remove vs. keep
4. **Team swap on `/b2b/why-excelent`** — replace Josh with Zack vs. add Zack as third row; rename heading to "Platform Leadership: ENT Experts"
5. **Anti-PE / "Arm the Rebels" positioning** — new tagline / new section / thread through existing copy
6. **Picture-quality pass** on the four product cards — ZAC owns

### Pending ZAC's homework (he said he'd handle)
- Sensitivity table to replace the `$3M practice` denial example
- Hero/headline tagline polish
- Image quality pass on product cards
- Logo confirmation w/ Christine
- Charts/graphics to "spice up" pages

### Verified
Production `next build` ran clean. `pm2` restarted. All 10 modified routes return 200. Spot-check across 30+ expected copy strings — all rendered correctly (one false positive on "We treat" was the unrelated `belief4` copy "We treat surgery as a last resort").

---

## 2026-05-01 — Patient site v1.5: positioning pivot, real content, city SEO, structured data

### Strategic positioning
- **Stripped all partner-practice and "ENT" / "specialist" copy** from the patient site. No mentions of Triangle Sinus / Coastal ENT / Mountain ENT / Florence ENT / Island ENT, no doctor names tied to those practices, no "find a specialist near you" CTA. Replaced with ExcelENT brand voice and "doctor" / "we" language.
- **Patient site no longer has a specialist directory.** `/find-a-specialist` URL kept (for backlinks) but rebuilt as a state/city SEO directory listing 4 states and 5 cities ExcelENT serves.
- **Partner-practice logos remain on the B2B site only** (`/b2b`) — that's a B2B audience and the trust strip is on-brand there.

### Visual / typography
- **Switched to Cabin font everywhere** in the patient site (display + body). Previous Fraunces-variable + Inter system removed, including all `font-variation-settings` axes. `--font-cabin` is the only patient-site font now.
- **Logo aspect ratio fix** in 4 places (patient header + footer, B2B header + footer). The logo is natively 1920×641 (3:1); previously declared as 180×56 (3.21:1), which forced a horizontal stretch via the rendered `aspect-ratio` CSS.

### Sinusitis education hub
- Restructured `/sinusitis` to list 5 topics: What is sinusitis, Symptoms, Treatment, Balloon sinuplasty, FAQs.
- **Pulled real content from excelentmedical.com** for each education page (cleaned of nav-leak + boilerplate). Stored as TypeScript content modules in `src/content/sinusitis/`.
- **New page `/sinusitis/faqs`** with 15 Q&A entries (5 general sinusitis FAQs we wrote + 10 balloon-sinuplasty FAQs from WP).
- Renamed `/sinusitis/management-and-treatment` → `/sinusitis/treatment` (308 redirect added).

### Resources / blog
- **Crawled 14 articles** from WP `/resources/` pagination (5 pages of pagination), extracted title, excerpt, body blocks, featured image, published date.
- **Downloaded all featured images** to `public/images/articles/` and stored articles as TypeScript modules in `src/content/articles/` (one per article + an `index.ts` with `getArticles` / `getArticleBySlug`).
- `/resources` index, `/resources/[slug]` detail, and the home-page article preview all read from local content now (Payload helpers no longer used for articles).
- All 14 article slugs are statically pre-rendered for both EN and ES via `generateStaticParams`.

### Videos
- **VimeoEmbed component** — privacy-friendly: shows poster + play button, only loads the iframe on click.
- **Patient testimonial video** (Vimeo `850210355`) embedded on the home page in a "Patient story" section.
- **Procedure walkthrough video** (Vimeo `850209661`) embedded on `/balloon-sinuplasty` above the article body.
- Poster frames downloaded from WP to `public/images/site/`.

### City SEO landing pages
- **Full SEO landing template** at `[landingSlug]/page.tsx` — when no Payload `landing-pages` doc is published, the route renders a templated page using data from `src/content/locations.ts` and copy from `src/content/city-seo-template.ts`.
- Page sections: symptom-driven hero ("Hey {city}, are you suffering...") with 5 symptom pills, value props, patient story video, local trust card with city image + 3 paragraphs, "Sinus infection treatment in {city}, {state}" prose, "Symptoms / causes / treatments" deep section with 4 H3 subsections, 6 city-personalized FAQs, nearby cities cross-link grid, final CTA.
- **5 cities go live** statically: `/raleigh-nc-sinus-relief`, `/asheville-nc-sinus-relief`, `/florence-sc-sinus-relief`, `/savannah-ga-sinus-relief`, `/venice-fl-sinus-relief`.
- **Real city photos** downloaded from Wikimedia Commons (skylines/landmarks) to `public/images/cities/`, optimized to 1920px max + 82% quality. Hero uses the abstract brand image; local-trust section uses the city photo.
- A published Payload `landing-pages` doc still wins per-slug — populating one in admin overrides the template entirely.

### B2B trust strip
- **Replaced text-only placeholders** in `CustomerLogoStrip` with real partner logos: Triangle Sinus, Coastal ENT, Florence ENT, Mountain ENT, Island ENT. Logos served from `public/images/customers/`.

### About page
- **Full rebuild.** Hero → "Why we exist" mission → "What we believe" 4-belief grid → trust stats → featured founder card (Dr. Mazhar) → 3-up team grid (Kevin Monty, Josh Pelger, Eric Honsberger) → final CTA.
- Team bios rewritten to drop partner-practice references — Dr. Mazhar positioned as ExcelENT founder, others as ExcelENT operators (Patient Network Lead / Clinical Operations / Patient Awareness Lead).

### SEO depth pass
- **`StructuredData` component** + schema builders in `src/lib/structured-data.ts`: `organizationSchema`, `websiteSchema`, `articleSchema` (BlogPosting), `medicalWebPageSchema`, `faqPageSchema`, `localBusinessSchema` (MedicalBusiness/LocalBusiness), `breadcrumbSchema`.
- **Sitewide:** Organization + WebSite JSON-LD on every page via the patient layout.
- **Per-page:** BlogPosting + Breadcrumb on article detail; MedicalWebPage + Breadcrumb on the four sinusitis education pages and `/balloon-sinuplasty`; FAQPage + Breadcrumb on `/sinusitis/faqs`; LocalBusiness + FAQPage + Breadcrumb on each of the 5 city pages.
- **`pageMetadata` helper** in `src/lib/page-metadata.ts` — every patient page now emits canonical URL (locale-specific), full hreflang set (`en`, `en-US`, `es`, `es-US`, `x-default`), Open Graph (with page-specific images on city pages and articles), and Twitter Card metadata.
- **Verified:** all schemas parse as valid JSON-LD; `/raleigh-nc-sinus-relief` emits 5 schemas, articles emit 4, education pages emit 4.

### Cleanup
- Deleted `SpecialistCard.tsx`, `ZipCodeMatcher.tsx`, and the entire `/specialists/[slug]/` route — no longer needed after the directory pivot.
- Deleted empty `(frontend)/` route group dir.

### Files added
- `src/content/articles/` — 14 article TS modules + `index.ts` + `_types.ts`
- `src/content/sinusitis/` — 5 education content modules
- `src/content/locations.ts` — 4 states / 5 cities
- `src/content/city-seo-template.ts` — templated SEO copy with `{city}` / `{state}` interpolation
- `src/components/patient/VimeoEmbed.tsx` — click-to-load Vimeo embed
- `src/components/patient/EducationArticle.tsx` — generic block renderer for education pages
- `src/components/StructuredData.tsx` — JSON-LD `<script>` injector
- `src/lib/structured-data.ts` — schema builders
- `src/lib/page-metadata.ts` — canonical/hreflang/OG helper
- `public/images/articles/` — 14 featured images
- `public/images/cities/` — 5 city skyline photos
- `public/images/customers/` — 5 B2B partner logos
- `public/images/site/` — 5 site-wide images (Audrey poster, Animation poster, Next Steps poster, EM site photo, Kashif portrait)

---

## 2026-04-30 — Patient site v1: clean rebuild on `(patient)/[locale]/`

- Full deletion of `(frontend)/[locale]/` and orphaned components.
- 17-page IA built from scratch with Payload CMS bindings: home, /schedule, /find-a-specialist, /sinusitis hub + 3 subpages, /balloon-sinuplasty, /resources index + detail, /about, /privacy, /terms, /cookies, /hipaa, paid landing template `[landingSlug]`.
- ExcelVoice booking widget integrated (Pattern A inline at /schedule, Pattern C global modal triggered by every Schedule button).
- Spanish-first translation for nav/CTA/marketing copy; missing-translation banner on long-form English-only pages.
- 24 legacy WordPress redirects (308) + sitemap + robots.txt.
- See `.design/patient-rebuild/DESIGN_BRIEF.md` and `INFORMATION_ARCHITECTURE.md` for the full plan.

## 2026-04-29 — Initial Payload CMS migration

- Next.js 15 + Payload CMS 3 + PostgreSQL 15 wired up.
- WordPress visual redesign deployed (purple gradient hero, Cabin/Montserrat type, 5-column footer).
- See git commit `995b7ef` for the full snapshot (60 files).
