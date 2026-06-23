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

## Revise with feedback (built 2026-06-17)

Per-post AI revision: give the AI a note and it rewrites the copy and/or graphic *in place*
(distinct from the batch-level corpus, which only shapes the next generation run).

- **Control** `src/components/admin/ReviseDraftButton.tsx` — a `ui` field on SocialPosts
  (under reviewer feedback): a note textarea, a Copy / Graphic / Both target select, and a
  **Revise with AI** button. POSTs to `/api/social/revise` and reloads the document.
- **Route** `src/app/api/social/revise/route.ts`: `POST {postId, note, target}`, auth-gated;
  `target` defaults to `both` if absent/invalid.
- **Engine** `src/lib/social/revise.ts`: `buildRevisePrompt` (reuses the brand system prompt +
  `buildBrandConfig`), `parseRevision` (target-filtered, same graphicStyle coercion as the
  generator), and `reviseDraft` orchestrator. Re-runs guardrails on revised copy; resets
  `status` to `draft`; **preserves `generationMeta.originalCopy`** so the first-gen→final
  before/after pair still trains the next batch.
- **No schema change** — only writes existing fields (`copy`, `cta`, `graphicStyle`, `graphic`,
  `generationMeta.guardrailFlags`, `status`). Version history (`maxPerDoc: 20`) makes revisions
  rollback-able. No psql sync needed (the `revise` field is `ui`, not a column).
- **Verify:** `node --import tsx scripts/verify-revise.mts` runs a real copy revision on a draft
  and prints before/after + confirms `originalCopy` is preserved.

## LinkedIn publishing (built 2026-06-18)

Approved posts publish straight to ExcelENT's LinkedIn Company Page — text + the
generated graphic — now or on a schedule. Built behind a swappable `Publisher`
interface (`src/lib/social/publish/`) so Facebook/Instagram/Blotato can be added
later without touching the orchestrator.

### One-time setup
1. In the LinkedIn developer app (Community Management API product enabled), register
   the redirect URL and copy the client id/secret.
2. Add to `.env`: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`,
   `LINKEDIN_REDIRECT_URI` (must exactly match the registered URL —
   `https://excelentmedical.com/api/social/linkedin/callback`), then
   `npm run build && pm2 restart excelent-site --update-env`.
3. Sync the new DB columns/table (see Phase A schema-sync flow) for `social_posts`
   (`scheduled_time`, `publish_*`) and the `linkedin_connection` global table.
4. Start the scheduler:
   `pm2 start scripts/social-scheduler.mts --name social-scheduler --interpreter node --interpreter-args "--import tsx"`,
   then `pm2 save`.
5. In the admin → Social → **LinkedIn Connection**, click **Connect LinkedIn** and
   authorize. The connected page URN + tokens are stored; tokens auto-refresh.

### Publishing
1. Generate → review → set a post to **Approved**.
2. Optionally set **Scheduled Time** (leave empty to publish immediately).
3. Click **Publish to LinkedIn**. The **Publish** group shows state (sent/failed),
   the post URN, and any error. Scheduled posts are published by the `social-scheduler`
   worker when due (retries up to 3 times).

### Not included
Facebook/Instagram, analytics, comment replies, and editing/deleting a live post.
