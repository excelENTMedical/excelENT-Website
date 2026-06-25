# ExcelENT Admin UI Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brand the stock Payload admin with an ExcelENT dark theme — purple/blue accents, logo on login + nav, a login label, and a branded browser title — with no layout changes or new views.

**Architecture:** A single admin-scoped stylesheet (`admin-theme.css`) imported in the `(payload)` layout after Payload's own CSS recolors accent surfaces (buttons, active nav, focus rings) by targeting Payload UI class names. Three tiny presentational components (`BrandLogo`, `BrandIcon`, `LoginBranding`) plug into Payload's `graphics`/`beforeLogin` config hooks and are hand-registered in `importMap.js` (auto-gen is broken in this env). `admin.meta.titleSuffix` brands the browser title.

**Tech Stack:** Payload CMS 3.75.0, Next.js 15, React 19, plain CSS, pm2.

## Global Constraints

- Brand colors (exact): purple `#89007a`, purple-light `#C25BAB`, blue `#459fdc`, navy `#061b42`.
- **Dark theme only** — do not add a light theme or toggle.
- The theme stylesheet is imported **only** in `src/app/(payload)/layout.tsx`, keeping it **admin-scoped**; the public patient/b2b sites must remain visually unchanged.
- **Do not override** Payload's semantic `--theme-success-*` / `--theme-error-*` / `--theme-warning-*` colors (status pills keep their meaning).
- The brand stylesheet import must come **after** `import '@payloadcms/next/css'` so it overrides Payload's styles.
- importMap auto-generation is broken in this environment — **hand-edit** `src/app/(payload)/admin/importMap.js` for every new admin component (follow the existing entries).
- Payload UI class-name selectors are pinned to **3.75.0**; verify against the live admin DOM during implementation.
- Work stays on branch `feat/social-agent-phase-a`. Do **not** run `git push` (user pushes from their own terminal). Do **not** `git add -A`/`.`; stage only the explicit paths named in each commit step.
- Admin URL for verification: `http://localhost:3000/admin`.

---

### Task 1: Brand theme stylesheet wired into the admin layout

**Files:**
- Create: `src/app/(payload)/admin-theme.css`
- Modify: `src/app/(payload)/layout.tsx:9` (add import after `@payloadcms/next/css`)

**Interfaces:**
- Consumes: nothing.
- Produces: brand CSS custom properties `--ee-purple`, `--ee-purple-light`, `--ee-blue`, `--ee-navy` on `:root` (used by the components in Tasks 2–3), and recolored Payload accent surfaces.

- [ ] **Step 1: Create the stylesheet**

Create `src/app/(payload)/admin-theme.css`:

```css
/* ExcelENT admin theme — brand accents over Payload's dark base.
   Admin-scoped: imported only in (payload)/layout.tsx, AFTER Payload's CSS. */
:root {
  --ee-purple: #89007a;
  --ee-purple-light: #c25bab;
  --ee-blue: #459fdc;
  --ee-navy: #061b42;
}

/* Primary buttons: Save, Create new, Connect LinkedIn, etc. */
.btn--style-primary,
.btn--style-primary:link,
.btn--style-primary:visited {
  background-color: var(--ee-purple);
  border-color: var(--ee-purple);
  color: #fff;
}
.btn--style-primary:hover,
.btn--style-primary:focus {
  background-color: var(--ee-purple-light);
  border-color: var(--ee-purple-light);
  color: #fff;
}

/* Active / hovered nav item */
.nav__link--active,
.nav .nav__link.active {
  color: var(--ee-blue);
  box-shadow: inset 2px 0 0 var(--ee-purple);
}
.nav__link:hover {
  color: var(--ee-blue);
}

/* Form field focus accents */
.field-type input:focus,
.field-type textarea:focus,
.field-type .rs__control--is-focused {
  border-color: var(--ee-purple) !important;
  box-shadow: 0 0 0 1px var(--ee-purple) !important;
}

/* Checkbox / radio checked state */
input[type='checkbox']:checked,
input[type='radio']:checked {
  accent-color: var(--ee-purple);
}
```

- [ ] **Step 2: Import the stylesheet in the admin layout**

In `src/app/(payload)/layout.tsx`, the imports currently are:

```tsx
import { importMap } from './admin/importMap'
import '../globals.css'
import '@payloadcms/next/css'
```

Add the brand import as the **last** style import:

```tsx
import { importMap } from './admin/importMap'
import '../globals.css'
import '@payloadcms/next/css'
import './admin-theme.css'
```

- [ ] **Step 3: Build to verify it compiles**

Run: `cd /home/bitnami/stack/excelent-site && npm run build`
Expected: build completes without errors (the new CSS import resolves).

- [ ] **Step 4: Restart and verify the accent renders**

Run: `pm2 restart excelent-site && sleep 3 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin`
Expected: `200` (or `307` redirect to login — both fine).

Then load `http://localhost:3000/admin` in a browser and confirm: the login **Log in** button (and, once logged in, the **Save**/**Create new** buttons) are **purple**, not the default. If a selector misses, inspect the element in dev tools and adjust the selector in `admin-theme.css`, then rebuild.

- [ ] **Step 5: Verify the public site is unaffected**

Run: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/`
Expected: `200`. Load the patient/b2b homepage in a browser and confirm no visual change (the theme file is admin-scoped).

- [ ] **Step 6: Commit**

```bash
git add "src/app/(payload)/admin-theme.css" "src/app/(payload)/layout.tsx"
git commit -m "feat(admin): brand theme stylesheet with ExcelENT purple/blue accents"
```

---

### Task 2: Logo on login + icon in nav

**Files:**
- Create: `src/components/admin/BrandLogo.tsx`
- Create: `src/components/admin/BrandIcon.tsx`
- Modify: `src/app/(payload)/admin/importMap.js` (register both)
- Modify: `src/payload.config.ts` (`admin.components.graphics`)

**Interfaces:**
- Consumes: `--ee-purple` from Task 1 (BrandIcon monogram fallback).
- Produces: components registered at importMap keys `/components/admin/BrandLogo#default` and `/components/admin/BrandIcon#default`.

- [ ] **Step 1: Create the login logo component**

Create `src/components/admin/BrandLogo.tsx`:

```tsx
import React from 'react'

// Rendered on the login screen via admin.components.graphics.Logo
export default function BrandLogo() {
  return (
    <img
      src="/images/logo.png"
      alt="excelENT"
      style={{ maxWidth: 220, width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
    />
  )
}
```

- [ ] **Step 2: Create the nav icon component**

Create `src/components/admin/BrandIcon.tsx`. The wordmark is wide, so the small square nav slot uses a brand monogram by default (legible at 24px). If you prefer the scaled logo after viewing it, swap the body for the commented `<img>`.

```tsx
import React from 'react'

// Rendered in the nav header via admin.components.graphics.Icon
export default function BrandIcon() {
  return (
    <span
      style={{
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: '-0.02em',
        color: 'var(--ee-purple, #89007a)',
      }}
    >
      eX
    </span>
  )
  // Alternative (scaled logo):
  // return <img src="/images/logo.png" alt="excelENT" style={{ width: 24, height: 24, objectFit: 'contain' }} />
}
```

- [ ] **Step 3: Register both components in importMap.js**

In `src/app/(payload)/admin/importMap.js`, add these two import lines immediately after the existing `default_socialCalendar_aa11bb22` import (around line 29):

```js
import { default as default_brandLogo_ee010101 } from '../../../components/admin/BrandLogo'
import { default as default_brandIcon_ee020202 } from '../../../components/admin/BrandIcon'
```

Then, inside the `importMap` object, add these two entries immediately before the closing `CollectionCards` line:

```js
  "/components/admin/BrandLogo#default": default_brandLogo_ee010101,
  "/components/admin/BrandIcon#default": default_brandIcon_ee020202,
```

- [ ] **Step 4: Wire graphics into the config**

In `src/payload.config.ts`, the `admin.components` block currently is:

```js
    components: {
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
      },
    },
```

Replace it with (adds `graphics`, keeps `views`):

```js
    components: {
      graphics: {
        Logo: '/components/admin/BrandLogo',
        Icon: '/components/admin/BrandIcon',
      },
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
      },
    },
```

- [ ] **Step 5: Build to verify wiring**

Run: `cd /home/bitnami/stack/excelent-site && npm run build`
Expected: build succeeds. A wrong importMap key or path fails the build here.

- [ ] **Step 6: Restart and verify visually**

Run: `pm2 restart excelent-site && sleep 3 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin`
Expected: `200`/`307`.

Load `http://localhost:3000/admin` (logged out) → the **exceLENT logo** shows above the login form. Log in → the **nav top-left** shows the `eX` monogram (or scaled logo if you swapped it). Decide the icon treatment here.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/BrandLogo.tsx src/components/admin/BrandIcon.tsx "src/app/(payload)/admin/importMap.js" src/payload.config.ts
git commit -m "feat(admin): ExcelENT logo on login and monogram in nav"
```

---

### Task 3: Login label + branded browser title

**Files:**
- Create: `src/components/admin/LoginBranding.tsx`
- Modify: `src/app/(payload)/admin/importMap.js` (register it)
- Modify: `src/payload.config.ts` (`admin.components.beforeLogin` + `admin.meta`)

**Interfaces:**
- Consumes: nothing new.
- Produces: component registered at importMap key `/components/admin/LoginBranding#default`.

- [ ] **Step 1: Create the login label component**

Create `src/components/admin/LoginBranding.tsx`:

```tsx
import React from 'react'

// Rendered above the login form via admin.components.beforeLogin
export default function LoginBranding() {
  return (
    <p
      style={{
        textAlign: 'center',
        margin: '0 0 20px',
        fontSize: 14,
        color: 'var(--theme-elevation-600)',
      }}
    >
      Social &amp; Content Admin
    </p>
  )
}
```

- [ ] **Step 2: Register in importMap.js**

In `src/app/(payload)/admin/importMap.js`, add this import after the `default_brandIcon_ee020202` import from Task 2:

```js
import { default as default_loginBranding_ee030303 } from '../../../components/admin/LoginBranding'
```

And add this entry to the `importMap` object before the `CollectionCards` line (after the two from Task 2):

```js
  "/components/admin/LoginBranding#default": default_loginBranding_ee030303,
```

- [ ] **Step 3: Wire beforeLogin + meta into the config**

In `src/payload.config.ts`, add `beforeLogin` inside `admin.components` (after `graphics`):

```js
      beforeLogin: ['/components/admin/LoginBranding'],
```

So the block reads:

```js
    components: {
      graphics: {
        Logo: '/components/admin/BrandLogo',
        Icon: '/components/admin/BrandIcon',
      },
      beforeLogin: ['/components/admin/LoginBranding'],
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
      },
    },
```

Then add `meta` immediately after the `components` block (a sibling key under `admin`, before the `admin` block's closing `},`):

```js
    meta: {
      titleSuffix: '— excelENT Admin',
    },
```

- [ ] **Step 4: Build to verify wiring**

Run: `cd /home/bitnami/stack/excelent-site && npm run build`
Expected: build succeeds.

- [ ] **Step 5: Restart and verify visually**

Run: `pm2 restart excelent-site && sleep 3 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin`
Expected: `200`/`307`.

Load `http://localhost:3000/admin` (logged out) → "Social & Content Admin" appears under the logo. Check the **browser tab title** ends with "— excelENT Admin".

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/LoginBranding.tsx "src/app/(payload)/admin/importMap.js" src/payload.config.ts
git commit -m "feat(admin): login label and branded browser title"
```

---

### Task 4: Final cohesive visual verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: all prior tasks.
- Produces: confirmation the brand reads across the admin, and the public sites are unchanged.

- [ ] **Step 1: Confirm a clean build + processes healthy**

Run: `cd /home/bitnami/stack/excelent-site && npm run build && pm2 restart excelent-site && sleep 3 && pm2 list | grep -E 'excelent-site|social-scheduler'`
Expected: build succeeds; both processes `online`.

- [ ] **Step 2: Walk the key admin screens in a browser**

Load `http://localhost:3000/admin` and confirm, in dark mode:
- **Login:** logo + "Social & Content Admin" label + purple **Log in** button.
- **Nav:** brand icon top-left; the active nav item shows the purple/blue accent.
- **Collection list** (e.g. Social Posts): purple **Create new** button; rows render normally.
- **Edit view:** field focus rings are purple; **Save** is purple; a status pill (e.g. publish state) still uses Payload's success/error colors (not overridden).

Capture screenshots of login, nav, a list, and an edit view for the record.

- [ ] **Step 3: Confirm public sites unchanged**

Run: `for p in / /b2b; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done`
Expected: both `200`. Spot-check the patient and b2b homepages in a browser — no color/style changes.

- [ ] **Step 4: Update the changelog**

Add a dated entry to `CHANGELOG.md` summarizing the admin branding (theme, logo, login label, title). Then:

```bash
git add CHANGELOG.md
git commit -m "docs: changelog entry for admin UI branding"
```

> Note: `CHANGELOG.md` is on the user's "I commit my own files" list and currently has uncommitted edits. If it shows unrelated working changes, **skip this step** and let the user add the changelog entry themselves rather than bundling their edits.

---

## Self-Review

**Spec coverage:**
- Brand theme stylesheet (dark + purple/blue accents, admin-scoped, semantic colors preserved) → Task 1. ✓
- Logo on login (`graphics.Logo`) → Task 2. ✓
- Nav icon (`graphics.Icon`, monogram default w/ scaled-logo fallback) → Task 2. ✓
- Login label (`beforeLogin`) → Task 3. ✓
- Browser title (`admin.meta.titleSuffix`) → Task 3. ✓
- importMap hand-registration (broken CLI gotcha) → Tasks 2 & 3. ✓
- Public sites unaffected verification → Tasks 1 & 4. ✓
- Favicon → intentionally deferred/out of scope per spec (not a task). ✓

**Placeholder scan:** No TBD/TODO; all code blocks are complete; selectors include a "verify against live DOM" instruction which is the legitimate CSS-theming workflow, not a placeholder.

**Type/key consistency:** importMap import identifiers (`default_brandLogo_ee010101`, `default_brandIcon_ee020202`, `default_loginBranding_ee030303`) and their map keys (`/components/admin/BrandLogo#default`, `.../BrandIcon#default`, `.../LoginBranding#default`) match the component file paths and the config `Component`/`graphics`/`beforeLogin` string references. ✓
