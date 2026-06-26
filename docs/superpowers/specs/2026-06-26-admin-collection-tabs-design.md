# Admin Collection Tabs + Scannable Toggles — Design

**Date:** 2026-06-26
**Status:** Approved (design)
**Branch:** `feat/social-agent-phase-a`
**Related:** [[project_admin_branding]], `docs/superpowers/specs/2026-06-25-admin-ui-branding-design.md`

## Problem

The Payload admin edit pages for content-heavy collections (Brand Profiles, Social
Posts, Landing Pages, Specialists) are single long vertical scrolls with many fields
and stacked array "toggles". Two concrete pains:

1. **No structure** — everything is one long page; related fields aren't grouped.
2. **Broken / unscannable array toggles** — collapsed array rows show a generic
   label ("Theme 01"), and the row header renders the hidden "Toggle block"
   accessibility text *on top of* the visible label (garbled overlap, e.g.
   "ToggT­ehbel­moeck01"). This affects every collection with array fields.

## Goals

- Group each long collection's fields into tabbed sections in the admin edit view.
- Make collapsed array rows show their real content instead of "Theme 01".
- Fix the overlapping-label rendering bug globally.
- **Zero data-model change**, no migration, no regeneration of `payload-types.ts`.

## Non-Goals

- No change to the public site, APIs, or stored data shape.
- No restructuring of short collections (FAQs, Media, Users, Testimonials,
  Demo Requests, Social Assets, Social Campaigns) into tabs — they stay flat.
  (They still get scannable row labels where they have arrays.)
- No light/dark theme work (covered by the separate admin-branding effort).

## Approach (chosen: A)

Native Payload **unnamed `tabs`** field + custom **`RowLabel`** components +
**remove the Tailwind leak** from the admin layout. Rejected alternatives:
B) CSS/JS band-aid (fragile, doesn't solve the long page); C) split arrays into
related collections (big data-model change, migrations, more clicks).

### Why unnamed tabs = no schema change

Payload `tabs` can be **unnamed** (presentational only). Unnamed-tab child fields
keep their existing top-level data paths (`theme`, `voice`, etc.), so the database
columns, stored documents, and generated types are unchanged. This makes the whole
change a pure admin-UI reorganization with no migration risk. (Named tabs would
nest data under the tab name and WOULD change the schema — we do **not** use them.)

## Part 1 — Tabbed layouts

Rules applied to every collection below:
- Fields placed **before** the `tabs` field render above the tabs (always visible).
- Fields with `admin.position: 'sidebar'` stay in the sidebar regardless.
- `ui` fields (buttons/preview) are placed in the most relevant tab.
- Tabs are **unnamed**; each entry has a `label` and a `fields` array.

### Brand Profiles
- Above tabs: `name`, `slug` · Sidebar: `active`
- **Identity**: voice, audience, reviewers
- **Content**: themes, defaultCtas, seedExamples, generate (UI button)
- **Schedule**: platforms, cadence, postingSlots
- **Guardrails**: bannedTerms, requiredDisclaimers

### Social Posts
- Above tabs: `title`, `brand`, `platform`, `language` · Sidebar: `status`
- **Content**: theme, copy, cta, asset, preview (UI), revise (UI)
- **Graphic**: graphicStyle, graphic (group)
- **Review**: reviewerFeedback
- **Schedule & Publish**: scheduledTime, slotSource, campaign, publish (group),
  publishToLinkedIn (UI)
- **Advanced** (system/automation, intentionally tucked away): generationMeta
  (group), notify (group)

### Landing Pages
- Above tabs: `slug`, `locationName` · Sidebar: `status`
- **Hero**: heroHeadline, heroSubheadline, heroImage, localPhone
- **Content**: specialists, faqs, testimonial, stats (group), threeSteps (group)
- **SEO**: seo (group)
- **Tracking**: tracking (group)

### Specialists
- Above tabs: `name`, `credentials`, `practiceName`
- **Profile**: specialties, bio, photo
- **Contact**: phone, email, address (group), website, location
- **Settings**: hubspotFormId, acceptingNewPatients, featured

### Articles
- Above tabs: `title`, `slug` · Sidebar: `status`
- **Content**: excerpt, content, featuredImage, category, publishedDate, author
- **SEO**: seo (group)

### Pages
- Above tabs: `title`, `slug`
- **Content**: content, heroImage, heroHeadline, heroSubheadline
- **SEO**: seo (group)

## Part 2 — Scannable row labels

Two admin components, registered via each array field's
`admin.components.RowLabel`:

### `ArrayRowLabel` (generic, reused everywhere)
Uses Payload's `useRowLabel()` hook to read the row `data` and `rowNumber`.
Renders the first present value among a known set of common field keys, in order:
`theme`, `cta`, `term`, `email`, `specialty`, `text`. Truncates to ~50 chars.
Falls back to `Row {rowNumber}` when the row is empty.

Applied to: Brand Profiles (themes, defaultCtas, bannedTerms, requiredDisclaimers,
seedExamples, reviewers), Specialists (specialties), Social Assets / Social
Campaigns arrays — every array except posting slots.

### `PostingSlotRowLabel` (dedicated)
For Brand Profiles `postingSlots` (a composite row). Formats
`{Day} · {HH:mm} · {Platform}` (e.g. `Mon · 09:00 · LinkedIn`) from the row's
`dayOfWeek` / `time` / `platform` values; falls back to `Slot {rowNumber}`.

Both are client components (`'use client'`) exporting a default React component.

## Part 3 — Overlap-bug fix (root cause)

`src/app/(payload)/layout.tsx` imports `'../globals.css'`, which pulls the site's
full Tailwind build (incl. **Preflight** base resets) into the Payload admin. The
admin's own components use only Payload classes (`nav__link`, `btn--style-primary`)
— never Tailwind utilities — so the admin does not need `globals.css`. Tailwind
Preflight resetting Payload's elements is the most likely cause of the
`.collapsible__toggle { color: transparent }` rule being defeated, which makes the
hidden "Toggle block" text visible and overlap the row label.

**Fix:** remove the `import '../globals.css'` line from the admin layout. Keep
`@payloadcms/next/css` and `./admin-theme.css`.

**Verification & fallback:** after the change, load the live authenticated admin
and confirm the array row headers show only the row label (no overlap). If any
overlap remains, add a single scoped fallback rule to `admin-theme.css`:
`.collapsible__toggle { color: transparent !important; }` — but removing the leak
is the primary, root-cause fix.

## Mechanics / constraints

- **Types:** unnamed tabs add no fields → `payload-types.ts` unchanged. No codegen
  needed (the Payload CLI is broken in this env anyway — see project memory).
- **importMap:** the two RowLabel components are referenced by string path and need
  entries in `src/app/(payload)/admin/importMap.js` (hand-edited — the generate CLI
  is a no-op here). Per standing git rules, `importMap.js` is committed by the user,
  not the assistant.
- **Files the assistant edits + commits:** the six collection configs
  (`BrandProfiles.ts`, `SocialPosts.ts`, `LandingPages.ts`, `Specialists.ts`,
  `Articles.ts`, `Pages.ts`), the two new RowLabel components, and
  `src/app/(payload)/layout.tsx` (globals.css removal). Plus `SocialAssets.ts` /
  `SocialCampaigns.ts` if their arrays get RowLabels.
- **Files the user commits:** `src/app/(payload)/admin/importMap.js`.
- **Build/restart:** `npm run build` + `pm2 restart excelent-site` to verify; both
  are pre-authorized for this work.
- **Standing git rules unchanged:** never `git add -A`/`.`; never commit
  `payload.config.ts`, `payload-types.ts`, `package*.json`, `importMap.js`,
  `CHANGELOG.md`, `messages/*.json`, or b2b page files; never `git push` (user does).

## Testing / acceptance

1. Each redesigned collection's edit page shows the defined tabs; clicking a tab
   reveals its fields; data saves and reloads correctly (no field loses its value).
2. A `git diff` of `payload-types.ts` is empty after the change (proves no schema
   drift).
3. Collapsed array rows show real content (theme title, CTA text, `Mon · 09:00 ·
   LinkedIn`, etc.), not "Theme 01".
4. No "Toggle block" text overlapping any row label, on any collection.
5. Admin still renders with brand styling (logo, purple buttons, dark theme intact)
   after removing the `globals.css` import.
