# Admin Collection Tabs + Scannable Toggles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the long Payload admin edit pages into tabbed sections, make collapsed array rows show real content, and fix the overlapping "Toggle block" label — with zero data/schema change.

**Architecture:** Wrap each long collection's fields in Payload **unnamed** `tabs` (presentational only → field data paths unchanged). Add two client `RowLabel` components so array rows show meaningful labels. Remove the site `globals.css` (Tailwind Preflight) import from the admin layout, which is leaking resets into Payload and defeating `.collapsible__toggle { color: transparent }`.

**Tech Stack:** Next.js 15, Payload CMS 3.75.0, React 19, TypeScript.

## Global Constraints

- **Unnamed tabs only** — every `tabs` entry has `label` + `fields`, never `name`. Named tabs would nest data and change the schema. Not allowed.
- **`src/payload-types.ts` must not change** — after each collection edit, `git diff --stat src/payload-types.ts` must be empty. If it changes, a named tab or a field rename slipped in; revert and fix.
- **No automated test runner for admin config** — the per-task "test cycle" is: `npm run build` succeeds, `payload-types.ts` diff empty, `pm2 restart excelent-site` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin` returns `200`. Visual checks are called out where relevant.
- **importMap:** `src/app/(payload)/admin/importMap.js` is edited on disk (so the build resolves the new components) but **committed by the user**, never by the implementer. The Payload generate CLI is a no-op in this env — hand-edit.
- **Never commit** (these are the user's): `payload.config.ts`, `payload-types.ts`, `package.json`, `package-lock.json`, `importMap.js`, `CHANGELOG.md`, `messages/*.json`, any `src/app/b2b/**` page file.
- **Never** `git add -A` / `git add .` / `git add -u` / `git commit -am` / `git stash`. Stage only the explicit paths named in each Commit step.
- **Never `git push`** — the user pushes from their own terminal.
- Branch is `feat/social-agent-phase-a`. Brand styling (logo, purple buttons, dark theme) must still render after Task 8.

---

## Task 1: RowLabel components + importMap wiring

**Files:**
- Create: `src/components/admin/ArrayRowLabel.tsx`
- Create: `src/components/admin/PostingSlotRowLabel.tsx`
- Modify: `src/app/(payload)/admin/importMap.js` (on disk; **user commits**)

**Interfaces:**
- Produces: two default-export React client components, referenced by Payload string paths `'/components/admin/ArrayRowLabel'` and `'/components/admin/PostingSlotRowLabel'`. Both read `useRowLabel()` from `@payloadcms/ui` (returns `{ data, rowNumber }`, `rowNumber` 0-based).

- [ ] **Step 1: Create `ArrayRowLabel.tsx`**

```tsx
'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

// Field keys checked in order; first non-empty string wins as the row label.
const LABEL_KEYS = ['theme', 'cta', 'term', 'specialty', 'email', 'text', 'name']

export default function ArrayRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const fallback = `Row ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`

  let label = ''
  for (const key of LABEL_KEYS) {
    const value = data?.[key]
    if (typeof value === 'string' && value.trim()) {
      label = value.trim()
      break
    }
  }
  if (!label) return <span>{fallback}</span>
  const text = label.length > 50 ? `${label.slice(0, 50)}…` : label
  return <span>{text}</span>
}
```

- [ ] **Step 2: Create `PostingSlotRowLabel.tsx`**

```tsx
'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type SlotData = { dayOfWeek?: string; time?: string; platform?: string }

export default function PostingSlotRowLabel() {
  const { data, rowNumber } = useRowLabel<SlotData>()
  const day = DAYS[Number(data?.dayOfWeek)] ?? ''
  const time = data?.time ?? ''
  const platform = data?.platform
    ? data.platform.charAt(0).toUpperCase() + data.platform.slice(1)
    : ''
  const parts = [day, time, platform].filter(Boolean)
  if (!parts.length) return <span>{`Slot ${(rowNumber ?? 0) + 1}`}</span>
  return <span>{parts.join(' · ')}</span>
}
```

- [ ] **Step 3: Wire both into `importMap.js`** (on disk only — user commits)

Add these two import lines alongside the other `import { default as ... }` lines near the top of `src/app/(payload)/admin/importMap.js`:

```js
import { default as default_arrayRowLabel_ee050505 } from '../../../components/admin/ArrayRowLabel'
import { default as default_postingSlotRowLabel_ee060606 } from '../../../components/admin/PostingSlotRowLabel'
```

And add these two entries inside the `export const importMap = { ... }` object (before the final `@payloadcms/next/rsc#CollectionCards` entry):

```js
  "/components/admin/ArrayRowLabel#default": default_arrayRowLabel_ee050505,
  "/components/admin/PostingSlotRowLabel#default": default_postingSlotRowLabel_ee060606,
```

- [ ] **Step 4: Build to verify the components resolve**

Run: `cd /home/bitnami/stack/excelent-site && npm run build 2>&1 | tail -5`
Expected: build completes (last lines show the route table / "Static"/"Dynamic" legend), no module-resolution error for ArrayRowLabel / PostingSlotRowLabel.

- [ ] **Step 5: Commit (components only — NOT importMap.js)**

```bash
cd /home/bitnami/stack/excelent-site
git add src/components/admin/ArrayRowLabel.tsx src/components/admin/PostingSlotRowLabel.tsx
git commit -m "feat(admin): add ArrayRowLabel + PostingSlotRowLabel components

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Note for the controller: remind the user that `importMap.js` is modified on disk and they must commit it with their other wiring.

---

## Task 2: Brand Profiles — tabs + row labels

**Files:**
- Modify: `src/collections/BrandProfiles.ts`

**Interfaces:**
- Consumes: `'/components/admin/ArrayRowLabel'`, `'/components/admin/PostingSlotRowLabel'` (Task 1), and the existing `'/components/admin/GenerateDraftsButton'`.

This task **reorganizes existing field objects** into a `tabs` field. Do not change any field's `name`, `type`, `required`, `options`, `defaultValue`, or `validation` — only move them and add `admin.components.RowLabel` to arrays.

- [ ] **Step 1: Add RowLabel to each array field**

In each array field's `admin` object, add a `components.RowLabel` entry (keep any existing `description`):
- `themes`, `defaultCtas`, `bannedTerms`, `requiredDisclaimers`, `seedExamples`, `reviewers` → `RowLabel: '/components/admin/ArrayRowLabel'`
- `postingSlots` → `RowLabel: '/components/admin/PostingSlotRowLabel'`

Example for `themes`:

```ts
{
  name: 'themes',
  type: 'array',
  labels: { singular: 'Theme', plural: 'Themes' },
  admin: {
    description: 'Content pillars the generator can write about.',
    components: { RowLabel: '/components/admin/ArrayRowLabel' },
  },
  fields: [
    { name: 'theme', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
}
```

- [ ] **Step 2: Wrap fields in unnamed tabs**

Keep `name`, `slug`, and `active` (sidebar) as top-level fields. Replace the remaining top-level fields with a single `tabs` field. The collection `fields` array becomes:

```ts
fields: [
  { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "PS | RCM"' } },
  { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'Lowercase id, e.g. "ps-rcm". Used by the generator.' } },
  { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  {
    type: 'tabs',
    tabs: [
      { label: 'Identity', fields: [ /* voice, audience, reviewers — existing objects, unchanged */ ] },
      { label: 'Content', fields: [ /* themes, defaultCtas, seedExamples, generate (ui) */ ] },
      { label: 'Schedule', fields: [ /* platforms, cadence, postingSlots */ ] },
      { label: 'Guardrails', fields: [ /* bannedTerms, requiredDisclaimers */ ] },
    ],
  },
]
```

Move each existing field object (with its Step-1 RowLabel edits) into the matching tab's `fields` array verbatim. Every previously top-level field except `name`/`slug`/`active` must land in exactly one tab. The `generate` UI field goes in the **Content** tab.

- [ ] **Step 3: Build**

Run: `cd /home/bitnami/stack/excelent-site && npm run build 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 4: Verify no schema drift**

Run: `cd /home/bitnami/stack/excelent-site && git diff --stat src/payload-types.ts`
Expected: **no output** (types unchanged → unnamed tabs confirmed).

- [ ] **Step 5: Restart + smoke-check admin**

Run: `cd /home/bitnami/stack/excelent-site && pm2 restart excelent-site >/dev/null 2>&1; sleep 3; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin`
Expected: `200`. (Controller: ask the user to open a Brand Profile and confirm the four tabs appear and array rows show real labels.)

- [ ] **Step 6: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/BrandProfiles.ts
git commit -m "feat(admin): tabs + scannable row labels for Brand Profiles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Social Posts — tabs

**Files:**
- Modify: `src/collections/SocialPosts.ts`

Reorganize existing fields into unnamed tabs. No field definitions change. Keep `status` in the sidebar (add `admin: { position: 'sidebar' }` if not already present — this is a presentational move, it does not change the column).

- [ ] **Step 1: Wrap fields in unnamed tabs**

Top-level (above tabs): `title`, `brand`, `platform`, `language`. Sidebar: `status`. Then a `tabs` field:

```ts
{
  type: 'tabs',
  tabs: [
    { label: 'Content', fields: [ /* theme, copy, cta, asset, preview (ui), revise (ui) */ ] },
    { label: 'Graphic', fields: [ /* graphicStyle, graphic (group) */ ] },
    { label: 'Review', fields: [ /* reviewerFeedback */ ] },
    { label: 'Schedule & Publish', fields: [ /* scheduledTime, slotSource, campaign, publish (group), publishToLinkedIn (ui) */ ] },
    { label: 'Advanced', fields: [ /* generationMeta (group), notify (group) */ ] },
  ],
}
```

Move every existing field object except `title`/`brand`/`platform`/`language`/`status` into exactly one tab, verbatim.

- [ ] **Step 2: Build** — `npm run build 2>&1 | tail -5` → succeeds.
- [ ] **Step 3: Verify no schema drift** — `git diff --stat src/payload-types.ts` → no output.
- [ ] **Step 4: Restart + smoke** — `pm2 restart excelent-site >/dev/null 2>&1; sleep 3; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin` → `200`.
- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/SocialPosts.ts
git commit -m "feat(admin): tabbed layout for Social Posts (Advanced tab tucks system fields)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Landing Pages — tabs

**Files:**
- Modify: `src/collections/LandingPages.ts`

- [ ] **Step 1: Wrap fields in unnamed tabs**

Top-level (above tabs): `slug`, `locationName`. Sidebar: `status`. Then:

```ts
{
  type: 'tabs',
  tabs: [
    { label: 'Hero', fields: [ /* heroHeadline, heroSubheadline, heroImage, localPhone */ ] },
    { label: 'Content', fields: [ /* specialists, faqs, testimonial, stats (group), threeSteps (group) */ ] },
    { label: 'SEO', fields: [ /* seo (group) */ ] },
    { label: 'Tracking', fields: [ /* tracking (group) */ ] },
  ],
}
```

Move every existing field except `slug`/`locationName`/`status` into exactly one tab, verbatim.

- [ ] **Step 2: Build** → succeeds.
- [ ] **Step 3: Verify no schema drift** — `git diff --stat src/payload-types.ts` → no output.
- [ ] **Step 4: Restart + smoke** → `200`.
- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/LandingPages.ts
git commit -m "feat(admin): tabbed layout for Landing Pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Specialists — tabs + specialties row label

**Files:**
- Modify: `src/collections/Specialists.ts`

- [ ] **Step 1: Add RowLabel to the `specialties` array**

In `specialties.admin`, add `components: { RowLabel: '/components/admin/ArrayRowLabel' }` (the generic component picks up the `specialty` key).

- [ ] **Step 2: Wrap fields in unnamed tabs**

Top-level (above tabs): `name`, `credentials`, `practiceName`. Then:

```ts
{
  type: 'tabs',
  tabs: [
    { label: 'Profile', fields: [ /* specialties, bio, photo */ ] },
    { label: 'Contact', fields: [ /* phone, email, address (group), website, location */ ] },
    { label: 'Settings', fields: [ /* hubspotFormId, acceptingNewPatients, featured */ ] },
  ],
}
```

Move every existing field except `name`/`credentials`/`practiceName` into exactly one tab, verbatim.

- [ ] **Step 3: Build** → succeeds.
- [ ] **Step 4: Verify no schema drift** — `git diff --stat src/payload-types.ts` → no output.
- [ ] **Step 5: Restart + smoke** → `200`.
- [ ] **Step 6: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/Specialists.ts
git commit -m "feat(admin): tabs + specialty row labels for Specialists

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Articles + Pages — tabs

**Files:**
- Modify: `src/collections/Articles.ts`
- Modify: `src/collections/Pages.ts`

- [ ] **Step 1: Articles — wrap in unnamed tabs**

Top-level (above tabs): `title`, `slug`. Sidebar: `status`. Then:

```ts
{
  type: 'tabs',
  tabs: [
    { label: 'Content', fields: [ /* excerpt, content, featuredImage, category, publishedDate, author */ ] },
    { label: 'SEO', fields: [ /* seo (group) */ ] },
  ],
}
```

- [ ] **Step 2: Pages — wrap in unnamed tabs**

Top-level (above tabs): `title`, `slug`. Then:

```ts
{
  type: 'tabs',
  tabs: [
    { label: 'Content', fields: [ /* content, heroImage, heroHeadline, heroSubheadline */ ] },
    { label: 'SEO', fields: [ /* seo (group) */ ] },
  ],
}
```

- [ ] **Step 3: Build** → succeeds.
- [ ] **Step 4: Verify no schema drift** — `git diff --stat src/payload-types.ts` → no output.
- [ ] **Step 5: Restart + smoke** → `200`.
- [ ] **Step 6: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/Articles.ts src/collections/Pages.ts
git commit -m "feat(admin): tabbed Content/SEO layout for Articles and Pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Remaining array row labels (Social Assets, Social Campaigns)

**Files:**
- Modify: `src/collections/SocialAssets.ts`
- Modify: `src/collections/SocialCampaigns.ts`

These short collections stay flat (no tabs) but their array fields should be scannable.

- [ ] **Step 1: Read each file and find its array field**

Run: `cd /home/bitnami/stack/excelent-site && grep -nE "type: 'array'" src/collections/SocialAssets.ts src/collections/SocialCampaigns.ts`

- [ ] **Step 2: Add RowLabel to each array**

For each `type: 'array'` field, add to its `admin` object: `components: { RowLabel: '/components/admin/ArrayRowLabel' }`. If the array's sub-fields use a string key not in `LABEL_KEYS` (`theme`, `cta`, `term`, `specialty`, `email`, `text`, `name`), add that key to the `LABEL_KEYS` array in `src/components/admin/ArrayRowLabel.tsx` so the label resolves (otherwise rows fall back to `Row NN`, which is acceptable but less useful).

- [ ] **Step 3: Build** → succeeds.
- [ ] **Step 4: Verify no schema drift** — `git diff --stat src/payload-types.ts` → no output.
- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/collections/SocialAssets.ts src/collections/SocialCampaigns.ts
# include ArrayRowLabel.tsx ONLY if you edited LABEL_KEYS:
# git add src/components/admin/ArrayRowLabel.tsx
git commit -m "feat(admin): scannable row labels for Social Assets and Campaigns

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Remove Tailwind leak from admin (overlap fix) + final verification

**Files:**
- Modify: `src/app/(payload)/layout.tsx`

**Interfaces:**
- Consumes: nothing new. Removes one import line.

- [ ] **Step 1: Remove the globals.css import**

In `src/app/(payload)/layout.tsx`, delete this line:

```ts
import '../globals.css'
```

Keep `import '@payloadcms/next/css'` and `import './admin-theme.css'`. Order after removal: `@payloadcms/next/css` then `./admin-theme.css`.

- [ ] **Step 2: Build**

Run: `cd /home/bitnami/stack/excelent-site && npm run build 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 3: Restart**

Run: `cd /home/bitnami/stack/excelent-site && pm2 restart excelent-site >/dev/null 2>&1; sleep 3; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin`
Expected: `200`.

- [ ] **Step 4: Visual verification (controller asks the user)**

On a hard-refreshed admin:
1. Array row headers show **only** the row label — no "Toggle block" text overlapping it — on Brand Profiles and any collection with arrays.
2. Brand styling intact: logo on login, purple primary buttons, dark theme, tabs readable.

If overlap persists, add this single fallback rule to the end of `src/app/(payload)/admin-theme.css`, rebuild, and restart:

```css
/* Fallback: keep the collapsible toggle's a11y label visually hidden. */
.collapsible__toggle { color: transparent !important; }
```

- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add "src/app/(payload)/layout.tsx"
# include admin-theme.css ONLY if you added the fallback rule:
# git add "src/app/(payload)/admin-theme.css"
git commit -m "fix(admin): stop leaking site Tailwind into Payload admin (fixes toggle label overlap)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Part 1 tabs for all six long collections → Tasks 2–6. ✓
- Part 2 row labels (generic + posting slot) → Task 1 (components), wired in Tasks 2, 5, 7. ✓
- Part 3 overlap fix via removing Tailwind leak + CSS fallback → Task 8. ✓
- Mechanics (no type change, importMap hand-edit + user commits, build/restart, git rules) → Global Constraints + each task's verify steps. ✓

**Placeholder scan:** The `/* ... existing objects ... */` comments are move-verbatim instructions for field objects that already exist in the files being edited, with the exact field list named — not unwritten logic. All new code (components, tabs scaffold, import lines, CSS fallback) is shown in full.

**Type consistency:** Component string paths (`/components/admin/ArrayRowLabel`, `/components/admin/PostingSlotRowLabel`) and importMap keys (`#default`) match between Task 1 and Tasks 2/5/7. `useRowLabel()` destructure (`data`, `rowNumber`) matches the verified Payload 3.75.0 API (`rowNumber` 0-based). `LABEL_KEYS` referenced in Task 7 is defined in Task 1.

**Schema-safety:** every collection task includes the `git diff --stat src/payload-types.ts` empty-diff gate.
