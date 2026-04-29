# Design Review: B2B Above-the-Fold (homepage)

**Reviewed against:** `.design/b2b-rebuild/DESIGN_BRIEF.md` · `INFORMATION_ARCHITECTURE.md` · `DESIGN_TOKENS.md`
**Philosophy:** Swiss / International Typographic with restrained purple accent
**Date:** 2026-04-29
**Branch:** `b2b-rebuild` @ `1d84d03` + uncommitted follow-up sections (Problem · Pillars · Platform Overview · Customers · Case Study · Why-excelENT · InlineDemoCTA · logo + lighter footer + lightened proof strip)
**URL reviewed:** http://localhost:3000/b2b

## Screenshots Captured

| Screenshot | Breakpoint | Description |
|---|---|---|
| `screenshots/review-homepage-desktop-1280.png` | Desktop 1280×8345 | Full-page, B2B homepage |
| `screenshots/review-homepage-tablet-768.png` | Tablet 768×10009 | Full-page, stacked layouts |
| `screenshots/review-homepage-mobile-375.png` | Mobile 375×12332 | Full-page, single-column |
| `screenshots/crops/desktop-01-hero.png` | Desktop hero | Headline + CTAs + RCM proof callout |
| `screenshots/crops/desktop-02-proof-strip.png` | Desktop proof strip | 4-stat band, lightened |
| `screenshots/crops/desktop-03-problem.png` | Desktop problem | 4 numbered tiles |
| `screenshots/crops/desktop-04-pillars.png` | Desktop pillars | Educate / Connect / Empower (purple-tint bg) |
| `screenshots/crops/desktop-05-platform.png` | Desktop platform | Devices \| Solutions split |
| `screenshots/crops/desktop-06-solutions.png` | Desktop solutions | 3-tile PS solutions row |
| `screenshots/crops/desktop-07-customers.png` | Desktop customers | 5-partner logo strip (text placeholders) |
| `screenshots/crops/desktop-08-case-study.png` | Desktop case study | Triangle Sinus narrative + bar chart |
| `screenshots/crops/desktop-08b-case-study-detail.png` | Desktop case study (zoom) | Detailed crop |
| `screenshots/crops/desktop-09-why-excelent.png` | Desktop why excelENT | Stats + team grid (initial placeholders) |
| `screenshots/crops/desktop-10-cta-and-footer.png` | Desktop final CTA + footer | Closing conversion + lightened footer |
| `screenshots/crops/mobile-375-header-zoom.png` | Mobile 375 header | Logo + Demo button + hamburger |
| `screenshots/crops/mobile-375-{top,upper,lower,bottom}.png` | Mobile 375 quartiles | Full-page mobile stacking |
| `screenshots/crops/tablet-768-{top,upper,lower,bottom}.png` | Tablet 768 quartiles | Full-page tablet adaptation |

> All screenshots in `/home/bitnami/stack/excelent-site/.design/b2b-rebuild/screenshots/`. Captures via headless chromium 147 + puppeteer-core; full-page mode, 1× device pixel ratio.

---

## Summary

The aesthetic intent lands. Swiss-restrained typographic hierarchy reads from the first scroll, the purple accent works as a register-mark color (eyebrow caps, left-borders, single highlighted word in the hero), and the previous "too much black" critique is resolved — there are zero charcoal bands above the fold and a lightened footer at the bottom. The page now has substantive vertical depth (10 sections, ~8,300px desktop) and the brand thread (Cabin / Montserrat / restrained purple-700) is intact across the rebuild.

The single biggest finding is **content integrity**: the Triangle Sinus case-study sidebar shows a fabricated `+78%` headline and an inaccurate Q4 bar value (`$50.5K`). Per the brief's "Proof over promise" principle this is a must-fix. Beyond that, the issues are accessibility hygiene (contrast on `text-ink-tertiary`, focus indicator coverage, an unwired mobile menu) and a few polish items (hero feels top-heavy, customer-logo strip is text-only).

---

## Must Fix

1. **Fabricated case-study metrics** in `src/components/b2b/CaseStudyBlock.tsx`. The sidebar shows `+78% Q4 2025 vs Q1 2025` and a bar chart with `Q1=$28.4K · Q2=$13.6K · Q3=$15.5K · Q4=$50.5K`. The deck (slide 9 of `excelENT Practice Solutions Presentation_March 2026.pdf`) shows Q1=$28.4K, Q2=$13.6K, Q3=$15.5K, Q4=$23.9K — i.e. quarterly patient payments oscillated and ended slightly below Q1, not up 78%. See `screenshots/crops/desktop-08b-case-study-detail.png`. *Fix:* either (a) replace the metric with a real one cleared with the customer (e.g. "consistent quarterly patient flow across 2025" + the actual quarterly bars), (b) change the framing to a different verifiable Triangle-Sinus metric (call answer rate, appointment volume — anything in the deck), or (c) anonymize the section and label it "illustrative" until you have real cleared metrics. **Do not ship with the current values.** This is exactly the "no marketing hand-waves" failure the proof strip explicitly disavows two screens up.

2. **Mobile menu button is unwired.** `src/components/b2b/HeaderB2B.tsx:62-82` renders a hamburger icon but has no `onClick`, no menu drawer, no state. On `<lg` breakpoints, primary nav (Solutions, Products, How It Works, Why excelENT, For Patients) is **completely unreachable**. See `screenshots/crops/mobile-375-header-zoom.png` — the hamburger is visually present but tapping it does nothing. *Fix:* implement the menu drawer (full-screen overlay, items stacked, close affordance, focus trap, Escape to close). Alternatively, ship without the hamburger and accept that mobile users only get the Demo CTA (worse). The brief specifies the mobile pattern in §"Responsive Behavior".

3. **`text-ink-tertiary` (`neutral-400` = `#a1a1aa`) on white fails WCAG AA contrast** for body text. Computed ratio ≈ 3.4:1; AA requires 4.5:1 for text <18px. Affected:
   - `HeaderB2B.tsx:46` — "For Patients" link in nav
   - `Stat.tsx:22` — caption text
   - `ProblemFramingGrid.tsx:88` — italic supporting stats at bottom of each tile
   - `FooterB2B.tsx:91` — bottom-strip copyright + legal
   - `PlatformOverviewSection.tsx` — small device/solution tags
   - `WhyExcelentTeaser.tsx` — team-card details
   *Fix:* darken the tertiary token to at least `neutral-500` (`#71717a`, ratio ≈ 4.6:1 — passes) in both the B2B and Patient theme blocks of `src/app/tokens.css`. One-line edit, ripples to all affected components automatically.

## Should Fix

4. **Focus indicators are inconsistent across links.** `btn-b2b-primary`, `btn-b2b-secondary`, `HeaderB2B` logo, hamburger, `SolutionTile` all have `focus-visible:shadow-focus`. But `HeaderB2B` nav items, `FooterB2B` link clusters, hero "See how it works", `PlatformOverviewSection` "Explore all..." inline links, `CaseStudyBlock` "Read the full case study" link all rely on browser default outline (which Tailwind base resets). Keyboard users trying to navigate the page won't see focus. See screenshots — none show focus state because nothing is focused, but I verified by code inspection. *Fix:* either add a global `*:focus-visible { box-shadow: var(--shadow-focus); outline: none; }` rule scoped to the `(b2b)` route, or add a shared `.focus-ring` utility class and apply it on every interactive `<Link>` and `<a>`.

5. **Stat component double-announces value/label.** `Stat.tsx:21` sets `aria-label="${value} ${label}"` on a wrapping div that *also* has the visible value and label inside as plain text. A screen reader will announce both — "265K Patients reached. 265K. Patients reached." *Fix:* drop the `aria-label`; the natural reading order from the inner DOM is already correct.

6. **Hero feels top-heavy at desktop ≥1280px.** The headline stacks across three lines ("More Patients. / Better Operations. / Stronger Revenue.") because each clause has its own `<br />`. Combined with `xl:text-[5.5rem]` (88px) display sizing, the hero block is taller than the right-column proof callout, making the two columns visually misaligned at top. See `screenshots/crops/desktop-01-hero.png`. *Fix options:*
   - Drop the manual `<br />` between "More Patients." and "Better Operations." so they wrap naturally on one line at desktop, splitting only "Stronger Revenue." onto its own line for the colored emphasis.
   - OR vertically center the proof callout against the hero text block (`items-center` instead of `items-start` on the grid).
   - OR reduce the `xl:text-[5.5rem]` to `xl:text-7xl` (72px) — closer to the brief's 5xl-display token.

7. **CustomerLogoStrip is text placeholders only.** Per the brief this section should drive "logos provided per Q17". See `screenshots/crops/desktop-07-customers.png`. *Fix:* placeholder is acceptable for now (the placeholder text + city is informative), but mark explicitly in the component header as `// TODO: Swap to <Image> when logo assets land in /public/images/customers/` so it doesn't get shipped to production accidentally.

8. **Hero secondary text-link "See how it works →"** uses a Unicode right-arrow character (`→`). On Windows Chrome with `Cabin` as the rendering font, the arrow may fall back to system font, breaking visual cohesion. *Fix:* swap to an inline SVG (12-line icon component) or to `→` wrapped in a `font-display` span. Same applies to all `→` arrows in `SolutionTile`, `PlatformOverviewSection`, `CaseStudyBlock`.

9. **`bg-white/95` hardcoded in `HeaderB2B.tsx:15`** breaks if B2B dark mode ever activates (white-translucent on neutral-950 will look wrong). The opacity modifier on a CSS-variable token is a known Tailwind 3 limitation. *Fix:* add a small custom utility in `globals.css`:
   ```css
   .bg-surface-translucent { background-color: color-mix(in srgb, var(--color-bg-primary) 95%, transparent); }
   ```
   and use that instead of `bg-white/95`. Theme-aware out of the gate.

## Could Improve

10. **Proof metric strip stat captions wrap unevenly** on desktop because the four labels have different lengths. Cosmetic but slightly distracting. *Suggestion:* equalize captions to a similar character count (e.g. tighten "Initial visits delivered to partner practices via PS | Connect" to ~50 chars to match the others), or set `min-h-[5rem]` on the caption block so all four stats line up vertically.

11. **No animation on stat reveal.** Big numbers like `265K`, `100%`, `2.5%` feel inert. Swiss is restrained but not dead — a count-up animation triggered on `IntersectionObserver` (respecting `prefers-reduced-motion`) would add a single moment of motion in an otherwise static layout. *Suggestion:* implement on `Stat.tsx` with a small custom hook; keep duration ≤500ms; bypass for `prefers-reduced-motion`.

12. **`ProblemFramingGrid` tile borders use brittle conditional classes.** `src/components/b2b/ProblemFramingGrid.tsx:79-82` has 4-tile-specific border logic (`i < 3 ? 'border-b...'`). If the count ever changes to 3 or 5, the dividers break. *Suggestion:* refactor to the `gap-px bg-edge` pattern used in `WhyExcelentTeaser.tsx:79`. Same visual result, count-agnostic.

13. **Divider technique inconsistent across sections.** ProofMetricStrip uses `border-l-2` per item; ProblemFramingGrid uses conditional borders; SolutionTilesRow uses `divide-x`; WhyExcelentTeaser uses `gap-px bg-edge`; PlatformOverviewSection uses `border-r`. All produce thin dividers but via different mechanisms. *Suggestion:* standardize on `gap-px bg-edge` for grid dividers and `border-l/r` for vertical accents on individual cards. Document in `DESIGN_TOKENS.md`.

14. **Three Pillars cards look slightly "floating"** because the section bg (purple-tinted `--color-accent-primary-subtle`) doesn't extend to give the cards a strong visual anchor. *Suggestion:* either remove the shadow on the cards (purist Swiss) or add a stronger top/bottom border to the section. Subjective — depends on whether you want the cards to feel weightier or more recessed.

15. **InlineDemoCTA could earn a sharper closing line.** Currently "Ready to grow your ENT practice?" is generic. The brief's `Authority over warmth` principle suggests something more declarative — e.g. "Stop bleeding revenue to denials, missed calls, and consolidators." Heavier framing, more in keeping with the rest of the page voice.

## What Works Well

- **Visual hierarchy** is strong throughout. Each section has a clear eyebrow → headline → body → content pattern that orients the reader within 2 seconds of arriving on the section. The eyebrow caps in purple-700 are doing real work — they look intentional, not like Bootstrap defaults.
- **Color discipline.** With one exception (`bg-white/95`), every color in the new components flows through the token system. `text-ink`, `bg-surface`, `border-edge` etc. — clean separation from raw hex values. Theme-switching to patient or future B2B-dark just works.
- **Type ramp.** The Swiss-tuned scale (the new `5xl-display` and `6xl-display` token sizes) reads as authoritative without being shouty. The display-vs-body weight contrast (Montserrat 700 vs Cabin 400) is exactly the gap the brief called for.
- **Lightening pass landed cleanly.** The proof-strip flip from charcoal to off-white-with-purple-accent is a strong call: same weight, way less heaviness, and the 1px purple top accent gives it Swiss "register mark" punctuation. Footer flip to `bg-surface-alt` is the same idea — addresses the user feedback completely.
- **Numbered systems (01, 02, 03, 04).** Used consistently for ProblemFramingGrid and ThreePillarsSection. Pure Swiss; no decorative icons doing the work that numerals + type can do better.
- **Real logo integrated.** Header and footer now use `/images/logo.png` correctly, with appropriate sizing and `priority` flag on the header for LCP. See `screenshots/crops/desktop-10-cta-and-footer.png` and `mobile-375-header-zoom.png`.
- **Customer logo strip honesty.** Even as text placeholders, the section is functional — five named partner practices with cities. The brief said "we do not fabricate testimonials"; this respects that by being explicit about which practices exist without faking logos.
- **Heading hierarchy is correct.** One h1 (hero), eight h2s (one per major section), h3s for items within. Section landmarks (`<section>`, `<aside>`, `<header>`, `<footer>`, `<nav>`, `<main>`) used semantically. Logo has alt text. Decorative arrows have `aria-hidden="true"`.
- **Reduced-motion is wired.** `tokens.css:215-221` zeroes the duration tokens under `prefers-reduced-motion: reduce`. Only thing missing is the count-up suggestion in (11), which would also need to respect this.
- **Mobile stacking is clean.** All multi-column layouts collapse to single column at <md without overflow or weird gaps. See `screenshots/crops/mobile-375-{top,upper,lower,bottom}.png`. Sticky header + Demo CTA stay reachable at every scroll position.

---

## Refinement priority order

1. (Must) Fix the Triangle Sinus case-study metrics — content integrity is the #1 promise of the brief.
2. (Must) Wire the mobile menu OR remove the hamburger.
3. (Must) Bump `text-ink-tertiary` to `neutral-500` for WCAG AA contrast.
4. (Should) Add focus-visible coverage on all interactive elements.
5. (Should) Fix `Stat` aria-label double-announcement.
6. (Should) Adjust hero headline line breaks or proof-callout alignment.
7. (Should) Mark `CustomerLogoStrip` as placeholder in the component header.
8. (Should) Replace Unicode `→` arrows with SVG.
9. (Should) Replace `bg-white/95` with theme-aware utility.
10. (Could) Polish: caption equalization · stat count-up · divider standardization · pillars card weight · CTA voice.

---

**Reviewer:** Claude Opus 4.7 (1M context) via `/design-review`
**Capture stack:** chromium 147.0.7727.116 + puppeteer-core 21.x + python3-pil for cropping
