# Design Tokens: patients.excelentmedical.com

**Philosophy:** Editorial-medical (Hims / Ro / Hers — bold display, full-bleed photography) crossed with warm magazine (Headspace / Calm — soft type with personality). Bolder + warmer than the B2B Swiss aesthetic. Brand purple `#89007a` as deliberate accent, never as a wash.

**Architecture.** This doc *extends* the shared base in `:root` and the `[data-theme="patient"]` block already in `src/app/tokens.css`. It does not redefine the base layer (neutral scale, status colors, motion durations, breakpoints, z-index) — those are shared with B2B. It DOES override semantic tokens where the editorial-warm direction diverges from B2B Swiss: typography, surfaces, button system, radii, photography treatments, and editorial utilities.

**Sister artifact:** `.design/b2b-rebuild/DESIGN_TOKENS.md` is the source of truth for the shared base. Read that first; this doc patches it.

---

## 1. What's New (vs the existing patient stub)

The existing `[data-theme="patient"]` block in `tokens.css` defines the basics — palette, `--radius-button: full` for pill buttons, narrower section padding. This pass adds:

| Category | Addition | Why |
|---|---|---|
| Typography | Override display + body families to **Fraunces + Inter**. | The B2B pairing (Cabin/Montserrat) is functional but neutral. Patient site needs personality and editorial warmth. |
| Surfaces | Warm-tinted `--color-bg-secondary` and `--color-bg-tertiary`. | Cool zinc off-whites read clinical-detached on a magazine layout. Warm tints earn the "warm magazine" register. |
| Button system | Size scale (xs/sm/md/lg/xl), secondary ghost variant, tertiary text link with arrow. | One unmistakable primary CTA across multiple contexts (header, card, hero, inline breakout). |
| Radii | `--radius-modal`, `--radius-image`, `--radius-image-hero`, `--radius-card-editorial`. | Editorial layouts use distinct radii for photo masks and modal containers vs. cards. |
| Photography | `--photo-overlay-*`, `--photo-aspect-*`. | Full-bleed photo + text-overlay needs token-controlled overlay opacity for legibility across photo brightness. |
| Editorial typography | `.pull-quote`, `.byline`, `.drop-cap`, `.figure-caption`, `.lead-paragraph`. | Magazine-grade reading layouts. |
| Schedule CTA scale | Five-step CTA size system. | The universal CTA appears at five visual weights — header pill, hero button, inline breakout, card button, footer link. |

---

## 2. Typography

### Fonts

**Display: Fraunces.** Variable serif, optical size axis, weight axis, SOFT axis (0–100), WONK axis (0–1). Loaded via `next/font/google`. Used by Wellbel, Apothékary, and a wide swath of DTC editorial-health brands. The SOFT axis dials in warmth without picking a different family. We use roughly SOFT≈50 for headlines (warm but composed), SOFT≈80 for editorial pull quotes (more expressive).

**Body: Inter.** Workhorse neutral sans. Loaded via `next/font/google`. Pairs well with Fraunces (Hims uses a similar pattern with Söhne, which Inter approximates). Excellent x-height for reading at small sizes, well-supported diacritics for Spanish, broad weight range.

**Why this pair (and not the alternates).**
- *Fraunces over DM Serif Display:* DM Serif is too rigid; Fraunces's SOFT axis carries the warm magazine register without slipping into wellness-cute.
- *Fraunces over Playfair:* Playfair reads "legacy publication." We want *current* editorial, not 1880s.
- *Inter over DM Sans / Manrope:* Inter has the broadest weight range and best Spanish/accented support. Manrope is friendlier but loses authority.
- *Söhne / GT Walsheim / Tiempos:* Not on Google Fonts; commercial licenses we don't have. Defer to phase 2 if licensing changes.

### Font CSS variables (set in patient layout)

These are exposed by `next/font/google` declarations in the patient `layout.tsx`:

```tsx
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
```

The patient theme then references these vars in tokens.css.

### Type ramp

Same scale as B2B at the high end (the display sizes work for both Swiss and editorial). The differences for patient:
- **Body bumps to 18px on desktop** — magazine-grade reading via clamp() in body utility.
- **Loose line-height for long-form** — `--line-height-loose` (1.8) for sinusitis education, articles, condition pages.
- **Letter-spacing for display** — slightly looser (-0.015em vs -0.02em) to let Fraunces breathe.

| Token | Patient value | Notes |
|---|---|---|
| `--font-size-xs` | inherited (12px) | Captions, byline meta |
| `--font-size-sm` | inherited (14px) | Caption body, secondary nav |
| `--font-size-base` | inherited (16px) | Body baseline (mobile) |
| `--font-size-md` | inherited (18px) | Body (desktop), lead paragraphs |
| `--font-size-lg` | inherited (20px) | Sub-lead, inline pull quote |
| `--font-size-xl` | inherited (24px) | h4 |
| `--font-size-2xl` | inherited (32px) | h3 |
| `--font-size-3xl` | inherited (40px) | h2 |
| `--font-size-4xl` | inherited (56px) | h1 |
| `--font-size-5xl` | inherited (72px) | Display / hero |
| `--font-size-6xl` | inherited (96px) | Editorial display (hero only) |
| `--font-size-7xl` | **new — 120px** | Reserved for paid landing page hero on lg+ screens |

`--font-size-7xl: 7.5rem` is the only new size token.

### Patient line-height defaults

Same scale as B2B but with different defaults applied per element/utility:
- Display headings → `--line-height-tight` (1.1)
- h1–h2 → `--line-height-snug` (1.25)
- h3–h4 → `--line-height-normal` (1.4)
- Body marketing copy → `--line-height-relaxed` (1.6)
- **Long-form body (articles, education) → `--line-height-loose` (1.8)** — meaningful default for reading-heavy patient site.

### Letter-spacing

| Token | Patient value | Notes |
|---|---|---|
| `--letter-spacing-tight` | `-0.015em` (override) | Display in Fraunces — slightly looser than B2B's -0.02em |
| `--letter-spacing-snug` | `-0.005em` (override) | h1–h2 in Fraunces |
| `--letter-spacing-normal` | inherited (0) | Body |
| `--letter-spacing-wide` | inherited (0.05em) | Eyebrows |
| `--letter-spacing-widest` | inherited (0.1em) | All-caps labels |

These overrides go into the `[data-theme="patient"]` block.

### Composed editorial typography utilities

These ship as utility classes in `globals.css`. They are **patient-only** — they reference `var(--font-fraunces)` directly, so they only render correctly where the patient layout has loaded the font.

```css
.heading-display-patient {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 0;
  font-size: clamp(var(--font-size-4xl), 8vw, var(--font-size-7xl));
  font-weight: 700;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.heading-1-patient {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 96, 'SOFT' 50, 'WONK' 0;
  font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
  font-weight: 700;
  line-height: var(--line-height-snug);
  letter-spacing: var(--letter-spacing-snug);
}

.heading-2-patient {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 64, 'SOFT' 50, 'WONK' 0;
  font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
  font-weight: 700;
  line-height: var(--line-height-snug);
}

.heading-3-patient {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 48, 'SOFT' 50, 'WONK' 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: var(--line-height-normal);
}

.eyebrow-patient {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1;
  letter-spacing: var(--letter-spacing-widest);
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.body-lead-patient {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: clamp(var(--font-size-md), 2vw, var(--font-size-lg));
  font-weight: 400;
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.body-patient {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: clamp(var(--font-size-base), 1.5vw, var(--font-size-md));
  font-weight: 400;
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.body-longform-patient {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-md);
  font-weight: 400;
  line-height: var(--line-height-loose);
  color: var(--color-text-primary);
  max-width: var(--max-width-prose);
}

/* Editorial-only utilities */

.pull-quote {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 96, 'SOFT' 80, 'WONK' 1;
  font-style: italic;
  font-size: clamp(var(--font-size-2xl), 3.5vw, var(--font-size-4xl));
  font-weight: 500;
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  border-left: 3px solid var(--color-accent-primary);
  padding-left: var(--space-6);
  max-width: 28ch;
}

.byline {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-sm);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-secondary);
  text-transform: none;
}

.byline-meta {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-xs);
  font-weight: 400;
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.figure-caption {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-sm);
  font-style: italic;
  line-height: var(--line-height-normal);
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
}

.drop-cap::first-letter {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 144, 'SOFT' 80, 'WONK' 1;
  font-weight: 700;
  font-size: 4.5em;
  line-height: 0.85;
  float: left;
  margin: 0.05em 0.08em 0 0;
  color: var(--color-accent-primary);
}

.lead-paragraph {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--font-size-lg);
  font-weight: 400;
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  max-width: var(--max-width-prose);
}

.stat-display-patient {
  font-family: var(--font-fraunces), Georgia, serif;
  font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
  font-size: clamp(var(--font-size-4xl), 6vw, var(--font-size-6xl));
  font-weight: 700;
  line-height: 1;
  letter-spacing: var(--letter-spacing-tight);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent-primary);
}
```

The `-patient` suffix is intentional — these utilities co-exist with B2B's `.heading-1`, `.eyebrow`, `.body-lead` etc. without collision. The patient `<body>` defaults to `var(--font-inter)`; B2B `<body>` defaults to `var(--font-cabin)`. No theme-attribute hack required.

---

## 3. Color

### Surfaces — warm tints (overrides)

The B2B patient stub uses cool zinc off-whites (`#fafafa`, `#f4f4f5`). For editorial warmth, shift secondary and tertiary surfaces to slightly warmer values. Primary stays pure white (anchor for full-bleed photography).

| Token | Existing stub | New patient value | Why |
|---|---|---|---|
| `--color-bg-primary` | `#ffffff` | `#ffffff` (unchanged) | Anchor — pure white photo backgrounds, hero |
| `--color-bg-secondary` | `#fafafa` | `#faf8f3` | Warm off-white — alt sections, cards on white |
| `--color-bg-tertiary` | `#f4f4f5` | `#f5f1e8` | Warm subtle — input wells, FAQ section bg, editorial accent panels |
| `--color-bg-inverse` | `#c8dfff` | `#c8dfff` (unchanged) | Pale brand blue — preserved for footer |
| `--color-bg-elevated` | `#ffffff` | `#ffffff` (unchanged) | Cards, dropdowns |
| `--color-bg-overlay` | `rgba(24,24,27,0.5)` | `rgba(24,24,27,0.55)` | Slight bump for contrast over editorial photos |

The warm hex values approximate "ivory" / "paper" tones common in editorial layouts. They contrast subtly enough with `#ffffff` to read as a deliberate warm tint, not a tinted-screen mistake.

### Text — same as stub (already AA-correct)

Existing patient stub already uses `--neutral-500` for tertiary text (4.6:1 on white, passes AA). Keep as-is.

### Accent — same as stub

Existing stub already locks brand purple `#89007a` as primary, brand blue `#459fdc` as secondary, pink-purple `#C25BAB` as tertiary. Keep.

### Photography overlay tokens — new

For full-bleed photo + text-overlay sections, two overlay strengths (light and dark photos):

```css
[data-theme="patient"] {
  --photo-overlay-dark:    linear-gradient(to bottom, rgba(24,24,27,0.0) 0%, rgba(24,24,27,0.55) 100%);
  --photo-overlay-light:   linear-gradient(to bottom, rgba(24,24,27,0.0) 0%, rgba(24,24,27,0.35) 100%);
  --photo-overlay-purple:  linear-gradient(135deg, rgba(137,0,122,0.4) 0%, rgba(24,24,27,0.55) 100%);
}
```

`-dark` for everyday hero overlay. `-light` when photo is already moody / dark and needs minimal overlay. `-purple` reserved for one-of moments (e.g. paid landing hero CTA section).

---

## 4. Layout

### Border radius — patient-specific

The `--radius-button: var(--radius-full)` is already in the stub. Adding component-level radii:

```css
[data-theme="patient"] {
  --radius-button:           var(--radius-full);    /* pill — already in stub */
  --radius-input:            var(--radius-md);      /* 8px — same as B2B for input fields */
  --radius-card:             var(--radius-lg);      /* 12px — softer than B2B */
  --radius-card-editorial:   var(--radius-xl);      /* 16px — featured article cards */
  --radius-modal:            var(--radius-xl);      /* 16px — booking widget modal container */
  --radius-image:            var(--radius-md);      /* 8px — default image mask, article thumbnails */
  --radius-image-hero:       var(--radius-2xl);     /* 24px — hero photos with rounded corners */
  --radius-pill-tag:         var(--radius-full);    /* pill — category filters, specialty chips */
}
```

### Photography aspect ratios — patient-specific

```css
[data-theme="patient"] {
  --photo-aspect-portrait:   4 / 5;       /* specialist headshots, single-person shots */
  --photo-aspect-square:     1 / 1;       /* card thumbnails */
  --photo-aspect-landscape:  3 / 2;       /* article hero, product photos */
  --photo-aspect-wide:       16 / 9;      /* feature card, video thumbnails */
  --photo-aspect-cinema:     21 / 9;      /* paid landing hero, full-bleed editorial */
}
```

These can be applied as Tailwind `aspect-[var(--photo-aspect-portrait)]` or via composed utilities.

### Section padding — overridden in stub

Already in stub at `--section-padding-y-{mobile,tablet,desktop}: 48/64/80`. Keep — patient is denser than B2B Swiss.

### Container widths — same as base

Inherit from `:root`. `--max-width-prose: 65ch` is the reading-column lock for long-form education / articles.

---

## 5. Buttons & CTAs

### Sizes (new — token-scaled)

```css
[data-theme="patient"] {
  /* CTA button sizes — applies to "Schedule an appointment" universal CTA */
  --cta-padding-xs:  0.5rem 1rem;        /*  8px / 16px — used inside small cards */
  --cta-padding-sm:  0.625rem 1.25rem;   /* 10px / 20px — header pill */
  --cta-padding-md:  0.875rem 1.75rem;   /* 14px / 28px — default inline */
  --cta-padding-lg:  1.125rem 2.25rem;   /* 18px / 36px — hero, primary page CTAs */
  --cta-padding-xl:  1.5rem 3rem;        /* 24px / 48px — breakout sections */

  --cta-font-xs:  var(--font-size-sm);   /* 14px */
  --cta-font-sm:  var(--font-size-sm);   /* 14px */
  --cta-font-md:  var(--font-size-base); /* 16px */
  --cta-font-lg:  var(--font-size-md);   /* 18px */
  --cta-font-xl:  var(--font-size-lg);   /* 20px */
}
```

### Variants (new utilities)

Three variants, parallel to B2B but pill-shaped and with editorial weight:

```css
.btn-patient-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--cta-padding-md);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--cta-font-md);
  font-weight: 600;
  background: var(--color-accent-primary);
  color: var(--color-accent-primary-fg);
  border-radius: var(--radius-button);
  border: 0;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-default),
              transform var(--duration-fast) var(--easing-default);
}
.btn-patient-primary:hover {
  background: var(--color-accent-primary-hover);
}
.btn-patient-primary:active {
  background: var(--color-accent-primary-active);
  transform: translateY(1px);
}
.btn-patient-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn-patient-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--cta-padding-md);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--cta-font-md);
  font-weight: 600;
  background: transparent;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-default),
              border-color var(--duration-fast) var(--easing-default);
}
.btn-patient-secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-text-primary);
}
.btn-patient-secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn-patient-text {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: var(--cta-font-md);
  font-weight: 600;
  color: var(--color-accent-primary);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: gap var(--duration-fast) var(--easing-default);
}
.btn-patient-text:hover {
  gap: var(--space-3); /* arrow shifts right */
  color: var(--color-accent-primary-hover);
}
.btn-patient-text:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: var(--radius-sm);
}
```

### Size modifiers (compose with variants)

```css
.btn-patient-xs { padding: var(--cta-padding-xs); font-size: var(--cta-font-xs); }
.btn-patient-sm { padding: var(--cta-padding-sm); font-size: var(--cta-font-sm); }
.btn-patient-lg { padding: var(--cta-padding-lg); font-size: var(--cta-font-lg); }
.btn-patient-xl { padding: var(--cta-padding-xl); font-size: var(--cta-font-xl); font-weight: 700; }
```

### Usage map

| Where | Variant | Size | Notes |
|---|---|---|---|
| Header sticky CTA | primary | sm | Always visible on mobile |
| Hero primary CTA | primary | lg | Below headline + lead paragraph |
| Hero secondary CTA | secondary | lg | Sits beside primary on tablet+ |
| Breakout schedule section | primary | xl | Full-width banner, often inline mid-page |
| Inline schedule CTA (mid-article) | primary | md | Default inline insertion |
| Specialist card | primary | sm | "Schedule" pill on each card |
| Specialist card | text | md | "View profile" with arrow |
| Resources index card | text | sm | "Read article" link |
| FAQ "still have questions" | secondary | md | Below FAQ accordion |
| Article author bio | primary | sm | "Schedule with Dr. X" |
| Footer | text | sm | Schedule link (not pill — already covered by header) |

---

## 6. Shadows — patient-specific tweak

Same scale as B2B. One addition for editorial cards:

```css
[data-theme="patient"] {
  --shadow-editorial-card: 0 4px 24px -8px rgb(24 24 27 / 0.08), 0 2px 6px -2px rgb(24 24 27 / 0.04);
  --shadow-modal: 0 20px 60px -12px rgb(24 24 27 / 0.25);
}
```

`-editorial-card` for featured article / specialist hero cards. `-modal` for the booking widget modal container (deeper than B2B's modal — feels more "lifted" against the editorial backdrop).

`--shadow-focus` inherits the global `0 0 0 3px rgb(137 0 122 / 0.35)` — already aligned with patient brand purple.

---

## 7. Motion — same base, two additions

Inherit duration + easing tokens from `:root`. Add patient-specific:

```css
[data-theme="patient"] {
  --duration-photo-reveal: 600ms;   /* photo fade-in on scroll */
  --easing-editorial:      cubic-bezier(0.25, 0.46, 0.45, 0.94); /* gentle ease-out */
}
```

Used for hero photo fades and image-card reveals on scroll. Not for button states (those stay on `--duration-fast`).

`prefers-reduced-motion` zeroes these alongside the shared scale.

---

## 8. Component Tokens — Quick Reference

For frontend-design phase, here are the tokens each major patient component will reference:

### `HeroPatient`
```
font-family-display:    var(--font-fraunces)
font-family-body:       var(--font-inter)
heading:                .heading-display-patient
lead:                   .body-lead-patient
photo-aspect:           var(--photo-aspect-cinema) [desktop] / var(--photo-aspect-landscape) [mobile]
photo-radius:           var(--radius-image-hero) [or full-bleed]
overlay:                var(--photo-overlay-dark)
primary-cta:            .btn-patient-primary.btn-patient-lg
secondary-cta:          .btn-patient-secondary.btn-patient-lg
section-padding:        var(--section-padding-y-desktop)
```

### `BookingWidgetModal`
```
backdrop:               var(--color-bg-overlay)
container-bg:           var(--color-bg-elevated)
container-radius:       var(--radius-modal)
container-shadow:       var(--shadow-modal)
container-max-width:    1000px (matches ExcelVoice spec)
container-padding:      var(--space-8) [mobile] / var(--space-10) [tablet+]
close-btn-size:         44px (touch target)
z-index:                var(--z-modal)
backdrop-z:             var(--z-modal-bg)
```

### `SpecialistCard`
```
bg:                     var(--color-bg-primary)
border:                 1px solid var(--color-border-primary)
border-radius:          var(--radius-card)
padding:                var(--space-6)
photo-aspect:           var(--photo-aspect-square) [or portrait at 4/5]
photo-radius:           var(--radius-image)
hover-shadow:           var(--shadow-editorial-card)
title:                  .heading-3-patient
practice-meta:          .body-patient (text-secondary)
specialty-chips:        .eyebrow-patient + bg-tertiary + var(--radius-pill-tag)
schedule-cta:           .btn-patient-primary.btn-patient-sm
view-cta:               .btn-patient-text
```

### `ArticleCard`
```
bg:                     var(--color-bg-primary)
border-radius:          var(--radius-card-editorial)
photo-aspect:           var(--photo-aspect-landscape) [default] / var(--photo-aspect-wide) [featured]
photo-radius:           var(--radius-image)
category-eyebrow:       .eyebrow-patient (text-accent-primary)
title:                  .heading-3-patient
excerpt:                .body-patient (text-secondary)
byline:                 .byline + .byline-meta
hover-shadow:           var(--shadow-editorial-card)
read-cta:               .btn-patient-text.btn-patient-sm
```

### `ConditionContent` (long-form medical body)
```
font-family:            var(--font-inter)
body:                   .body-longform-patient
max-width:              var(--max-width-prose) [65ch]
line-height:            var(--line-height-loose) [1.8]
heading-2:              .heading-2-patient
heading-3:              .heading-3-patient
pull-quote:             .pull-quote
caption:                .figure-caption
inline-link-color:      var(--color-text-link)
```

### `TrustBar` (home + paid landing)
```
bg:                     var(--color-bg-tertiary) [warm subtle]
divider:                1px var(--color-border-secondary)
stat-number:            .stat-display-patient (Fraunces, accent-primary)
stat-label:             .body-patient (text-secondary)
section-padding:        var(--section-padding-y-tablet)
```

### `ZipCodeMatcher` (find-a-specialist input)
```
input-bg:               var(--color-bg-tertiary)
input-border:           1px solid var(--color-border-primary)
input-border-radius:    var(--radius-input)
input-padding:          var(--space-4)
input-font:             var(--font-size-md), Inter
submit-cta:             .btn-patient-primary.btn-patient-md
suggestion-banner:      bg-accent-primary-subtle + .body-patient
```

### `EditorialPullQuote` (article body insertion)
```
class:                  .pull-quote
margin-block:           var(--space-12) [generous breathing room]
border-left:            3px solid var(--color-accent-primary) [intrinsic to .pull-quote]
```

---

## 9. Implementation files

### File 1: `src/app/tokens.css` — extend `[data-theme="patient"]` block

This pass adds the patient-specific overrides on top of the existing stub. **Does not touch `:root` or `[data-theme="b2b"]`.** Diff is appended to the existing patient block.

See `tokens.css` for the actual implementation (also written as part of this skill).

### File 2: `src/app/globals.css` — append patient-only utilities

Patient layer adds `.heading-*-patient`, `.body-*-patient`, `.eyebrow-patient`, `.btn-patient-*`, `.pull-quote`, `.byline*`, `.figure-caption`, `.drop-cap`, `.lead-paragraph`, `.stat-display-patient` from §2 and §5.

Existing B2B utilities (`.btn-b2b-primary`, `.heading-1`, `.body-lead`, etc.) stay untouched.

### File 3: `tailwind.config.js` — small extension

Add patient-specific aspect-ratio aliases:

```js
aspectRatio: {
  'portrait':  '4 / 5',
  'landscape': '3 / 2',
  'wide':      '16 / 9',
  'cinema':    '21 / 9',
},
```

Add Fraunces / Inter to fontFamily extension when patient layout is wired:

```js
fontFamily: {
  fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
  inter:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
  // existing display/sans entries unchanged
},
```

### File 4: patient route layout (frontend-design phase)

The `(patient)/layout.tsx` will:
1. Load Fraunces + Inter via `next/font/google` and expose `--font-fraunces` and `--font-inter` CSS variables.
2. Set `<html data-theme="patient" lang="en">`.
3. Mount the global booking widget modal once (Pattern C from ExcelVoice spec).
4. Render `<HeaderPatient>`, `<main>{children}</main>`, `<FooterPatient>`.

Implementation in `/frontend-design`.

---

## 10. Apply checklist

When applying these tokens during frontend-design:

1. **Update `tokens.css`** — extend `[data-theme="patient"]` block with the new tokens (warm surfaces, button sizes, photography, editorial radii, shadows). Already done as part of this skill.
2. **Append patient utilities to `globals.css`** — `.btn-patient-*`, `.heading-*-patient`, `.body-*-patient`, editorial utilities. Done in `/frontend-design`.
3. **Patch `tailwind.config.js`** — aspect-ratio aliases + Fraunces/Inter family bindings. Done in `/frontend-design`.
4. **Set up `(patient)/layout.tsx`** — `next/font/google` for Fraunces + Inter, `data-theme="patient"`, body font-family default `var(--font-inter)`. Done in `/frontend-design`.
5. **Mount `BookingWidgetModal` globally** in patient layout — script-loaded ExcelVoice widget per integration spec.
6. **Verify contrast** — re-confirm all text-on-warm-tint combinations hit AA. The warm `#faf8f3` and `#f5f1e8` surfaces should still pass with `--color-text-primary` (`#18181b`) and `--color-text-secondary` (`#52525b`).

---

## 11. Open token decisions (recommend confirm)

Calls made; flagging for explicit override.

**A. Fraunces over commercial alternatives.** Söhne, GT Walsheim, Tiempos Headline are not on Google Fonts; Fraunces is the closest open-source-licensed alternative with the right warm-editorial register. *Override:* if you have commercial licenses for any of those families, swap in the patient layout's `next/font` declaration — token references would update from `var(--font-fraunces)` to e.g. `var(--font-tiempos)`.

**B. Inter over IBM Plex Sans / DM Sans / Manrope.** Inter has the broadest weight range and best diacritical support for Spanish. *Override:* if a brand licensing decision favors a different sans (e.g. Söhne for parity with Hims), the patient layout swaps via `next/font` declaration.

**C. Warm tint for `--color-bg-secondary`.** `#faf8f3` (warm ivory) versus B2B's cool zinc `#fafafa`. The warmth is subtle but felt. *Override:* if patient warmth feels too "wellness," fall back to the cool zinc by removing the patient override on these two surface tokens (let them inherit from B2B base).

**D. Hero ceiling at 7xl (120px).** New token — only used on paid landing page hero on lg+ screens. *Override:* drop to 6xl (96px) ceiling if 120px feels gratuitous.

**E. Pull-quote uses Fraunces italic with WONK=1.** This is the most expressive editorial moment on the site — the "wonk" axis activates Fraunces's swashy italic glyphs. *Override:* dial WONK to 0 for a more composed register; lose the editorial flair.

**F. Drop cap appears in articles only — defaults to off.** Editorial flourish; opt-in via class on individual articles. *Override:* enable globally on long-form articles via the `ConditionContent` template.

**G. CTA size lg uses 18px font (vs B2B's 16px).** Patient site is reading-heavy and the universal CTA earns more visual weight. *Override:* drop to 16px to align with B2B if the size scale feels too aggressive.

**H. Patient dark mode — explicitly out of scope.** Healthcare patient sites operate in light mode by user expectation; medical credibility is reinforced by light surfaces. *Override:* add a `[data-theme="patient"][data-mode="dark"]` block following the B2B pattern if dark mode becomes a phase 2 goal.

---

**Tokens written:** 2026-04-30
**Author:** Claude Opus 4.7 (1M context) via `/design-tokens`
**Source artifacts:** `.design/patient-rebuild/DESIGN_BRIEF.md` · `.design/patient-rebuild/INFORMATION_ARCHITECTURE.md` · `.design/b2b-rebuild/DESIGN_TOKENS.md` (sister) · `src/app/tokens.css` (live)
