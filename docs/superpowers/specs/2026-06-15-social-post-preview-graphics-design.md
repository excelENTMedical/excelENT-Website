# Social Post Preview + Generated Brand Graphics — Design

Status: **approved, ready for implementation plan.**
Date: 2026-06-15
Builds on: Phase A social agent (brand profiles, drafts, guardrails) and
`docs/social-agent-graphics-brand-spec.md` (template-rendered, not AI-generated).

## Problem

Generated drafts are reviewed in Payload's default editor — a plain `copy`
textarea and an `asset` relationship picker. There is no realistic "this is how
the post will look" view, and no image at all on the test drafts. Reviewers
can't judge a post the way it will actually appear. We want:

1. A realistic in-admin **post preview** (platform card chrome + copy + image).
2. The post shown **with a generated brand graphic** that matches the live site
   exactly (real colors, Cabin/Montserrat fonts, spacing).

## Decisions (settled in brainstorming)

- **Generated brand graphic**, not stock or AI-generated imagery, for the card
  itself. (AI image models can't render exact colors, fonts, logo, or—critically
  for a healthcare brand—correct on-image text/stats. See cost/fitness note below.)
- **Realistic preview** uses platform card chrome (LinkedIn / Facebook /
  Instagram), switched by the post's `platform`.
- **Graphic style is chosen per post** via a dropdown: `hook`, `stat`,
  `dataviz`, or `none`. The generator suggests one; the reviewer can flip it.
- **On-image text comes from editable graphic fields** on the post. The
  generator pre-fills them; the reviewer can tweak them without touching the
  post copy.
- **Renderer: `next/og` (Satori)**, built into Next 15 — in-process, no headless
  browser, low memory, **no new npm dependencies**, and exact fonts/colors. The
  live preview is an `<img>` pointing at the same render route, so the preview is
  the real PNG (no preview/export drift). Produces a publishable PNG for Phase B.

### Why Satori over an AI image model (e.g. "nano banana"/Gemini image)

They solve different problems. Satori deterministically renders our exact
layout/colors/fonts/logo and—decisively—**correct text** ("11.8% → 2.5%"), at
**$0/image** (CPU in the existing Next process). AI image models approximate
colors, can't hit a specific typeface or logo, and are unreliable at on-image
text — unacceptable for accurate, compliance-sensitive healthcare stats. AI image
gen is retained only as a *future, optional* source for photographic/illustrative
**backgrounds** behind the Satori frame, never for the branded layout or text.

## Architecture

### 1. Data model — additions to `src/collections/SocialPosts.ts`

- `graphicStyle` — `select`, options `none | hook | stat | dataviz`, sidebar.
  Default filled by the generator's suggestion (fallback `hook`).
- `graphic` — `group` of editable text fields, pre-filled by the generator:
  - `headline` — main statement / hook line.
  - `subtext` — supporting line.
  - `statFrom`, `statTo`, `statLabel` — for the stat hero (e.g. `11.8%`, `2.5%`,
    `ENT Denial Rate`).
  - `caption` — small footer line (e.g. `$57.23 per reworked claim · 43% never recovered`).
  Each template consumes only the subset it needs; unused fields are ignored.
- The existing `asset` relationship holds the rendered PNG once "Save graphic" is
  used, so Phase B (Blotato) has a real image to publish.

These are new columns on a table that already exists in the **production**
database. `push:true` is dev-only, so they must be synced manually via the
established flow: `scripts/schema-preview.mts` → filter out `ALTER COLUMN … SET`
drift on existing tables → wrap additive DDL in `BEGIN/COMMIT` →
`psql -v ON_ERROR_STOP=1 -f`.

### 2. Graphic engine — `src/lib/social/graphics/`

- `theme.ts` — brand → design-token map mirroring `src/app/tokens.css`
  (navy `#061b42`, purple `#89007a`, blue, zinc text/surface scale, radii).
  Maps the brand's product to the `b2b` or `patient` theme (B2B products →
  `b2b`; Patient-Facing → `patient`).
- `templates/hook.tsx`, `templates/stat.tsx`, `templates/dataviz.tsx` — the
  three approved directions, each a pure function
  `(data, theme) => <Satori element tree>` using the flexbox CSS subset Satori
  supports.
- `fonts.ts` — loads bundled Cabin + Montserrat `.ttf` buffers from
  `src/lib/social/graphics/fonts/` (the site uses `next/font/google`, which does
  not expose raw font files, so we bundle the OFL-licensed binaries).
- `render.ts` — `(style, data, theme) => ImageResponse` (`next/og`) → PNG.
  Square **1080×1080** for v1.

### 3. Render route — `src/app/api/social/graphic/route.ts`

`GET /api/social/graphic?postId=<id>` — auth-gated (Payload `req.user`). Loads
the post's `graphicStyle`, `graphic` fields, and brand theme; renders the PNG via
`render.ts`; returns `image/png`. Used both as the live-preview `<img>` source
(cache-busted when fields change) and by the "Save graphic" action.

### 4. Admin preview component — `src/components/admin/PostPreview.tsx`

A custom Payload `ui` field on `SocialPosts` that renders realistic **platform
card chrome** — avatar, brand name, the post `copy`, reaction bar — selected by
the post's `platform` (LinkedIn / Facebook / Instagram), with the graphic `<img>`
(render route) in the image slot. It updates as the reviewer edits copy, style,
or graphic fields. Includes a **"Save graphic"** button that renders the PNG,
stores it as a Social Asset, and links it to the post's `asset` for publishing.

### 5. Generator update — `src/lib/social/generate.ts` + `src/lib/social/prompt.ts`

Generation additionally returns the graphic fields (`headline`, `subtext`,
`statFrom/To/Label`, `caption`) and a suggested `graphicStyle`, written onto the
draft. A freshly generated post therefore arrives with a sensible, switchable
graphic rather than a blank image slot.

### 6. Testing — `node:test` via `tsx` (existing pattern)

- `theme.ts`: brand/product → correct theme tokens.
- Templates: each selects the right fields; handles empty/oversized text
  (truncation) without throwing.
- `render.ts`: returns a valid PNG buffer of the expected dimensions for each
  style.
- Route: rejects unauthenticated requests; returns PNG for a valid post.
- Generator: populates the graphic fields and a valid `graphicStyle`.

## Scope guards (YAGNI)

- One square size (1080×1080) for v1; per-platform dimensions are a later refinement.
- No AI background images yet — Satori frame only.
- **No new npm dependencies** (`next/og` and `sharp` already present). The only
  new committed *files* are the bundled font binaries and new social-agent source.
- Commit only new social-agent files by explicit path. Do **not** touch the
  user's uncommitted `package.json`, `payload-types.ts`, `payload.config.ts`, or
  `CHANGELOG.md`. (No dependency or config changes are required, so this holds.)

## Out of scope / deferred

- Phase B publishing to Blotato (separate plan already drafted) — this design
  only ensures a real PNG asset exists for it to consume.
- AI-generated photographic backgrounds behind the Satori frame.
- Logo SVG lockups, per-platform safe areas, and additional templates beyond the
  three (announcement, checklist) from the graphics brand spec.
