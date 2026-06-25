# ExcelENT Admin UI Branding — Design

**Date:** 2026-06-25
**Status:** Approved (design); pending implementation plan
**Branch:** `feat/social-agent-phase-a` (same admin as the social agent)

## Goal

Make the Payload admin panel feel like an ExcelENT product instead of stock
Payload. Scope is **branding/theming only** — a dark base with ExcelENT
purple/blue accents, a branded logo, a polished login, and a branded browser
title. **No layout changes, no new views, no changes to existing workflow
screens' internals.**

## Decisions (from brainstorming)

- **Primary goal:** Brand it (ExcelENT look) — not a new dashboard, not a social-
  screens refactor.
- **Theme base:** Keep Payload's **dark** chrome; swap default blue accents for
  ExcelENT purple/blue. (No light theme, no user toggle.)
- **Login:** Logo above the form + branded card/button. Keep Payload's centered
  dark layout. (No gradient backdrop.)
- **Logo asset:** `public/images/logo.png` — the "exceLENT" wordmark (blue + purple
  on transparent). Confirmed it reads on dark. No SVG, no redesign.

## How Payload 3 theming works here (grounding)

- **No `admin.css` config option** in Payload 3. Global admin CSS is added by
  importing a stylesheet in `src/app/(payload)/layout.tsx`, which already imports
  `../globals.css`. The brand theme file is imported **immediately after**
  `globals.css` so its rules win on cascade order, and because it is only imported
  in the `(payload)` layout it is **scoped to the admin** — the public patient/b2b
  sites are unaffected.
- Payload themes via grayscale ramps `--theme-elevation-0..1000` and semantic
  `--theme-success/error/warning-*`. There is **no built-in brand-accent
  variable**, so brand color is applied by targeting Payload's component classes
  directly (primary buttons, active nav, focus rings, links).
- Supported config hooks (verified in `payload/dist/config/types.d.ts`):
  `admin.components.graphics.Logo` (login), `admin.components.graphics.Icon`
  (nav), `admin.components.beforeLogin` (array), `admin.meta` (titleSuffix,
  favicon, ogImage).
- **Known env gotcha:** importMap auto-generation is broken in this environment
  (see project memory). New admin components must be **hand-registered** in
  `src/app/(payload)/admin/importMap.js`, following the existing custom-component
  entries (ConnectLinkedInButton, etc.).

## Components / changes

### 1. Brand theme stylesheet — `src/app/(payload)/admin-theme.css`
New file, imported in `src/app/(payload)/layout.tsx` right after `../globals.css`.

- Brand tokens in `:root`:
  - `--ee-purple: #89007a`
  - `--ee-purple-light: #C25BAB`
  - `--ee-blue: #459fdc`
  - `--ee-navy: #061b42`
- Recolor **accent surfaces only** (leave dark elevation grays alone):
  - Primary buttons (`.btn--style-primary`) → purple bg; hover → `--ee-purple-light`
  - Active nav item / left-rail highlight → purple
  - Links / anchors → blue
  - Input focus borders, checked checkboxes/toggles, focus rings → purple
  - Status pills keep Payload's success/error colors (don't override semantics)
- Selectors are pinned to Payload UI **3.75.0** class names. Accepted risk: these
  are internal classes that could change across major upgrades; acceptable for an
  internal tool, and isolated to one file.

### 2. Logo on login — `src/components/admin/BrandLogo.tsx`
Renders `public/images/logo.png` for `admin.components.graphics.Logo`. Simple
presentational component (img with constrained max-width, transparent bg).

### 3. Nav icon — `src/components/admin/BrandIcon.tsx`
For `admin.components.graphics.Icon` (small top-left square). Default: scaled
`logo.png` with `object-fit: contain`. Build-time fallback if it looks cramped:
a simple "X"/monogram mark. (Deferred visual call — does not block the design.)

### 4. Login label — `src/components/admin/LoginBranding.tsx`
For `admin.components.beforeLogin`. One short line under the logo (e.g. "Social &
Content Admin"). The card/button color comes from the theme file, not this
component.

### 5. Browser title — `admin.meta`
`titleSuffix: '— excelENT Admin'`. Favicon optional/deferred (the wordmark is
wide and would letterbox as a square favicon; skip, or add a square crop later —
user's call, not blocking).

### 6. Config wiring — `src/payload.config.ts`
Add under `admin`:
- `components.graphics.Logo` → `/components/admin/BrandLogo`
- `components.graphics.Icon` → `/components/admin/BrandIcon`
- `components.beforeLogin` → [`/components/admin/LoginBranding`]
- `meta.titleSuffix`
And hand-register the three components in `importMap.js`.

## Out of scope (YAGNI)

- Light theme or light/dark toggle
- Custom dashboard / landing page, new views, nav restructuring
- Changes to the social calendar / post preview / review screen internals (they
  inherit the new accent colors automatically)
- Logo redesign, new SVG assets
- Reworking favicon/OG imagery (deferred, optional)

## Testing

Visual CSS — no unit tests. Verification is manual:
1. `npm run build` succeeds.
2. Load the admin and check, in dark mode: login (logo + label + purple button),
   nav (icon + active item purple), a collection list, an edit view (field focus
   rings, links, save button), and a status pill.
3. Capture screenshots of the key screens to confirm the brand reads.
4. Confirm the public patient/b2b sites are visually unchanged (theme file is
   admin-scoped).

## Risks

- `globals.css` is imported into the admin and may already override some Payload
  styles; the brand file is imported after it to win on order. Watch for existing
  `!important` rules that could fight the accent overrides.
- Payload internal class names are version-pinned (3.75.0); revisit on a major
  Payload upgrade.
- importMap hand-edit required (known env gotcha) — easy to miss; explicitly in
  the plan.

## Open items (deferred to build, non-blocking)

- Nav icon: scaled logo vs. monogram.
- Favicon: skip vs. square crop.
