# Design Tokens: excelENT B2B Rebuild

**Philosophy:** Swiss / International Typographic with restrained purple accent.

**Architecture:** Two themes on one Next.js app, switched by hostname middleware:
- `[data-theme="b2b"]` — Swiss-restrained, cool neutrals, charcoal surfaces, 8px radii
- `[data-theme="patient"]` — warmer, current palette preserved, pill buttons, light-blue footer

Both themes share a single base layer (typography ramp, spacing scale, motion, breakpoints, status colors). Dark mode generated for B2B; patient dark deferred (medical patient sites stay light by user expectation).

**Implementation status:** Tokens written here as design artifacts. Will be applied to `src/app/globals.css` and `tailwind.config.js` on the `b2b-rebuild` branch; live `main` (54.224.169.112:3000) is unchanged.

---

## 1. Color

### Base neutral scale (shared)

Tailwind's `zinc` palette as the spine — cool-leaning neutral, slightly warmer than `slate`, more achromatic than `gray`. Reads as authoritative-medical without sliding into corporate-tech blue.

| Token | Hex | Usage |
|---|---|---|
| `--neutral-50` | `#fafafa` | Lightest off-white surface |
| `--neutral-100` | `#f4f4f5` | Section bg, card surface |
| `--neutral-200` | `#e4e4e7` | Default borders |
| `--neutral-300` | `#d4d4d8` | Strong borders, dividers |
| `--neutral-400` | `#a1a1aa` | Tertiary text, placeholders |
| `--neutral-500` | `#71717a` | Body subdued |
| `--neutral-600` | `#52525b` | Body strong |
| `--neutral-700` | `#3f3f46` | Heading on light, body inverse |
| `--neutral-800` | `#27272a` | Footer alt |
| `--neutral-900` | `#18181b` | Charcoal footer, dark sections |
| `--neutral-950` | `#09090b` | True dark mode bg |

### Brand colors (kept from existing Tailwind config)

| Scale | 700 / Brand | Notes |
|---|---|---|
| `primary` (purple) | `#89007a` | Single B2B accent (links, key CTAs, eyebrow tags); dominant on patient subdomain |
| `secondary` (blue) | `#2a6ba8` (700) / `#459fdc` (500) | Patient secondary; used sparingly on B2B for non-purple accents (e.g. info callouts) |
| `accent` (pink-purple) | `#C25BAB` (500) | **Patient subdomain only.** Removed from B2B palette. |
| `navy` | `#061b42` | Body text on light surfaces (alt to neutral-900 where warmth wanted) |

### Status colors (shared)

| Token | Hex | Usage |
|---|---|---|
| `--status-success` | `#16a34a` | Form submission success |
| `--status-warning` | `#d97706` | Pending states, soft warnings |
| `--status-error` | `#dc2626` | Form errors, destructive |
| `--status-info` | `#0284c7` | Informational callouts, "Coming Q2" badges |

### Semantic tokens — B2B theme (light)

```css
[data-theme="b2b"] {
  /* Backgrounds */
  --color-bg-primary:        #ffffff;            /* page bg */
  --color-bg-secondary:      var(--neutral-50);  /* alt section bg */
  --color-bg-tertiary:       var(--neutral-100); /* input wells, subtle bands */
  --color-bg-inverse:        var(--neutral-900); /* charcoal footer, dark sections */
  --color-bg-elevated:       #ffffff;            /* cards, dropdowns */
  --color-bg-overlay:        rgba(24,24,27,0.6); /* modal backdrop */

  /* Text */
  --color-text-primary:      var(--neutral-900);
  --color-text-secondary:    var(--neutral-600);
  --color-text-tertiary:     var(--neutral-400);
  --color-text-inverse:      var(--neutral-50);
  --color-text-link:         #89007a;            /* primary-700 */
  --color-text-link-hover:   #6d0062;            /* primary-800 */

  /* Borders */
  --color-border-primary:    var(--neutral-200);
  --color-border-secondary:  var(--neutral-100);
  --color-border-strong:     var(--neutral-300);
  --color-border-focus:      #89007a;

  /* Accent (single accent — purple 700) */
  --color-accent-primary:           #89007a;
  --color-accent-primary-hover:     #6d0062;
  --color-accent-primary-active:    #5a0051;
  --color-accent-primary-fg:        #ffffff;     /* foreground on accent bg */
  --color-accent-primary-subtle:    #fdf2fc;     /* primary-50, for tints */

  /* Secondary accent (blue, used very sparingly) */
  --color-accent-secondary:         #2a6ba8;     /* secondary-700 */
  --color-accent-secondary-fg:      #ffffff;

  /* Status */
  --color-status-success:  var(--status-success);
  --color-status-warning:  var(--status-warning);
  --color-status-error:    var(--status-error);
  --color-status-info:     var(--status-info);
}
```

### Semantic tokens — B2B theme (dark)

Generated for completeness; B2B dark mode is NOT shipping in Phase 1 but the tokens are ready when needed (e.g. an in-page dark testimonial section, or future product preference toggle).

```css
[data-theme="b2b"][data-mode="dark"],
@media (prefers-color-scheme: dark) {
  [data-theme="b2b"]:not([data-mode="light"]) {
    --color-bg-primary:        var(--neutral-950);
    --color-bg-secondary:      var(--neutral-900);
    --color-bg-tertiary:       var(--neutral-800);
    --color-bg-inverse:        var(--neutral-50);
    --color-bg-elevated:       var(--neutral-900);
    --color-bg-overlay:        rgba(0,0,0,0.75);

    --color-text-primary:      var(--neutral-50);
    --color-text-secondary:    var(--neutral-400);
    --color-text-tertiary:     var(--neutral-500);
    --color-text-inverse:      var(--neutral-900);
    --color-text-link:         #e06dd4;          /* primary-400, lighter for dark mode contrast */
    --color-text-link-hover:   #eda3e6;          /* primary-300 */

    --color-border-primary:    var(--neutral-800);
    --color-border-secondary:  var(--neutral-900);
    --color-border-strong:     var(--neutral-700);
    --color-border-focus:      #e06dd4;

    --color-accent-primary:           #c946b8;   /* primary-500 — slightly lighter for dark */
    --color-accent-primary-hover:     #e06dd4;   /* primary-400 */
    --color-accent-primary-active:    #eda3e6;   /* primary-300 */
    --color-accent-primary-fg:        var(--neutral-950);
    --color-accent-primary-subtle:    #3a0034;   /* primary-950 */
  }
}
```

### Semantic tokens — Patient theme (light)

Preserves the current warm aesthetic. Existing `globals.css` button utilities continue to work on this theme.

```css
[data-theme="patient"] {
  --color-bg-primary:        #ffffff;
  --color-bg-secondary:      #fafafa;
  --color-bg-tertiary:       #f4f4f5;
  --color-bg-inverse:        #c8dfff;            /* the existing footer color */
  --color-bg-elevated:       #ffffff;
  --color-bg-overlay:        rgba(24,24,27,0.5);

  --color-text-primary:      var(--neutral-900);
  --color-text-secondary:    var(--neutral-600);
  --color-text-tertiary:     var(--neutral-400);
  --color-text-inverse:      var(--neutral-900);  /* footer text is dark on light-blue */
  --color-text-link:         #89007a;
  --color-text-link-hover:   #6d0062;

  --color-border-primary:    var(--neutral-200);
  --color-border-secondary:  var(--neutral-100);
  --color-border-strong:     var(--neutral-300);
  --color-border-focus:      #89007a;

  --color-accent-primary:           #89007a;
  --color-accent-primary-hover:     #6d0062;
  --color-accent-primary-active:    #5a0051;
  --color-accent-primary-fg:        #ffffff;
  --color-accent-primary-subtle:    #fdf2fc;

  --color-accent-secondary:         #459fdc;      /* secondary-500 */
  --color-accent-secondary-fg:      #ffffff;

  --color-accent-tertiary:          #C25BAB;      /* accent-500, retained on patient only */
  --color-accent-tertiary-fg:       #ffffff;

  --color-status-success:  var(--status-success);
  --color-status-warning:  var(--status-warning);
  --color-status-error:    var(--status-error);
  --color-status-info:     var(--status-info);
}
```

### Patient dark mode — deferred

Patient sites in healthcare operate in light mode by user expectation. Generating dark tokens for the patient theme is explicitly out of scope; if added later, follow the B2B dark-mode pattern.

---

## 2. Typography

### Fonts (kept from existing config)

```css
:root {
  --font-family-display:  var(--font-montserrat), system-ui, sans-serif;
  --font-family-body:     var(--font-cabin), system-ui, sans-serif;
  --font-family-mono:     ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
```

`Cabin` and `Montserrat` already loaded via `next/font/google` in `(frontend)/[locale]/layout.tsx`. Will be replicated in the new `(b2b)/layout.tsx` with the same CSS variables.

### Type scale (Swiss-tuned)

Stronger contrast between display and body. Modular scale roughly Perfect Fourth (1.333) at the high end, Major Third (1.250) at the body end.

| Token | Size | Px | Usage |
|---|---|---|---|
| `--font-size-xs` | 0.75rem | 12 | Eyebrow caps, captions, fine print |
| `--font-size-sm` | 0.875rem | 14 | Small UI text, secondary nav |
| `--font-size-base` | 1rem | 16 | Body baseline (mobile) |
| `--font-size-md` | 1.125rem | 18 | Body desktop / lead paragraphs |
| `--font-size-lg` | 1.25rem | 20 | Sub-heading body, sub-lead |
| `--font-size-xl` | 1.5rem | 24 | h4 |
| `--font-size-2xl` | 2rem | 32 | h3 |
| `--font-size-3xl` | 2.5rem | 40 | h2 |
| `--font-size-4xl` | 3.5rem | 56 | h1 |
| `--font-size-5xl` | 4.5rem | 72 | Display / hero |
| `--font-size-6xl` | 6rem | 96 | Editorial display (rare; hero only) |

### Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Emphasized body, button labels |
| `--font-weight-semibold` | 600 | h3/h4, eyebrows |
| `--font-weight-bold` | 700 | Display headings (h1/h2 in B2B) |

Cabin only ships up to 700 in our Google Fonts subset; that's our hard ceiling. Don't reach for 800 or 900.

### Line heights

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | 1.1 | Display/hero (5xl–6xl) |
| `--line-height-snug` | 1.25 | h1–h2 |
| `--line-height-normal` | 1.4 | h3–h4 |
| `--line-height-relaxed` | 1.6 | Body |
| `--line-height-loose` | 1.8 | Long-form body (article/education) |

### Letter spacing

| Token | Value | Usage |
|---|---|---|
| `--letter-spacing-tight` | -0.02em | Display/hero (tightens visually) |
| `--letter-spacing-snug` | -0.01em | h1–h2 |
| `--letter-spacing-normal` | 0 | Body |
| `--letter-spacing-wide` | 0.05em | Eyebrows (small caps) |
| `--letter-spacing-widest` | 0.1em | All-caps labels |

### Composed typography styles

These are the ready-to-apply typographic combinations referenced by `EyebrowTag`, `Stat`, headline utilities. Defined as utility classes in `globals.css`.

```css
.heading-display {
  font-family: var(--font-family-display);
  font-size: clamp(var(--font-size-4xl), 6vw, var(--font-size-6xl));
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.heading-1 {
  font-family: var(--font-family-display);
  font-size: clamp(var(--font-size-3xl), 4vw, var(--font-size-4xl));
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-snug);
  letter-spacing: var(--letter-spacing-snug);
}

.heading-2 {
  font-family: var(--font-family-display);
  font-size: clamp(var(--font-size-2xl), 3vw, var(--font-size-3xl));
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-snug);
}

.heading-3 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.heading-4 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.eyebrow {
  font-family: var(--font-family-body);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  letter-spacing: var(--letter-spacing-widest);
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.body-lead {
  font-family: var(--font-family-body);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.body-sm {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.caption {
  font-family: var(--font-family-body);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: var(--color-text-tertiary);
}

.stat-display {
  font-family: var(--font-family-display);
  font-size: clamp(var(--font-size-4xl), 5vw, var(--font-size-5xl));
  font-weight: var(--font-weight-bold);
  line-height: 1;
  letter-spacing: var(--letter-spacing-tight);
  font-variant-numeric: tabular-nums;
}
```

---

## 3. Spacing

4px base unit. Tailwind's default scale is also 4px-based — keep it. Add semantic stacking tokens.

### Raw scale (Tailwind-aligned)

| Token | Value | Px |
|---|---|---|
| `--space-0` | 0 | 0 |
| `--space-1` | 0.25rem | 4 |
| `--space-2` | 0.5rem | 8 |
| `--space-3` | 0.75rem | 12 |
| `--space-4` | 1rem | 16 |
| `--space-5` | 1.25rem | 20 |
| `--space-6` | 1.5rem | 24 |
| `--space-8` | 2rem | 32 |
| `--space-10` | 2.5rem | 40 |
| `--space-12` | 3rem | 48 |
| `--space-16` | 4rem | 64 |
| `--space-20` | 5rem | 80 |
| `--space-24` | 6rem | 96 |
| `--space-32` | 8rem | 128 |
| `--space-40` | 10rem | 160 |
| `--space-48` | 12rem | 192 |

### Semantic spacing

```css
:root {
  /* Stack spacing — vertical rhythm between elements */
  --stack-xs:    var(--space-2);   /* 8px  — tight, icon next to text */
  --stack-sm:    var(--space-3);   /* 12px — list items */
  --stack-md:    var(--space-4);   /* 16px — paragraph spacing */
  --stack-lg:    var(--space-6);   /* 24px — between sub-sections */
  --stack-xl:    var(--space-10);  /* 40px — between major content blocks */

  /* Section padding — top/bottom of full-width sections */
  --section-padding-y-mobile:   var(--space-12); /* 48px */
  --section-padding-y-tablet:   var(--space-20); /* 80px */
  --section-padding-y-desktop:  var(--space-32); /* 128px */

  /* Gutter — horizontal page padding */
  --gutter-mobile:   var(--space-4);  /* 16px */
  --gutter-tablet:   var(--space-6);  /* 24px */
  --gutter-desktop:  var(--space-8);  /* 32px */
}
```

Patient theme uses tighter section padding (current site uses `py-12 md:py-16 lg:py-20`):

```css
[data-theme="patient"] {
  --section-padding-y-mobile:   var(--space-12); /* 48px */
  --section-padding-y-tablet:   var(--space-16); /* 64px */
  --section-padding-y-desktop:  var(--space-20); /* 80px */
}
```

B2B uses generous Swiss section padding (above defaults).

---

## 4. Layout

### Container widths

```css
:root {
  --max-width-prose:   65ch;       /* reading width — articles */
  --max-width-content: 1024px;     /* default content area */
  --max-width-wide:    1280px;     /* wide marketing sections */
  --max-width-page:    1440px;     /* outer page bound */
}
```

### Border radii

Theme-dependent — this is a load-bearing brand differentiation between B2B and Patient.

```css
:root {
  --radius-sm:   0.25rem;   /* 4px  — tags, small badges */
  --radius-md:   0.5rem;    /* 8px  — B2B buttons, cards */
  --radius-lg:   0.75rem;   /* 12px — large cards */
  --radius-xl:   1rem;      /* 16px — feature cards */
  --radius-2xl:  1.5rem;    /* 24px — hero cards */
  --radius-full: 9999px;    /* circle, pill */

  /* Theme-aware "default" radii */
  --radius-button:  var(--radius-md);   /* 8px — B2B default */
  --radius-input:   var(--radius-md);
  --radius-card:    var(--radius-lg);
}

[data-theme="patient"] {
  --radius-button: var(--radius-full);  /* pill — preserves current patient feel */
  --radius-input:  var(--radius-md);
  --radius-card:   var(--radius-lg);
}
```

### Shadows

Swiss minimal — shadows only where they communicate elevation. Avoid decorative shadows.

```css
:root {
  --shadow-none:  none;
  --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md:    0 4px 6px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);
  --shadow-focus: 0 0 0 3px rgb(137 0 122 / 0.35);  /* purple-700 @ 35% */
}

[data-theme="b2b"][data-mode="dark"],
@media (prefers-color-scheme: dark) {
  [data-theme="b2b"]:not([data-mode="light"]) {
    --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.4);
    --shadow-md:    0 4px 6px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4);
    --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.4);
    --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.7);
    --shadow-focus: 0 0 0 3px rgb(224 109 212 / 0.45);  /* primary-400 @ 45% */
  }
}
```

---

## 5. Motion

Swiss = restrained motion. Short durations, subtle easings. Respect `prefers-reduced-motion` everywhere — see brief Accessibility section.

```css
:root {
  --duration-instant:   0ms;        /* no transition */
  --duration-fast:      120ms;      /* hover state, button press */
  --duration-normal:    200ms;      /* most UI transitions */
  --duration-slow:      320ms;      /* page section reveals */
  --duration-slower:    500ms;      /* hero entrance, large transitions */

  --easing-default:     cubic-bezier(0.4, 0, 0.2, 1);   /* ease-in-out */
  --easing-in:          cubic-bezier(0.4, 0, 1, 1);     /* ease-in */
  --easing-out:         cubic-bezier(0, 0, 0.2, 1);     /* ease-out — most natural for entrances */
  --easing-emphatic:    cubic-bezier(0.2, 0, 0, 1);     /* slow start, quick finish */
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:    0ms;
    --duration-normal:  0ms;
    --duration-slow:    0ms;
    --duration-slower:  0ms;
  }
}
```

No `--easing-bounce`. Bounces don't fit Swiss authority.

---

## 6. Breakpoints

Already defined in `tailwind.config.js`. Re-stated here as CSS variables for non-Tailwind contexts (CSS modules, vanilla queries).

```css
:root {
  --breakpoint-xs:    375px;
  --breakpoint-sm:    640px;
  --breakpoint-md:    768px;
  --breakpoint-lg:    1024px;
  --breakpoint-xl:    1280px;
  --breakpoint-2xl:   1440px;
}
```

Use Tailwind's prefix notation (`sm:`, `md:`, `lg:`) in components. Reference these CSS vars only in raw CSS contexts.

---

## 7. Z-index scale

Document explicitly so we don't end up with `z-index: 9999` in multiple places.

```css
:root {
  --z-base:        0;
  --z-dropdown:    1000;   /* nav dropdown menus */
  --z-sticky:      1020;   /* sticky header */
  --z-fixed:       1030;   /* fixed elements (cookie banner) */
  --z-modal-bg:    1040;   /* modal backdrop */
  --z-modal:       1050;   /* modal content */
  --z-popover:     1060;   /* tooltip, popover */
  --z-toast:       1070;   /* notifications */
}
```

---

## 8. Implementation files

### File 1: `src/app/tokens.css` (new — full content)

This file imports into `globals.css`. Contents = sections 1–7 above as raw CSS, ordered: base scale → semantic theme overrides → dark mode media query.

```css
/* tokens.css — see DESIGN_TOKENS.md for the source of truth */

:root {
  /* Neutral scale */
  --neutral-50:  #fafafa;
  --neutral-100: #f4f4f5;
  --neutral-200: #e4e4e7;
  --neutral-300: #d4d4d8;
  --neutral-400: #a1a1aa;
  --neutral-500: #71717a;
  --neutral-600: #52525b;
  --neutral-700: #3f3f46;
  --neutral-800: #27272a;
  --neutral-900: #18181b;
  --neutral-950: #09090b;

  /* Status */
  --status-success: #16a34a;
  --status-warning: #d97706;
  --status-error:   #dc2626;
  --status-info:    #0284c7;

  /* Type families */
  --font-family-display: var(--font-montserrat), system-ui, sans-serif;
  --font-family-body:    var(--font-cabin), system-ui, sans-serif;
  --font-family-mono:    ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Type sizes */
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-md:   1.125rem;
  --font-size-lg:   1.25rem;
  --font-size-xl:   1.5rem;
  --font-size-2xl:  2rem;
  --font-size-3xl:  2.5rem;
  --font-size-4xl:  3.5rem;
  --font-size-5xl:  4.5rem;
  --font-size-6xl:  6rem;

  /* Weights */
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* Line heights */
  --line-height-tight:    1.1;
  --line-height-snug:     1.25;
  --line-height-normal:   1.4;
  --line-height-relaxed:  1.6;
  --line-height-loose:    1.8;

  /* Letter spacing */
  --letter-spacing-tight:   -0.02em;
  --letter-spacing-snug:    -0.01em;
  --letter-spacing-normal:  0;
  --letter-spacing-wide:    0.05em;
  --letter-spacing-widest:  0.1em;

  /* Spacing scale */
  --space-0:   0;
  --space-1:   0.25rem;
  --space-2:   0.5rem;
  --space-3:   0.75rem;
  --space-4:   1rem;
  --space-5:   1.25rem;
  --space-6:   1.5rem;
  --space-8:   2rem;
  --space-10:  2.5rem;
  --space-12:  3rem;
  --space-16:  4rem;
  --space-20:  5rem;
  --space-24:  6rem;
  --space-32:  8rem;
  --space-40:  10rem;
  --space-48:  12rem;

  /* Stack spacing */
  --stack-xs: var(--space-2);
  --stack-sm: var(--space-3);
  --stack-md: var(--space-4);
  --stack-lg: var(--space-6);
  --stack-xl: var(--space-10);

  /* Section padding (B2B defaults; patient overrides below) */
  --section-padding-y-mobile:  var(--space-12);
  --section-padding-y-tablet:  var(--space-20);
  --section-padding-y-desktop: var(--space-32);

  /* Gutters */
  --gutter-mobile:  var(--space-4);
  --gutter-tablet:  var(--space-6);
  --gutter-desktop: var(--space-8);

  /* Container widths */
  --max-width-prose:   65ch;
  --max-width-content: 1024px;
  --max-width-wide:    1280px;
  --max-width-page:    1440px;

  /* Radii */
  --radius-sm:    0.25rem;
  --radius-md:    0.5rem;
  --radius-lg:    0.75rem;
  --radius-xl:    1rem;
  --radius-2xl:   1.5rem;
  --radius-full:  9999px;

  --radius-button: var(--radius-md);
  --radius-input:  var(--radius-md);
  --radius-card:   var(--radius-lg);

  /* Shadows */
  --shadow-none:  none;
  --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md:    0 4px 6px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);
  --shadow-focus: 0 0 0 3px rgb(137 0 122 / 0.35);

  /* Motion */
  --duration-instant: 0ms;
  --duration-fast:    120ms;
  --duration-normal:  200ms;
  --duration-slow:    320ms;
  --duration-slower:  500ms;

  --easing-default:   cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in:        cubic-bezier(0.4, 0, 1, 1);
  --easing-out:       cubic-bezier(0, 0, 0.2, 1);
  --easing-emphatic:  cubic-bezier(0.2, 0, 0, 1);

  /* Breakpoints (CSS-context only) */
  --breakpoint-xs:  375px;
  --breakpoint-sm:  640px;
  --breakpoint-md:  768px;
  --breakpoint-lg:  1024px;
  --breakpoint-xl:  1280px;
  --breakpoint-2xl: 1440px;

  /* Z-index */
  --z-base:     0;
  --z-dropdown: 1000;
  --z-sticky:   1020;
  --z-fixed:    1030;
  --z-modal-bg: 1040;
  --z-modal:    1050;
  --z-popover:  1060;
  --z-toast:    1070;
}

/* B2B theme — light */
[data-theme="b2b"] {
  --color-bg-primary:        #ffffff;
  --color-bg-secondary:      var(--neutral-50);
  --color-bg-tertiary:       var(--neutral-100);
  --color-bg-inverse:        var(--neutral-900);
  --color-bg-elevated:       #ffffff;
  --color-bg-overlay:        rgba(24,24,27,0.6);

  --color-text-primary:      var(--neutral-900);
  --color-text-secondary:    var(--neutral-600);
  --color-text-tertiary:     var(--neutral-400);
  --color-text-inverse:      var(--neutral-50);
  --color-text-link:         #89007a;
  --color-text-link-hover:   #6d0062;

  --color-border-primary:    var(--neutral-200);
  --color-border-secondary:  var(--neutral-100);
  --color-border-strong:     var(--neutral-300);
  --color-border-focus:      #89007a;

  --color-accent-primary:        #89007a;
  --color-accent-primary-hover:  #6d0062;
  --color-accent-primary-active: #5a0051;
  --color-accent-primary-fg:     #ffffff;
  --color-accent-primary-subtle: #fdf2fc;

  --color-accent-secondary:      #2a6ba8;
  --color-accent-secondary-fg:   #ffffff;

  --color-status-success: var(--status-success);
  --color-status-warning: var(--status-warning);
  --color-status-error:   var(--status-error);
  --color-status-info:    var(--status-info);
}

/* B2B theme — dark (deferred, ready) */
[data-theme="b2b"][data-mode="dark"] {
  --color-bg-primary:        var(--neutral-950);
  --color-bg-secondary:      var(--neutral-900);
  --color-bg-tertiary:       var(--neutral-800);
  --color-bg-inverse:        var(--neutral-50);
  --color-bg-elevated:       var(--neutral-900);
  --color-bg-overlay:        rgba(0,0,0,0.75);

  --color-text-primary:      var(--neutral-50);
  --color-text-secondary:    var(--neutral-400);
  --color-text-tertiary:     var(--neutral-500);
  --color-text-inverse:      var(--neutral-900);
  --color-text-link:         #e06dd4;
  --color-text-link-hover:   #eda3e6;

  --color-border-primary:    var(--neutral-800);
  --color-border-secondary:  var(--neutral-900);
  --color-border-strong:     var(--neutral-700);
  --color-border-focus:      #e06dd4;

  --color-accent-primary:        #c946b8;
  --color-accent-primary-hover:  #e06dd4;
  --color-accent-primary-active: #eda3e6;
  --color-accent-primary-fg:     var(--neutral-950);
  --color-accent-primary-subtle: #3a0034;

  --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.4);
  --shadow-md:    0 4px 6px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.5);
  --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.7);
  --shadow-focus: 0 0 0 3px rgb(224 109 212 / 0.45);
}

/* Patient theme — light (preserves current site feel) */
[data-theme="patient"] {
  --color-bg-primary:        #ffffff;
  --color-bg-secondary:      #fafafa;
  --color-bg-tertiary:       #f4f4f5;
  --color-bg-inverse:        #c8dfff;
  --color-bg-elevated:       #ffffff;
  --color-bg-overlay:        rgba(24,24,27,0.5);

  --color-text-primary:      var(--neutral-900);
  --color-text-secondary:    var(--neutral-600);
  --color-text-tertiary:     var(--neutral-400);
  --color-text-inverse:      var(--neutral-900);
  --color-text-link:         #89007a;
  --color-text-link-hover:   #6d0062;

  --color-border-primary:    var(--neutral-200);
  --color-border-secondary:  var(--neutral-100);
  --color-border-strong:     var(--neutral-300);
  --color-border-focus:      #89007a;

  --color-accent-primary:        #89007a;
  --color-accent-primary-hover:  #6d0062;
  --color-accent-primary-active: #5a0051;
  --color-accent-primary-fg:     #ffffff;
  --color-accent-primary-subtle: #fdf2fc;

  --color-accent-secondary:      #459fdc;
  --color-accent-secondary-fg:   #ffffff;

  --color-accent-tertiary:       #C25BAB;
  --color-accent-tertiary-fg:    #ffffff;

  --radius-button: var(--radius-full);

  --section-padding-y-mobile:  var(--space-12);
  --section-padding-y-tablet:  var(--space-16);
  --section-padding-y-desktop: var(--space-20);

  --color-status-success: var(--status-success);
  --color-status-warning: var(--status-warning);
  --color-status-error:   var(--status-error);
  --color-status-info:    var(--status-info);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:    0ms;
    --duration-normal:  0ms;
    --duration-slow:    0ms;
    --duration-slower:  0ms;
  }
}

/* System dark mode for B2B (disabled by default — opt-in via data-mode) */
@media (prefers-color-scheme: dark) {
  [data-theme="b2b"]:not([data-mode="light"]):not([data-mode="dark"]) {
    /* Inherit B2B-light by default. Phase 1 ships light-only; uncomment when ready: */
    /* (copy block from [data-theme="b2b"][data-mode="dark"]) */
  }
}
```

### File 2: `tailwind.config.js` (extend — diff from current)

Tailwind continues to expose `primary`, `secondary`, `accent`, `navy`, `footer` for backward compat with existing patient-side components. Add a `neutral` scale that maps to the CSS vars, plus token-aware semantic utilities.

```js
// Patch to apply on the b2b-rebuild branch
module.exports = {
  // ...existing config
  theme: {
    extend: {
      colors: {
        // KEEP existing primary/secondary/accent/navy/footer

        // NEW — neutral scale (zinc-aligned)
        neutral: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },

        // Semantic — bridge to CSS vars (use as `bg-surface`, `text-link`, etc.)
        surface: {
          DEFAULT: 'var(--color-bg-primary)',
          alt:     'var(--color-bg-secondary)',
          subtle:  'var(--color-bg-tertiary)',
          inverse: 'var(--color-bg-inverse)',
        },
        ink: {
          DEFAULT:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary:  'var(--color-text-tertiary)',
          inverse:   'var(--color-text-inverse)',
          link:      'var(--color-text-link)',
        },
        edge: {
          DEFAULT: 'var(--color-border-primary)',
          subtle:  'var(--color-border-secondary)',
          strong:  'var(--color-border-strong)',
          focus:   'var(--color-border-focus)',
        },
      },

      fontFamily: {
        // KEEP — sans (cabin), heading (montserrat)
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'], // alias for clarity
      },

      fontSize: {
        // ADD (extends Tailwind defaults; doesn't replace)
        '5xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl': ['6rem',   { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },

      borderRadius: {
        button: 'var(--radius-button)',  // theme-aware: 8px on B2B, full pill on patient
        input:  'var(--radius-input)',
        card:   'var(--radius-card)',
      },

      boxShadow: {
        focus: 'var(--shadow-focus)',
      },

      transitionDuration: {
        fast:    '120ms',
        normal:  '200ms',
        slow:    '320ms',
        slower:  '500ms',
      },

      transitionTimingFunction: {
        'default':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'emphatic':  'cubic-bezier(0.2, 0, 0, 1)',
      },

      maxWidth: {
        prose: '65ch',
        wide:  '1280px',
        page:  '1440px',
      },
    },
  },
}
```

### File 3: `src/app/globals.css` (extend — patch)

Add token import + Swiss heading utilities + theme-aware button utilities. Existing `.btn-primary/.btn-secondary/.btn-accent` continue to work for patient theme.

```css
/* AT TOP — import the tokens layer */
@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply antialiased;
    font-family: var(--font-family-body);
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
  }
  /* Swiss heading utilities — see DESIGN_TOKENS.md §2 */
  h1,h2,h3,h4 { font-family: var(--font-family-display); }
  ::selection { background: var(--color-accent-primary); color: var(--color-accent-primary-fg); }
}

@layer components {
  /* B2B-flavored buttons (8px radius, Swiss restraint) */
  .btn-b2b-primary {
    @apply inline-flex items-center justify-center px-6 py-3 text-base font-semibold transition-colors;
    background: var(--color-accent-primary);
    color: var(--color-accent-primary-fg);
    border-radius: var(--radius-button);
  }
  .btn-b2b-primary:hover { background: var(--color-accent-primary-hover); }
  .btn-b2b-primary:active { background: var(--color-accent-primary-active); }
  .btn-b2b-primary:focus-visible { box-shadow: var(--shadow-focus); outline: none; }

  .btn-b2b-secondary {
    @apply inline-flex items-center justify-center px-6 py-3 text-base font-semibold transition-colors;
    background: transparent;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-button);
  }
  .btn-b2b-secondary:hover { background: var(--color-bg-tertiary); }
  .btn-b2b-secondary:focus-visible { box-shadow: var(--shadow-focus); outline: none; }

  /* Existing .btn-primary/.btn-secondary/.btn-accent (patient pill buttons) — KEEP unchanged */

  .container-custom { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
  .section-padding {
    padding-top: var(--section-padding-y-mobile);
    padding-bottom: var(--section-padding-y-mobile);
  }
  @media (min-width: 768px) {
    .section-padding {
      padding-top: var(--section-padding-y-tablet);
      padding-bottom: var(--section-padding-y-tablet);
    }
  }
  @media (min-width: 1024px) {
    .section-padding {
      padding-top: var(--section-padding-y-desktop);
      padding-bottom: var(--section-padding-y-desktop);
    }
  }

  /* Composed type utilities (see §2 for definitions) */
  .heading-display { /* …per §2… */ }
  .heading-1 { /* … */ }
  .heading-2 { /* … */ }
  .heading-3 { /* … */ }
  .heading-4 { /* … */ }
  .eyebrow { /* … */ }
  .body-lead { /* … */ }
  .stat-display { /* … */ }
}
```

### File 4: hostname-aware theme attribute (`src/app/layout.tsx` or middleware)

The token system relies on `[data-theme="b2b"]` or `[data-theme="patient"]` being set on `<html>`. Set it in the appropriate route group's layout, derived from request hostname.

```tsx
// pseudocode for src/app/(b2b)/layout.tsx
export default function B2BLayout({ children }) {
  return (
    <html data-theme="b2b">
      <body>{children}</body>
    </html>
  );
}

// src/app/(patients)/layout.tsx
export default function PatientLayout({ children }) {
  return (
    <html data-theme="patient">
      <body>{children}</body>
    </html>
  );
}
```

(Actual implementation handled by `/frontend-design` skill in the next step.)

---

## 9. Apply checklist (when implementation starts)

When the `b2b-rebuild` branch is cut and we move into building, apply in this order to keep the existing patient site working:

1. **Add `tokens.css`** alongside `globals.css` and import it at the top of `globals.css`.
2. **Apply Tailwind config patch** — extends, doesn't replace, so existing utilities keep working.
3. **Set `data-theme` on the existing `(frontend)` layout to `"patient"`** — this makes the existing patient theme explicit and allows token-aware utilities to apply cleanly. Existing `.btn-primary/.btn-secondary/.btn-accent` utilities continue to work because they target the patient theme.
4. **Build new `(b2b)` route group** with `data-theme="b2b"` set on its `<html>`. Use new `.btn-b2b-*` utilities or token-aware Tailwind classes.
5. **Optional later:** migrate patient buttons from raw colors to token-aware utilities for consistency. Not Phase 1.

This sequence preserves the live patient site at `54.224.169.112:3000` and the WP-match design from commit `995b7ef` until cutover.

---

## 10. Open token decisions (recommend confirm)

These are calls I made; flagging for explicit override.

**A. Neutral scale = Tailwind `zinc`.** Cool-leaning, slightly cool of `gray`, slightly less warm than `stone`. Defensive choice for medical authority. *Override:* swap to `slate` if you want it more cool-blue, or `stone` if you want it warmer/more publishing-feel.

**B. Hero display ceiling at 96px (`--font-size-6xl`).** That's large for desktop. Some Swiss medtech sites go to 72px max. *Override:* if 96px feels too editorial, drop the 6xl and cap at 72px (5xl).

**C. Patient theme keeps the existing pink-purple `accent` color (#C25BAB).** Per brief, that token is dropped from B2B but retained on patient. *Override:* drop globally if you want the patient theme to also adopt the more restrained palette.

**D. Status info color (#0284c7) is the Tailwind `sky-600` blue, not your existing `secondary-500/600`.** Picked sky for higher contrast on light surfaces. *Override:* swap to `--secondary-700` (#2a6ba8) if you want it brand-consistent.

**E. B2B dark mode shipped in tokens but NOT activated.** No `prefers-color-scheme` auto-toggle in Phase 1. *Override:* activate by uncommenting the block at the bottom of `tokens.css` if you want system-dark support out of the gate.

**F. Reduced-motion zeroes out `--duration-*`** rather than scaling to a small non-zero. Either pattern is acceptable; the zero approach is more conservative.

---

**Tokens written:** 2026-04-28
**Author:** Claude Opus 4.7 (1M context) via `/design-tokens`
**Source artifacts:** `.design/b2b-rebuild/DESIGN_BRIEF.md` · `.design/b2b-rebuild/INFORMATION_ARCHITECTURE.md` · existing `tailwind.config.js` · existing `src/app/globals.css`
