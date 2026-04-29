# Information Architecture: excelENT B2B Rebuild

**Two subdomains, one Next.js app, one Payload CMS, one deploy.** Hostname middleware in `src/middleware.ts` selects the route group: `excelentmedical.com` → `(b2b)`, `patients.excelentmedical.com` → `(patients)`.

**Phase 1 only.** Phase 2 (`/admin/social` cockpit) and Phase 3 (patient polish) are out of scope here.

---

## Site Map

### `excelentmedical.com` — B2B Practice Solutions site

```
- Home                                       /
- Solutions (overview)                       /solutions
  - PS | Connect                             /solutions/connect
  - PS | Lexi                                /solutions/lexi
  - PS | RCM                                 /solutions/rcm
- Products (overview)                        /products
  - BB8 Balloon                              /products/bb8
  - Microdebrider Shaver Blades              /products/shaver-blades
  - AllergyX Rinse Kit                       /products/allergyx
- How It Works                               /how-it-works
- Why excelENT                               /why-excelent
- Request a Demo                             /request-demo
- About                                      /about
- Contact                                    /contact
- Privacy                                    /privacy
- HIPAA Notice                               /hipaa
- Terms of Use                               /terms
- 404                                        /404
- (Internal-only, flagged) Pricing Tiers     /internal/pricing
```

### `patients.excelentmedical.com` — Patient experience

```
- Home                                       /
- Find a Specialist                          /find-a-specialist
  - Specialist by city (dynamic)             /find-a-specialist/[city-slug]
- Conditions (overview)                      /conditions
  - Condition detail (dynamic)               /conditions/[slug]
- Sinus Education (hub)                      /sinus-education
  - Education article (dynamic)              /sinus-education/[slug]
- Resources (hub)                            /resources
  - Resource page (dynamic)                  /resources/[slug]
- Local Sinus Specialists (index)            /local-sinus-specialists
  - Local landing page (dynamic)             /local-sinus-specialists/[city-slug]
- About                                      /about
- Contact                                    /contact
- Privacy                                    /privacy
- HIPAA Notice                               /hipaa
- 404                                        /404
```

**URL preservation note (SEO).** Patient-side paths `/sinus-education/*`, `/resources/*`, `/local-sinus-specialists/*` mirror current WordPress URLs **exactly**. When the apex DNS cuts over from WP to Next.js, every existing apex URL gets a `301` redirect to the patient subdomain (e.g. `excelentmedical.com/sinus-education/post-x` → `patients.excelentmedical.com/sinus-education/post-x`). This keeps Google's link equity transfer near-lossless. The redirect map is owned by the deploy step, not this brief, but the IA preserves the slugs that make the redirect possible.

---

## Navigation Model

### B2B subdomain

#### Primary navigation (header)

Six items. Sticky on scroll. Demo CTA always visible.

| # | Label | Behavior | Target |
|---|---|---|---|
| 1 | Solutions | Dropdown (3 items) | `/solutions` (overview) + Connect / Lexi / RCM detail pages |
| 2 | Products | Dropdown (3 items) | `/products` (overview) + BB8 / Shaver Blades / AllergyX |
| 3 | How It Works | Direct link | `/how-it-works` |
| 4 | Why excelENT | Direct link | `/why-excelent` |
| 5 | For Patients | Cross-subdomain link | `https://patients.excelentmedical.com/` |
| 6 | **Request a Demo** | Primary CTA, button-styled | `/request-demo` |

**Dropdown rule:** dropdowns appear on hover (desktop) and tap (mobile, with explicit close affordance). Each dropdown has a top-level "View overview" link that goes to the index page (`/solutions`, `/products`), so the parent label is always reachable.

**Recommended judgment call:** dropdown for Solutions and Products. Alternative is flat nav with each product as a top-level item — that creates 9-item navigation, which is too noisy. Flag this if you'd rather collapse Products into one nav slot and pull individual products into the page only.

#### Secondary navigation

- **Solutions detail pages (`/solutions/[product]`):** in-page section anchors (Capabilities · Case Study · How It Integrates · Demo CTA) shown as sticky right-rail TOC on desktop ≥1280px; collapses to no TOC below that.
- **Products detail pages (`/products/[product]`):** same pattern.
- **Why excelENT page:** in-page anchors (Team · Experience · Philosophy).
- **No persistent sidebar anywhere** — this is a marketing site, not an app.

#### Utility navigation

- Footer link clusters (see Footer below).
- No account dropdown; no login link in the B2B header (admin login is only at `/admin` for Payload, not surfaced in marketing nav).

#### Mobile navigation (B2B)

- ≥1024px: full horizontal nav.
- 768–1023px: nav collapses to hamburger; **Demo CTA stays visible** as a button to the right of the hamburger.
- <768px: same hamburger + visible Demo CTA. Demo button label may shrink to "Demo" if needed for fit, but never goes icon-only.
- Hamburger panel: full-screen overlay, items stacked, Solutions/Products expand inline (not nested drawers).

#### Footer (B2B)

Five columns on desktop, stacked on mobile. Charcoal/near-black background per the brief.

| Column 1: Solutions | Column 2: Products | Column 3: Company | Column 4: Legal | Column 5: For Patients |
|---|---|---|---|---|
| PS \| Connect | BB8 Balloon | Why excelENT | Privacy | (cross-link to patients subdomain) |
| PS \| Lexi | Shaver Blades | How It Works | HIPAA Notice | Find a Specialist |
| PS \| RCM | AllergyX | About | Terms of Use | Sinus Education |
| Request a Demo | (Eustachian Tube — coming) | Contact | | Resources |

Bottom strip: copyright · social icons (LinkedIn primary; others if active) · year.

---

### Patient subdomain

#### Primary navigation (header)

Six items. Sticky on scroll. Booking CTA always visible.

| # | Label | Target |
|---|---|---|
| 1 | Find a Specialist | `/find-a-specialist` |
| 2 | Conditions | `/conditions` (dropdown w/ 4–6 most-trafficked conditions) |
| 3 | Education | `/sinus-education` |
| 4 | Resources | `/resources` |
| 5 | For Practices | `https://excelentmedical.com/` (cross-subdomain) |
| 6 | **Book Appointment** | Direct to `app.excelentmedical.com/excelvoice/booking-test` (per Q15/Q18) |

#### Mobile navigation (patient)

Same hamburger pattern as B2B. **Booking CTA stays visible** on all breakpoints.

#### Footer (patient)

Lighter footer (the existing `#c8dfff` light-blue, retained from current design):

| Column 1: Get Care | Column 2: Learn | Column 3: About | Column 4: Legal | Column 5: For Practices |
|---|---|---|---|---|
| Find a Specialist | Sinus Education | About | Privacy | (cross-link to B2B) |
| Book Appointment | Resources | Contact | HIPAA Notice | |
| Conditions | Local Sinus Specialists | | | |

---

## Content Hierarchy

For each major page, the priority order of what appears top-to-bottom. Not exhaustive — only the load-bearing decisions.

### B2B Home — `/`

1. **Hero with primary CTA.** Headline: *"More Patients. Better Operations. Stronger Revenue."* Sub: per brief. Single primary button → `/request-demo`. Secondary text-link "See how it works" → `/how-it-works`. *Why first:* this is the entire positioning bet in one screen; if a practice owner doesn't get it in 3 seconds, they're gone.
2. **Proof metric strip** (4–5 stats from deck). *Why second:* a B2B medtech buyer is conditioned to scroll past hero; the second band has to earn the third scroll with a number.
3. **The Problem** (4-tile grid: missed calls / staff overload / insurance complexity / billing inefficiency). *Why third:* before solutions land, the buyer needs to feel seen.
4. **Three Pillars** (Educate · Connect · Empower) — adapted from deck slide 1, restated B2B-first.
5. **Platform Overview** ("Business-in-a-Box") — Medical Devices + Practice Solutions tile pair, each clicks through to overview pages.
6. **Solutions tiles** (PS | Connect / PS | Lexi / PS | RCM, each → detail page).
7. **Customer logo strip** (Coastal / Florence / Mountain / Island / Triangle Sinus, when assets ready).
8. **Featured case study** (single, rotating — Triangle Sinus's Connect+Lexi stack story is the marquee).
9. **Why excelENT teaser** (built-by-ENT-experts framing, link to full page).
10. **Final demo CTA block** (`InlineDemoCTA`). *Why last:* the user has read everything; close them.
11. **Footer.**

### Solutions overview — `/solutions`

1. **Page header** (eyebrow "PRACTICE SOLUTIONS PLATFORM" + heading "The full operations stack for independent ENT practices" + 1-paragraph intro).
2. **Three solution tiles** (Connect / Lexi / RCM) — each = headline + 1-line value prop + key stat + "Learn more" link.
3. **Comparison band** (when each one fits — 1 row, 3 cards: "best for [audience]" framing pulled from deck pricing-tier descriptions).
4. **Cross-product case study** (Triangle Sinus stacking story).
5. **Demo CTA.**

### Solutions detail — `/solutions/connect` (template applies to Lexi and RCM)

1. **Hero**: eyebrow ("PS | CONNECT" or "PS | LEXI" or "PS | RCM") + headline + 1-line value prop + demo CTA.
2. **Capabilities** (4–6 bullets, icon-prefixed). Pulled from deck:
   - Connect: Fast Access · Efficient Visits · Minimally Invasive Options · Practice Growth Support
   - Lexi: Real-time insurance verification · After-hours call answering · EMR handoff · HIPAA infrastructure
   - RCM: Denial-rate diagnostic · Coding accuracy · Cash-flow improvement
3. **Service tiers** (Connect: Base / Premium / Platinum; Lexi: Base / Premium / Unlimited). **Built but hidden** behind internal flag — see Out of Scope. Public version shows tier *positioning* (best-for-X markets) without prices.
4. **How it integrates** (for Lexi specifically: the 5-step infra diagram from deck — Patient call → Lexi answers → Encrypted transmission → Secure cloud → EMR handoff).
5. **Customer case study** (1 named, 1–2 anonymized, with real metrics).
6. **FAQ** (5–7 most common practice-owner questions, content-managed in Payload `FAQs` collection w/ a `solution` filter).
7. **Demo CTA.**

### Products overview — `/products`

1. **Page header.**
2. **Two-column intro:** Medical Device Portfolio framing + "Strong R&D pipeline" callout.
3. **Product cards** (BB8 / Shaver Blades / AllergyX, each → detail).
4. **Pipeline badge** ("Eustachian Tube Balloon — pending FDA approval").
5. **Demo CTA.**

### Product detail — `/products/bb8` (template applies to other products)

1. **Hero**: BB8 product image + 5-in-1 capability headline + key stat from deck (`100% success rate`, `0% complications`).
2. **5 functions in 1** (annotated diagram on desktop; stacked list on mobile).
3. **Performance metrics** (`750+ patients`, `3000+ sinuses`, `100%`, `0%`).
4. **Clinical use** (procedure context, who it's for).
5. **Sales support** (callout: "Live trial + staff education available — coordinate with your sales rep").
6. **Demo CTA.**

### How It Works — `/how-it-works`

1. **Hero**: headline "How ExcelENT works for your practice."
2. **Three-step funnel**: Attract → Convert → Optimize. Visual stepper (current `ThreeStepProcess` adapted for B2B — though *content* is fully different from patient-side process).
3. **Per-step detail**: which products power each step.
4. **Demo CTA.**

### Why excelENT — `/why-excelent`

1. **Hero**: headline "Built by ENT experts, for ENT practices."
2. **Decades of experience** strip (the deck's "30,000 observed cases / 60 years immersed" framing).
3. **Team** — `TeamMemberCard` grid: Kashif Mazhar (CEO/Otolaryngologist), Kevin Monty (CRO), Josh Pelger (Clinical Director), Eric Honsberger (PEAP Director).
4. **What we understand** band (the deck's "Sinus anatomy / Anesthesia / Front-desk / Insurance / Pre-op / Provider training" list).
5. **Our philosophy** band — "We help independent ENT practices grow and succeed — not replace them. *Unlike consolidators, we provide products, solutions, and patient flow to keep practices physician-led and community-focused.*" (lifted from deck slide 13).
6. **Demo CTA.**

### Request a Demo — `/request-demo`

1. **Hero header** — short, no marketing fluff. Headline: "Request a demo." Sub: "We'll get back to you within one business day." Sets the expectation up-front.
2. **Form** (`DemoFormBlock`):
   - Required: work email, full name, practice name, role, # providers (select)
   - Optional: current EMR/EHR, current RCM provider, free-text "What's your biggest pain right now?"
   - Submit → in-place confirmation (no redirect).
3. **What happens next** (3-step explainer below the form: "1. We review your request. 2. A team member reaches out within 1 business day. 3. We schedule a working session.").
4. **Trust strip** (HIPAA-compliant · Built by practicing otolaryngologist · Independent-practice friendly).

### Patient Home — `/`  (`patients.excelentmedical.com`)

1. **Hero** (existing) — patient-friendly headline. Primary CTA: "Find a Specialist" → `/find-a-specialist`. Secondary: "Book Appointment" → Excelvoice.
2. **Symptoms section** (existing).
3. **Three-step process** (existing — patient version).
4. **Specialist directory teaser** (existing) — top 3 with "View all" → `/find-a-specialist`.
5. **FAQ** (patient questions).
6. **Booking CTA.**
7. **Footer.**

---

## User Flows

The decision-bearing paths. Other paths exist; only the load-bearing ones are documented.

### Flow B1 — B2B: Practice owner → Demo request

The whole point of the B2B site.

1. User lands on `/` (most likely from search, paid, or direct after a sales call).
2. Reads hero → scans proof strip.
3. **Decision point**: do they recognize their problem?
   - **Yes (most common):** scroll → Solutions tiles → click most-relevant tile (e.g. `/solutions/lexi`) → reads capabilities + case study → clicks demo CTA → fills form → confirmation.
   - **Skeptical (deep researchers):** scroll → Why excelENT teaser → click → reads team + philosophy → clicks demo CTA → fills form.
   - **Bouncing-but-curious:** sticky header demo CTA always available; can convert from anywhere.
4. **Form submission:**
   - On success → in-place confirmation block ("Thanks. We'll be in touch within one business day. — [name]") + secondary content link "While you wait, see our latest case study".
   - Server-side: write to `DemoRequest` collection → fire `afterChange` hook → Slack + email notification.
   - On validation error: inline message at field level; no full-page reload.

### Flow B2 — B2B: Practice owner → Browse a specific solution

Direct entry from search ("ENT virtual front desk", "ENT RCM software", etc.).

1. User lands on `/solutions/lexi` (most likely deep-link from search).
2. Reads hero → capabilities → integration diagram → case study.
3. **Decision point:** demo or read more?
   - Demo: clicks CTA at any of 3 in-page positions → `/request-demo`.
   - Read more: scrolls to FAQ → reads → may click related solution from page footer cross-links.
4. Final state: same as Flow B1 step 4.

### Flow B3 — Patient: Find a specialist nearby

Patient-side primary flow.

1. User lands on `/` (`patients.excelentmedical.com`) or directly on `/find-a-specialist` from search.
2. Sees hero with location-aware copy → clicks "Find a Specialist".
3. **On `/find-a-specialist`:**
   - Search by zip / city / state.
   - Filter by insurance (where data is available).
   - Result list paginated 10/page.
4. Clicks a specialist card → `/find-a-specialist/[city-slug]` (or specialist detail; see Open Question A below).
5. Reads about practice → clicks **Book Appointment** → routes to `app.excelentmedical.com/excelvoice/booking-test` per Q15/Q18.

### Flow B4 — Patient: Read educational content

Discovery/SEO flow. Patients arrive from Google searches like "what is sinusitis" → `/sinus-education/sinusitis` (assuming WP URL preservation).

1. User lands on a deep article in `/sinus-education/[slug]`.
2. Reads → at article end sees CTA: "Find a Specialist Near You" → `/find-a-specialist`.
3. Continues to Flow B3.

### Flow B5 — Cross-subdomain: B2B visitor curious about patient experience

Lower-priority but real (a practice owner wants to see what patients see before signing up).

1. From any B2B page, clicks "For Patients" in header.
2. Lands on patient home (`patients.excelentmedical.com/`).
3. Either browses or returns via "For Practices" footer link.

### Flow B6 — Cross-subdomain: Patient page links to "Are you a practice?"

The reverse of B5. Less common; supported via patient header "For Practices" + footer link.

---

## Naming Conventions

Pick one term, use everywhere. Inconsistency reads as carelessness on a B2B site.

| Concept | Label in UI | Notes / why this word |
|---|---|---|
| The platform's collective offering | **Practice Solutions Platform** | Per deck slide 4. Not "products," not "services," not "offerings." |
| The three software products | **Solutions** | Always plural in nav. Singular when referring to one (e.g., "PS \| Lexi is a solution for…"). |
| Individual solution name | **PS \| Connect** / **PS \| Lexi** / **PS \| RCM** | The pipe separator is the brand convention from the deck. Always with the space-pipe-space. Not "PS Connect," not "Connect by Practice Solutions." |
| The four physical devices | **Products** | Distinct from "Solutions." Always "products" for the medical-device portfolio. |
| The whole offering bundle | **"Business-in-a-Box"** | Used as a tagline only on the Platform Overview section. Not a navigable concept. |
| The buyer | **Practice / ENT practice / partner practice** | Never "client," never "customer-account." "Partner practice" specifically when referring to a practice that has signed on (vs a prospect). |
| The user of patient-side | **Patient** | Not "user," not "consumer." |
| Conversion event (B2B) | **Request a demo** | Not "Get in touch," not "Contact sales," not "Schedule a call." Same wording on every CTA. |
| Conversion event (patient) | **Book Appointment** | Not "Schedule visit," not "Get care now." |
| Inquiries (post-form) | **Demo Request** | What the Payload collection is called. Not "Lead," not "Inquiry." |
| Practice owners (deck team) | **Practicing otolaryngologist / ENT specialist** | Don't say "doctor" generically. |
| Subdomain reference | **patients site / practices site** (lowercase, no caps) | When linking. The B2B site is "the practices site." Reduces formality without losing precision. |
| The CMS admin | **Admin** | Not "Dashboard," not "Backoffice." Lives at `/admin`. |
| Capability list bullets | One-line, sentence case, no period | "Real-time insurance verification" not "Real-time insurance verification." |

---

## Component Reuse Map

Layout/structural components shared across the IA.

| Component | Used on | Behavior differences |
|---|---|---|
| `AppShellB2B` (root layout for B2B route group) | All `(b2b)/*` routes | Sticky header w/ demo CTA, charcoal footer, B2B nav, B2B color-token overrides |
| `AppShellPatient` (root layout for patients route group) | All `(patients)/*` routes | Sticky header w/ booking CTA, light-blue footer, patient nav, current warmer palette |
| `HeaderB2B` | All `(b2b)/*` routes | Solutions/Products dropdowns expand on hover (desktop) and tap (mobile) |
| `HeaderPatient` (current `Header`) | All `(patients)/*` routes | Same component as today; only nav items change |
| `FooterB2B` | All `(b2b)/*` routes | 5-column charcoal footer |
| `FooterPatient` (current `Footer`) | All `(patients)/*` routes | 5-column light-blue footer |
| `InlineDemoCTA` | End of every B2B page (except `/request-demo` itself) | Identical CTA block; one source of truth |
| `BookingCTA` | End of every patient page | Routes to Excelvoice |
| `EyebrowTag` | All section headers across both subdomains | Caps + tracking + small; consistent visual hook |
| `Stat` | `ProofMetricStrip` (home), `Solutions detail` capabilities, `Product detail` performance, `Why excelENT` experience strip | Same number/label structure; size variant prop for hero stats vs inline |
| `EmailCaptureForm` | None (Phase 1) | Reserved for future newsletter capability |
| `TrackingPixels` | Both subdomains | Same component, possibly different IDs per subdomain via env config |
| `CaseStudyBlock` | Solutions detail pages, B2B home, Why excelENT page | Same structure; size variant for full vs teaser |

---

## Content Growth Plan

Where the IA accommodates content that grows.

| Section | Growth model | IA mechanism |
|---|---|---|
| **Solutions detail pages** | Slow (~1/yr — PS \| Authorize next) | Each new solution = new page at `/solutions/[slug]`. Solutions overview tile grid is already 3-up; can extend to 4-up before changing layout. New nav item in Solutions dropdown. |
| **Product detail pages** | Slow (~1–2/yr — Eustachian Tube next) | New page at `/products/[slug]`. "Pending FDA approval" badge state already in design vocab. |
| **Case studies** | Medium (~1/quarter as customer count grows) | Cross-listed: each case study lives in `CaseStudy` Payload collection; surfaces on solution detail pages (filtered by product), home page (curated), Why excelENT (curated). No standalone `/case-studies` index in Phase 1; add when count exceeds ~6. |
| **Sinus education articles** | Medium-fast (WP-migrated 30+ today; ~1–2/month going forward) | `/sinus-education/[slug]`. Index page paginated 12/page. Article taxonomy via `Articles` Payload collection (already exists). |
| **Resource pages** | Medium | `/resources/[slug]`. Same pattern as education. |
| **Local sinus specialist pages** | Medium-fast (programmatic — could grow to 100+) | `/local-sinus-specialists/[city-slug]`. Index page with state-grouped nav and search. Per-city page is a `LandingPages` Payload collection entry with block-based body so copy can be A/B tested per Q20. |
| **Conditions** | Slow (5–10 max) | `/conditions/[slug]`. Flat list. |
| **B2B blog / insights / "for practices" content** | Not in Phase 1 | **Recommendation:** defer. Add `/insights/[slug]` only if demonstrated demand emerges from sales calls. Sales-led B2B with a small content library outperforms a sparse blog. |
| **Demo requests (CRM data)** | Continuous | Lives in `DemoRequest` Payload collection; viewed in Payload admin only. |

**Pagination/filtering rules (where applicable):**
- Article and resource indexes: 12 items/page, query param `?page=2`. SSR for SEO.
- Specialist directory: 10 results/page, query params `?zip=`, `?state=`, `?insurance=`. Client-filtered after initial SSR fetch.
- Local-pages index: state-grouped accordion (no pagination — flat per-state list).

---

## URL Strategy

Rules for URL construction, applied consistently.

### General

- **Lowercase, hyphenated, no trailing slash** — except top-level section pages where Next.js's default `/path` applies. We do not use `/path/`.
- **Plural for index, singular slug for detail** is *not* enforced; we use plural section names (`/solutions`, `/products`, `/conditions`) and let detail slugs match the deck convention.
- **No file extensions** in URLs. Never `.html`, `.php`, etc.
- **No tracking params in canonical URLs.** UTMs welcome on inbound but stripped from `<link rel=canonical>`.

### B2B subdomain patterns

| Pattern | Example | Notes |
|---|---|---|
| Section index | `/solutions`, `/products` | Flat, single segment |
| Section detail | `/solutions/connect`, `/products/bb8` | Two segments, slug matches the established product name |
| Static info pages | `/about`, `/contact`, `/how-it-works`, `/why-excelent`, `/privacy`, `/hipaa`, `/terms`, `/request-demo` | Single segment, hyphenated where multi-word |
| Internal-only flagged | `/internal/pricing` | Not in sitemap.xml; not in nav; gated by Payload-admin auth |

### Patient subdomain patterns

| Pattern | Example | Notes |
|---|---|---|
| Section index | `/find-a-specialist`, `/conditions`, `/sinus-education`, `/resources`, `/local-sinus-specialists` | **All slugs match current WP URLs exactly** for redirect equity |
| Dynamic detail | `/sinus-education/balloon-sinuplasty`, `/conditions/sinusitis`, `/local-sinus-specialists/raleigh-nc`, `/resources/insurance-guide` | Slug from Payload `slug` field; matches WP URL exactly where migrated |
| Static info | `/about`, `/contact`, `/privacy`, `/hipaa` | Single segment |

### Dynamic segments

| Route | Segment | Source | Validation |
|---|---|---|---|
| `/solutions/[slug]` | `slug` | Payload `Solution` collection `slug` field | Must match `^[a-z][a-z0-9-]*$`; 404 on unknown |
| `/products/[slug]` | `slug` | Payload `Product` collection | Same validation |
| `/find-a-specialist/[city-slug]` | `city-slug` | Payload `Specialists` (group-by city) | Lower-kebab, e.g. `raleigh-nc` |
| `/conditions/[slug]` | `slug` | Payload `Conditions` collection (new) or migrated from WP | Same validation |
| `/sinus-education/[slug]` | `slug` | Payload `Articles` collection (filter `category=education`) | Slug equals WP-migrated slug 1:1 |
| `/resources/[slug]` | `slug` | Payload `Articles` collection (filter `category=resource`) | Same |
| `/local-sinus-specialists/[city-slug]` | `city-slug` | Payload `LandingPages` collection | Lower-kebab |

### Query parameters

| Param | Routes | Purpose |
|---|---|---|
| `?page=N` | All paginated indexes | Pagination, 1-indexed |
| `?zip=`, `?state=`, `?insurance=` | `/find-a-specialist` | Filtering |
| `?utm_*`, `?gclid`, etc. | All routes | Inbound tracking; stripped from canonical |
| `?internal=1` | `/internal/pricing` | Reveals hidden pricing tiers (admin/auth check on top) |

---

## Open Questions / Recommended-but-Confirm

These are calls I made in the IA where I'd like an explicit confirm or override:

**A. Specialist detail vs city-aggregated pages.** Current WP appears to use per-city landing pages (`/local-sinus-specialists/[city]`) rather than per-specialist pages. I've kept that. *Recommendation:* keep city-level aggregation; it's better for SEO than thin per-specialist pages. Confirm or override.

**B. Solutions / Products as dropdown in B2B header.** Adds visual complexity but keeps the nav at 6 items. Alternative: flatten to 9 nav items (no dropdowns). *Recommendation:* dropdowns. Confirm.

**C. B2B "About" vs "Why excelENT".** I split these (`/about` is the boilerplate company page; `/why-excelent` is the marketing-grade differentiation page). Could merge into one. *Recommendation:* keep split — `/about` is for legal/company-fact pages (registered address, ownership, etc.); `/why-excelent` is the sales-pitch page. Confirm.

**D. Defer B2B blog / insights.** I'm not adding `/insights/*` to the IA. *Recommendation:* defer until sales surfaces a content gap. Confirm.

**E. Patient `/about` and `/contact` content separate from B2B.** Same paths, different content per subdomain. *Recommendation:* yes — patient about is patient-friendly; B2B about is corporate-fact. Different Payload entries scoped by subdomain field on the `Pages` collection. Confirm.

---

**IA written:** 2026-04-28
**Author:** Claude Opus 4.7 (1M context) via `/information-architecture`
**Source artifacts:** `.design/b2b-rebuild/DESIGN_BRIEF.md` · live codebase (`/home/bitnami/stack/excelent-site/`) · grill-me transcript Q1–Q22 · `excelENT Practice Solutions Presentation_March 2026.pdf`
