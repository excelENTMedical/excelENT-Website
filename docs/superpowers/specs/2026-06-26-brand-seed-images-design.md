# Brand seed images + on-demand AI post image generation — design

Date: 2026-06-26
Branch: feat/social-agent-phase-a
Status: approved (design)

## Problem

Brand profiles can hold text seed examples and structured guidance, but there is
no way to upload **images** to a brand. Two needs:

1. **Used for posts** — images attachable as a social post's image.
2. **Guidelines for new images** — reference images that steer AI generation of
   new on-brand post images.

Today image creation is programmatic only (`renderGraphic` turns post text into a
branded PNG); `social-assets.source = 'ai-generated'` is a placeholder with no AI
generation behind it. The only model key in `.env` is `ANTHROPIC_API_KEY`, and
Claude does not generate images.

## Decisions (locked during brainstorming)

- **Feed AI image generation now** (not store-only).
- **Reuse the `social-assets` collection** as the single image store.
- **Every seed image is both** postable and a style reference (no per-image role).
- **Provider: OpenAI `gpt-image-1`** via the `/v1/images/edits` endpoint, which
  accepts multiple reference images (`image[]`) plus a prompt and returns
  `data[0].b64_json`. Use `input_fidelity: 'high'` to preserve reference style.
- **Trigger: on-demand button on a social post** (most control; no spend on
  rejected drafts).
- **No SDK** — raw `fetch` multipart, matching `src/lib/social/claude.ts`
  ("keeps the box lean").

## Data model

### BrandProfiles (`src/collections/BrandProfiles.ts`)

Add two fields:

- `seedImages` — `type: 'relationship'`, `relationTo: 'social-assets'`,
  `hasMany: true`. Uploaded/added from the brand profile via the relationship
  drawer (supports inline "Create New" upload). Because they are `social-assets`,
  they are also selectable as any post's `asset` (satisfies "used for posts").
  Admin description: "Example images that define this brand's visual style. Used
  as references when generating new post images, and selectable as post images."
- `imageStyleGuidance` — `type: 'textarea'`, optional. Free-text visual direction
  (e.g. "clean clinical, generous whitespace, navy/purple accents, no stock-photo
  people") that complements the reference images in the generation prompt.

No change to `social-assets` schema. Generated images continue to be stored there
with `source: 'ai-generated'`.

### SocialPosts (`src/collections/SocialPosts.ts`)

Add a `ui` field `generateImage` whose `admin.components.Field` is
`/components/admin/GenerateImageButton` (mirrors the existing `generate` ui field
pattern on BrandProfiles and the other admin buttons).

## Generation flow

Button → `POST /api/social/image` `{ postId }`:

1. **Auth** — `payload.auth({ headers })`; no user → 401.
2. **Validate body** — missing/invalid `postId` → 400.
3. **Load post** — `findByID('social-posts', postId, { depth: 1 })`; not found → 404.
4. **Load brand + seed images** — from the post's `brand`, read `seedImages`
   (depth so filenames are available).
5. **Build prompt** — `buildImagePrompt(post, brand)` combines post `copy`,
   `theme`, `cta`, and brand `imageStyleGuidance`. Plain, descriptive; instructs a
   social-post image consistent with the reference images' style. Avoid embedding
   long post copy verbatim; summarize intent.
6. **Load references** — `loadSeedImageFiles(payload, brand)` reads up to
   `OPENAI_IMAGE_MAX_REFS` (default 4) seed-image files from the upload static dir
   on disk → `[{ buffer, filename, mimetype }]`.
7. **Generate**:
   - If references exist → `editImage({ prompt, references, size, quality })`
     (OpenAI `/v1/images/edits`, `input_fidelity: 'high'`).
   - If none → fall back to text-only `/v1/images/generations` with the same
     prompt, so the button still works. Response notes the fallback.
8. **Store** — `payload.create('social-assets', { data: { alt, brand, source:
   'ai-generated' }, file: { data: png, mimetype: 'image/png', name, size } })`.
9. **Attach** — `payload.update('social-posts', postId, { data: { asset:
   asset.id } })`.
10. **Respond** — `{ ok: true, assetId, usedReferences: boolean }`. Errors:
    502 on OpenAI failure (with logged detail), 500 on store/attach failure.

## Modules

- `src/lib/social/image/openai.ts` — `editImage(args)` and `generateImage(args)`,
  thin raw-`fetch` clients. Multipart `FormData`/`Blob` for edits (Node 20
  globals). Reads `OPENAI_API_KEY`; throws if unset. Returns `Buffer`.
- `src/lib/social/image/prompt.ts` — `buildImagePrompt(post, brand): string`.
  Pure, unit-testable.
- `src/lib/social/image/refs.ts` — `loadSeedImageFiles(payload, brand)`. Resolves
  each seed `social-asset` to its on-disk file; caps at `OPENAI_IMAGE_MAX_REFS`;
  skips any it cannot read (logs, does not throw).
- `src/app/api/social/image/route.ts` — `POST` orchestration above.
  `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
- `src/components/admin/GenerateImageButton.tsx` — client button; POSTs the
  current post id, shows pending/result/error, refreshes on success. Mirrors
  `GenerateDraftsButton` / `PublishToLinkedInButton`.

## Configuration (env)

| Var | Default | Purpose |
|-----|---------|---------|
| `OPENAI_API_KEY` | — (required) | OpenAI auth |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1` | image model |
| `OPENAI_IMAGE_SIZE` | `1024x1024` | output size |
| `OPENAI_IMAGE_QUALITY` | `medium` | output quality |
| `OPENAI_IMAGE_MAX_REFS` | `4` | max reference images per request |

## Schema + wiring (env-specific gotchas)

- Payload `db.push` is on, but prod builds need the schema to already exist.
  Use the existing `scripts/schema-preview.mts` → filter drift → additive DDL in a
  transaction via `psql -v ON_ERROR_STOP=1`.
  - `imageStyleGuidance` → new column on `brand_profiles`.
  - `seedImages` (relationship `hasMany`) → Payload stores relationships in the
    `brand_profiles_rels` table; confirm via schema-preview whether a new rels
    path/row type is needed and apply exactly what it reports. Do not assume a
    bespoke array table.
- Payload CLI codegen is broken in this env → hand-patch `src/payload-types.ts`
  (add `seedImages` + `imageStyleGuidance` to the `BrandProfile` interface and its
  `*Select` interface) to mirror codegen.
- `payload.config.ts` + `src/app/(payload)/admin/importMap.js` get the new
  `GenerateImageButton` entry. Per the standing branch rule, implementers MODIFY
  these on disk (so build/admin work) but **leave them uncommitted** — the user
  commits config + importMap from their own terminal. Never `git push`.

## Testing

- `buildImagePrompt` unit test: includes post copy intent + brand
  `imageStyleGuidance`; produces a non-empty string; tolerates missing optional
  fields.
- Route guards unit test (mock `fetch` + payload): 401 unauth, 400 bad body, 404
  missing post; success path stores an asset and attaches it; no-references path
  takes the text-only fallback. No live OpenAI call.

## Out of scope (YAGNI)

- Auto image generation during draft creation.
- Batch image generation from the brand profile page.
- Per-image roles (every seed image is both postable and a reference).
- Non-OpenAI providers; image editing/inpainting UI; regeneration history.
```
