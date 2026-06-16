# Social Agent — Phase A (drafts + approval)

## What it does
Generates brand-aligned social drafts and routes them through human review inside
the Payload admin. No publishing yet — nothing leaves the CMS.

## Setup
- Set `ANTHROPIC_API_KEY` in `.env`. `SOCIAL_MODEL` defaults to `claude-sonnet-4-6`
  (set `claude-opus-4-8` for max quality).
- After pulling these changes onto the server: `npm run build && pm2 restart excelent-site`.
- **Creating the DB tables:** `push: true` only runs in development. Under `next start`
  (`NODE_ENV=production`) Payload neither pushes nor migrates, so new-collection tables
  must be synced manually. Use `scripts/schema-preview.mts` to dump the exact DDL drizzle
  would run (`node --import tsx scripts/schema-preview.mts` — writes `schema-push.full.sql`,
  applies nothing), filter out any `ALTER COLUMN ... SET` statements on pre-existing tables
  (those are unrelated config/DB drift and can fail on live data), wrap the additive
  statements in `BEGIN;`/`COMMIT;`, and apply with
  `psql -v ON_ERROR_STOP=1 -f`. Repeat this for every future phase that adds collections.

## Daily use
1. **Brand Profiles** (Social group) — one record per product. Edit voice, themes,
   CTAs, banned terms, required disclaimers, and seed examples.
2. On a brand's edit page, use **Generate drafts** (theme + platform + count).
3. **Social Posts** — review drafts. Edit copy, then set status:
   - **Approved** — good to use (edits you make become a learning signal).
   - **Needs changes / Rejected** — add **reviewer feedback** explaining why.
4. The next generation for that brand is automatically taught by the approved,
   edited, and rejected posts. No analytics required.

## Guardrails
Every draft is checked for banned terms and required disclaimers. Misses are noted
in `generationMeta.guardrailFlags` — review before approving.

## Curated images
Upload approved images to **Social Assets**, tag by brand and theme. The generator
attaches a matching asset to each draft. (AI image generation is a later phase.)

## Tests
Pure-logic modules have unit tests: `node --import tsx --test src/lib/social/*.test.ts`.

## Not in Phase A
Publishing to LinkedIn/Meta, scheduling, comment replies, and performance analytics
are later phases and intentionally excluded here.

## Regenerating Payload artifacts in this repo
The stock `payload` CLI fails under tsx with an undici error. Use the working forms:
- Types: `npm run generate:types` (already points at `node --import tsx node_modules/payload/dist/bin/index.js generate:types`).
- Import map (after adding/removing a custom admin component): run the same binary with
  `generate:importmap`, then confirm the component appears in
  `src/app/(payload)/admin/importMap.js`. Note: the admin imports `./admin/importMap`
  extensionlessly, so the canonical file must be `importMap.js` (there must be no
  shadowing `importMap.ts`). Since `generate:importmap` is unreliable here, entries are
  added by hand — mirror the two `GenerateDraftsButton` lines (an `import { default as … }`
  and a `"/components/admin/<Name>#default": …` map entry).

## Post preview + generated brand graphics (built 2026-06-15)

Reviewers see each draft as a realistic platform card (avatar + brand + copy + image +
reaction bar) with an auto-generated, on-brand graphic in the image slot.

- **Renderer:** `next/og` (Satori, built into Next 15 — no new deps). Templates are HTML/CSS
  rendered to a 1080×1080 PNG using the site's real tokens and bundled Cabin/Montserrat
  TTFs. Engine lives in `src/lib/social/graphics/` (`theme.ts`, `fonts.ts`,
  `templates/{hook,stat,dataviz}.tsx`, `render.tsx`, `fromPost.ts`, `text.ts`).
- **Styles** (per-post dropdown `graphicStyle`, generator suggests one): `hook` (punchy line,
  punchline auto-coloured), `stat` (before→after number on navy), `dataviz` (two-bar
  comparison), `none` (branded panel).
- **On-image text** comes from the editable `graphic` group on each post
  (`headline`, `subtext`, `statFrom/To/Label`, `caption`) — pre-filled by the generator,
  tweakable without touching the post copy.
- **Route** `src/app/api/social/graphic/route.ts`: `GET ?postId=` renders the live preview
  PNG (auth-gated); `POST {postId}` renders and stores it as a Social Asset linked to the
  post (the publishable image for Phase B / Blotato).
- **Preview component** `src/components/admin/PostPreview.tsx` — a `ui` field on SocialPosts;
  the image `<img>` points at the GET route, so the preview *is* the real PNG.
- **Schema:** `graphicStyle` + `graphic` group were synced to the prod `social_posts` table
  via the preview→filter→psql flow (additive only).
- **Verify:** `node --import tsx scripts/verify-graphic.mts` renders all three styles from a
  real draft to `/tmp/graphic-*.png`.
