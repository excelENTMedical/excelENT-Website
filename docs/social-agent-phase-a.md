# Social Agent — Phase A (drafts + approval)

## What it does
Generates brand-aligned social drafts and routes them through human review inside
the Payload admin. No publishing yet — nothing leaves the CMS.

## Setup
- Set `ANTHROPIC_API_KEY` in `.env`. `SOCIAL_MODEL` defaults to `claude-sonnet-4-6`
  (set `claude-opus-4-8` for max quality).
- After pulling these changes onto the server: `npm run build && pm2 restart excelent-site`.
  The three new tables are created automatically on boot (the Postgres adapter runs
  with `push: true`).

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
  shadowing `importMap.ts`).
