# Brand Seed Images + On-Demand AI Post Image Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let brand profiles hold uploaded seed images that are both selectable as post images and used as style references when an on-demand button generates a new AI image for a social post.

**Architecture:** Reuse the existing `social-assets` upload collection as the single image store; reference it from `brand-profiles` via a `seedImages` relationship array. A new `POST /api/social/image` route loads a post's brand seed images, builds a prompt, calls OpenAI `gpt-image-1` (`/v1/images/edits` with the seed images as `image[]` references, `input_fidelity: 'high'`), stores the result as a `social-asset`, and attaches it to the post. A `ui` button on the post triggers it.

**Tech Stack:** Next.js 15, Payload CMS 3.75, PostgreSQL 15, Node 20, raw `fetch` (no SDK), `node:test` for unit tests.

## Global Constraints

- Branch `feat/social-agent-phase-a`. Large pre-existing uncommitted working tree (b2b rebuild, branding). NEVER `git add -A` / `git add .` / `git commit -am` / `git stash`. Stage ONLY the exact files named in each task's commit step.
- LEAVE UNCOMMITTED (the user commits these from their own terminal): `src/app/(payload)/admin/importMap.js`, `src/payload-types.ts`, `package.json`, `package-lock.json`. Implementers MODIFY them on disk where a task requires it, but never stage/commit them. (This feature does NOT modify `src/payload.config.ts`.)
- NEVER run `git push` (the user pushes; the PAT must not enter the session).
- Payload CLI codegen/importmap is broken in this env → hand-edit `importMap.js` and `payload-types.ts`, mirroring existing entries.
- Raw `fetch` only — no `openai`/SDK dependency (matches `src/lib/social/claude.ts`). No new npm packages.
- Shell: single-quote anything containing `!`. DB password has no special chars.
- Run a single test file with: `node --import tsx --test <path>`. Full build: `npm run build`. Schema preview: `node --import tsx scripts/schema-preview.mts`.
- Provider config (env, read at runtime only — not needed to build): `OPENAI_API_KEY` (required), `OPENAI_IMAGE_MODEL` (default `gpt-image-1`), `OPENAI_IMAGE_SIZE` (default `1024x1024`), `OPENAI_IMAGE_QUALITY` (default `medium`), `OPENAI_IMAGE_MAX_REFS` (default `4`).

## File Structure

- Create `src/lib/social/image/prompt.ts` — pure `buildImagePrompt(post, brand)`.
- Create `src/lib/social/image/prompt.test.ts`.
- Create `src/lib/social/image/openai.ts` — `editImage()` / `generateImage()` raw-fetch clients.
- Create `src/lib/social/image/openai.test.ts`.
- Create `src/lib/social/image/refs.ts` — `loadSeedImageFiles(payload, brand, opts)`.
- Create `src/lib/social/image/refs.test.ts`.
- Create `src/app/api/social/image/route.ts` — orchestration.
- Create `src/components/admin/GenerateImageButton.tsx` — client button.
- Modify `src/collections/BrandProfiles.ts` — add `seedImages` + `imageStyleGuidance`.
- Modify `src/collections/SocialPosts.ts` — add `generateImage` ui field.
- Modify `src/app/(payload)/admin/importMap.js` — register the button (UNCOMMITTED).
- Modify `src/payload-types.ts` — hand-patch new BrandProfile fields (UNCOMMITTED).

---

### Task 1: Image prompt builder

**Files:**
- Create: `src/lib/social/image/prompt.ts`
- Test: `src/lib/social/image/prompt.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `buildImagePrompt(post: PromptPost, brand: PromptBrand): string`, with `PromptPost = { copy?: string; theme?: string | null; cta?: string | null; title?: string | null }` and `PromptBrand = { name?: string | null; imageStyleGuidance?: string | null }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/image/prompt.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildImagePrompt } from './prompt'

test('buildImagePrompt includes theme, copy intent, and brand style guidance', () => {
  const out = buildImagePrompt(
    { copy: 'Denials are draining your clinic. Here is how to fix them.', theme: 'Denials', cta: 'Book a demo' },
    { name: 'PS | RCM', imageStyleGuidance: 'clean clinical, navy and purple accents' },
  )
  assert.match(out, /Denials/)
  assert.match(out, /draining your clinic/)
  assert.match(out, /navy and purple accents/)
  assert.match(out, /reference images/i)
})

test('buildImagePrompt tolerates missing optional fields', () => {
  const out = buildImagePrompt({}, {})
  assert.equal(typeof out, 'string')
  assert.ok(out.length > 0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/image/prompt.test.ts`
Expected: FAIL — cannot find module `./prompt`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/social/image/prompt.ts
export interface PromptPost {
  copy?: string
  theme?: string | null
  cta?: string | null
  title?: string | null
}
export interface PromptBrand {
  name?: string | null
  imageStyleGuidance?: string | null
}

/** Build a descriptive prompt for an on-brand social post image. Pure. */
export function buildImagePrompt(post: PromptPost, brand: PromptBrand): string {
  const lines: string[] = []
  lines.push('Create a single social media post image for a healthcare / medical-technology brand.')
  if (brand?.name) lines.push(`Brand: ${brand.name}.`)
  if (post?.theme) lines.push(`Topic / theme: ${post.theme}.`)
  const intent = (post?.copy || '').trim().replace(/\s+/g, ' ').slice(0, 400)
  if (intent) lines.push(`The post is about: ${intent}`)
  if (brand?.imageStyleGuidance) lines.push(`Visual style guidance: ${brand.imageStyleGuidance.trim()}`)
  lines.push('Match the visual style, palette, and composition of the reference images provided.')
  lines.push('Clean, professional, on-brand. No text overlays, no logos, no watermarks, no real-person likenesses.')
  return lines.join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/image/prompt.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/image/prompt.ts src/lib/social/image/prompt.test.ts
git commit -m "feat(social): image prompt builder for AI post images"
```

---

### Task 2: OpenAI image client

**Files:**
- Create: `src/lib/social/image/openai.ts`
- Test: `src/lib/social/image/openai.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface ImageRef { buffer: Buffer; filename: string; mimetype: string }`
  - `editImage(args: { prompt: string; references: ImageRef[]; size?: string; quality?: string; model?: string }): Promise<Buffer>` — POSTs `https://api.openai.com/v1/images/edits` (multipart, `image[]` per reference, `input_fidelity: 'high'`).
  - `generateImage(args: { prompt: string; size?: string; quality?: string; model?: string }): Promise<Buffer>` — POSTs `https://api.openai.com/v1/images/generations` (JSON).
  - Both throw if `OPENAI_API_KEY` is unset and decode `data[0].b64_json` into a `Buffer`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/image/openai.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { editImage } from './openai'

test('editImage decodes b64_json into a Buffer and calls the edits endpoint', async () => {
  process.env.OPENAI_API_KEY = 'test-key'
  const png = Buffer.from('hello-png')
  const orig = globalThis.fetch
  let calledUrl = ''
  let auth = ''
  globalThis.fetch = (async (url: any, init: any) => {
    calledUrl = String(url)
    auth = init?.headers?.authorization || ''
    return new Response(JSON.stringify({ data: [{ b64_json: png.toString('base64') }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as any
  try {
    const out = await editImage({
      prompt: 'p',
      references: [{ buffer: Buffer.from('ref'), filename: 'r.png', mimetype: 'image/png' }],
    })
    assert.equal(out.toString(), 'hello-png')
    assert.match(calledUrl, /\/v1\/images\/edits$/)
    assert.equal(auth, 'Bearer test-key')
  } finally {
    globalThis.fetch = orig
  }
})

test('editImage throws when OPENAI_API_KEY is missing', async () => {
  const prev = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    await assert.rejects(() => editImage({ prompt: 'p', references: [] }), /OPENAI_API_KEY/)
  } finally {
    if (prev) process.env.OPENAI_API_KEY = prev
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/image/openai.test.ts`
Expected: FAIL — cannot find module `./openai`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/social/image/openai.ts
const API_EDITS = 'https://api.openai.com/v1/images/edits'
const API_GEN = 'https://api.openai.com/v1/images/generations'

export interface ImageRef {
  buffer: Buffer
  filename: string
  mimetype: string
}

function cfg() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return {
    apiKey,
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
    quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
  }
}

async function decode(res: Response): Promise<Buffer> {
  if (!res.ok) {
    const detail = await res.text().catch(() => '(unreadable body)')
    throw new Error(`OpenAI image ${res.status}: ${detail}`)
  }
  const data = (await res.json()) as { data?: Array<{ b64_json?: string }> }
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI image: no b64_json in response')
  return Buffer.from(b64, 'base64')
}

/** Generate a new image conditioned on reference images (gpt-image-1 edits). */
export async function editImage(args: {
  prompt: string
  references: ImageRef[]
  size?: string
  quality?: string
  model?: string
}): Promise<Buffer> {
  const c = cfg()
  const form = new FormData()
  form.append('model', args.model || c.model)
  form.append('prompt', args.prompt)
  form.append('size', args.size || c.size)
  form.append('quality', args.quality || c.quality)
  form.append('input_fidelity', 'high')
  for (const ref of args.references) {
    form.append('image[]', new Blob([ref.buffer], { type: ref.mimetype }), ref.filename)
  }
  const res = await fetch(API_EDITS, {
    method: 'POST',
    headers: { authorization: `Bearer ${c.apiKey}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  })
  return decode(res)
}

/** Generate a new image from a text prompt only (no references). */
export async function generateImage(args: {
  prompt: string
  size?: string
  quality?: string
  model?: string
}): Promise<Buffer> {
  const c = cfg()
  const res = await fetch(API_GEN, {
    method: 'POST',
    headers: { authorization: `Bearer ${c.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: args.model || c.model,
      prompt: args.prompt,
      size: args.size || c.size,
      quality: args.quality || c.quality,
      n: 1,
    }),
    signal: AbortSignal.timeout(120_000),
  })
  return decode(res)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/image/openai.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/image/openai.ts src/lib/social/image/openai.test.ts
git commit -m "feat(social): OpenAI gpt-image-1 client (edits + generations)"
```

---

### Task 3: Seed-image file loader

**Files:**
- Create: `src/lib/social/image/refs.ts`
- Test: `src/lib/social/image/refs.test.ts`

**Interfaces:**
- Consumes: `ImageRef` shape from Task 2 conceptually (returns the same `{ buffer, filename, mimetype }`).
- Produces: `loadSeedImageFiles(payload, brand, opts?): Promise<SeedFile[]>` where `SeedFile = { buffer: Buffer; filename: string; mimetype: string }` and `opts = { max?: number; baseDir?: string }`. Reads brand `seedImages` (populated objects or ids), caps at `max` (default env `OPENAI_IMAGE_MAX_REFS` or 4), reads each file from `baseDir` (default `<cwd>/public/social-assets`), skips unreadable files without throwing.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/image/refs.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadSeedImageFiles } from './refs'

const payload = { logger: { warn() {} } } as any

test('loadSeedImageFiles reads files, caps at max, skips unreadable', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'seed-'))
  await writeFile(path.join(dir, 'a.png'), Buffer.from('AAA'))
  await writeFile(path.join(dir, 'b.png'), Buffer.from('BBB'))
  const brand = {
    seedImages: [
      { filename: 'a.png', mimeType: 'image/png' },
      { filename: 'b.png', mimeType: 'image/png' },
      { filename: 'missing.png', mimeType: 'image/png' },
    ],
  }
  const all = await loadSeedImageFiles(payload, brand, { baseDir: dir })
  assert.equal(all.length, 2)
  assert.equal(all[0].buffer.toString(), 'AAA')
  assert.equal(all[0].mimetype, 'image/png')

  const capped = await loadSeedImageFiles(payload, brand, { baseDir: dir, max: 1 })
  assert.equal(capped.length, 1)
})

test('loadSeedImageFiles returns [] when brand has no seedImages', async () => {
  assert.deepEqual(await loadSeedImageFiles(payload, {}, { baseDir: '/nope' }), [])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/image/refs.test.ts`
Expected: FAIL — cannot find module `./refs`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/social/image/refs.ts
import path from 'node:path'
import { readFile } from 'node:fs/promises'

export interface SeedFile {
  buffer: Buffer
  filename: string
  mimetype: string
}

const DEFAULT_BASE = path.join(process.cwd(), 'public', 'social-assets')

/**
 * Resolve a brand's seedImages to on-disk reference files for the image model.
 * Accepts populated relationship objects or raw ids. Caps at `max`. Never throws
 * on a single unreadable file — it logs and skips.
 */
export async function loadSeedImageFiles(
  payload: any,
  brand: any,
  opts: { max?: number; baseDir?: string } = {},
): Promise<SeedFile[]> {
  const max = opts.max ?? Number(process.env.OPENAI_IMAGE_MAX_REFS) || 4
  const baseDir = opts.baseDir ?? DEFAULT_BASE
  const seeds = Array.isArray(brand?.seedImages) ? brand.seedImages : []
  const out: SeedFile[] = []
  for (const s of seeds) {
    if (out.length >= max) break
    let asset: any = s
    if (typeof s !== 'object' || s == null) {
      asset = await payload.findByID({ collection: 'social-assets', id: s, disableErrors: true })
    }
    const filename = asset?.filename
    if (!filename) continue
    try {
      const buffer = await readFile(path.join(baseDir, filename))
      out.push({ buffer, filename, mimetype: asset.mimeType || 'image/png' })
    } catch (err) {
      payload?.logger?.warn?.({ err, filename }, 'seed image file unreadable')
    }
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/image/refs.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/image/refs.ts src/lib/social/image/refs.test.ts
git commit -m "feat(social): load brand seed images as model reference files"
```

---

### Task 4: Image generation API route

**Files:**
- Create: `src/app/api/social/image/route.ts`

**Interfaces:**
- Consumes: `buildImagePrompt` (Task 1), `editImage`/`generateImage` (Task 2), `loadSeedImageFiles` (Task 3).
- Produces: `POST /api/social/image` `{ postId }` → `{ ok: true, assetId, usedReferences }` | error JSON.

- [ ] **Step 1: Write the route**

```ts
// src/app/api/social/image/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { buildImagePrompt } from '@/lib/social/image/prompt'
import { loadSeedImageFiles } from '@/lib/social/image/refs'
import { editImage, generateImage } from '@/lib/social/image/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/social/image { postId } → generate an on-brand image, store + attach it. */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({
    collection: 'social-posts',
    id: body.postId,
    depth: 2,
    disableErrors: true,
  })) as any
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const brand =
    typeof post.brand === 'object'
      ? post.brand
      : await payload.findByID({ collection: 'brand-profiles', id: post.brand, depth: 1, disableErrors: true })
  const brandId = typeof post.brand === 'object' ? post.brand.id : post.brand

  const prompt = buildImagePrompt(post, brand || {})

  let png: Buffer
  let usedReferences = false
  try {
    const refs = await loadSeedImageFiles(payload, brand)
    if (refs.length > 0) {
      png = await editImage({ prompt, references: refs })
      usedReferences = true
    } else {
      png = await generateImage({ prompt })
    }
  } catch (err) {
    payload.logger.error({ err }, 'social image generation failed')
    return NextResponse.json({ error: 'generation failed' }, { status: 502 })
  }

  try {
    const asset = await payload.create({
      collection: 'social-assets',
      data: { alt: `${post.title || 'post'} AI image`, brand: brandId, source: 'ai-generated' },
      file: { data: png, mimetype: 'image/png', name: `post-${body.postId}-ai.png`, size: png.length },
    })
    await payload.update({ collection: 'social-posts', id: body.postId, data: { asset: asset.id } })
    return NextResponse.json({ ok: true, assetId: asset.id, usedReferences })
  } catch (err) {
    payload.logger.error({ err }, 'social image save failed')
    return NextResponse.json({ error: 'save failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify the module chain compiles**

Run: `npm run build`
Expected: build exits 0 (compiled successfully). This validates Task 1–4 imports/types together. If the build flakes with an `ENOENT .next/server/*-manifest.json` finalization error (known race when building against the live server under memory pressure), re-run once; a real type error repeats deterministically.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/social/image/route.ts
git commit -m "feat(social): POST /api/social/image generates + attaches an AI image"
```

---

### Task 5: Brand fields, post button, and importMap wiring

**Files:**
- Modify: `src/collections/BrandProfiles.ts` (add fields after the `seedExamples` array, before the `generate` ui field)
- Modify: `src/collections/SocialPosts.ts` (add a `generateImage` ui field after the `asset` field)
- Create: `src/components/admin/GenerateImageButton.tsx`
- Modify (UNCOMMITTED): `src/app/(payload)/admin/importMap.js`

**Interfaces:**
- Consumes: `POST /api/social/image` (Task 4).
- Produces: a brand `seedImages` relationship + `imageStyleGuidance` field; a post "Generate image (AI)" button.

- [ ] **Step 1: Add the BrandProfiles fields**

In `src/collections/BrandProfiles.ts`, immediately after the `seedExamples` array field object and before the `generate` ui field object, insert:

```ts
    {
      name: 'seedImages',
      type: 'relationship',
      relationTo: 'social-assets',
      hasMany: true,
      admin: {
        description:
          "Example images that define this brand's visual style. Used as references when generating new post images, and selectable as a post's image. Use “Create New” in the picker to upload.",
      },
    },
    {
      name: 'imageStyleGuidance',
      type: 'textarea',
      admin: {
        description:
          'Optional. Free-text visual direction for generated images (e.g. "clean clinical, generous whitespace, navy/purple accents, no stock-photo people").',
      },
    },
```

- [ ] **Step 2: Add the SocialPosts button field**

In `src/collections/SocialPosts.ts`, immediately after the `{ name: 'asset', type: 'relationship', relationTo: 'social-assets' },` line, insert:

```ts
    {
      name: 'generateImage',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/GenerateImageButton',
        },
      },
    },
```

- [ ] **Step 3: Create the button component**

```tsx
// src/components/admin/GenerateImageButton.tsx
'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function GenerateImageButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the post before generating an image.</p>

  const run = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/social/image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(
        data.usedReferences
          ? 'Image generated from the brand’s seed images and attached. Reload to see it.'
          : 'Image generated (brand has no seed images — used a text-only prompt). Reload to see it.',
      )
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <button type="button" onClick={run} disabled={busy}>
        {busy ? 'Generating…' : 'Generate image (AI)'}
      </button>
      <p style={{ marginTop: 6, fontSize: 12, color: '#52525b' }}>
        Uses this brand’s seed images as style references. Replaces the post’s current image.
      </p>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Register the button in importMap.js (UNCOMMITTED)**

In `src/app/(payload)/admin/importMap.js`, add an import line alongside the other `/components/admin/*` imports (after the `CalendarNavLink` import):

```js
import { default as default_generateImage_ff050505 } from '../../../components/admin/GenerateImageButton'
```

And add a map entry inside the `importMap` object, after the `"/components/admin/CalendarNavLink#default"` entry:

```js
  "/components/admin/GenerateImageButton#default": default_generateImage_ff050505,
```

- [ ] **Step 5: Build to verify wiring**

Run: `npm run build`
Expected: build exits 0. (Re-run once if the manifest race appears, per Task 4 Step 2.)

- [ ] **Step 6: Commit ONLY the tracked feature files (NOT importMap.js)**

```bash
git add src/collections/BrandProfiles.ts src/collections/SocialPosts.ts src/components/admin/GenerateImageButton.tsx
git commit -m "feat(social): brand seed images + per-post Generate Image button"
```

Note: `src/app/(payload)/admin/importMap.js` stays modified-but-unstaged for the user to commit.

---

### Task 6: Database schema, types patch, deploy

**Files:**
- Modify (UNCOMMITTED): `src/payload-types.ts`
- DB: `excelent_cms` (additive DDL)

**Interfaces:**
- Consumes: the new fields from Task 5.
- Produces: DB columns/tables backing `seedImages` + `imageStyleGuidance`; matching types; a restarted prod app serving the feature.

- [ ] **Step 1: Preview the schema drift**

Run: `node --import tsx scripts/schema-preview.mts`
Expected: it prints the exact `CREATE TABLE`/`ALTER TABLE` statements drizzle would run for the two new fields. Treat THIS OUTPUT as the source of truth for Step 2 (do not invent column types). Expect roughly:
- a relationships table for brand_profiles (e.g. `brand_profiles_rels` with `id`, `order`, `parent_id`, `path`, `social_assets_id`) — `brand_profiles` has no relationship fields today, so this table likely does not exist yet, and
- `ALTER TABLE "brand_profiles" ADD COLUMN "image_style_guidance" varchar;`

Ignore any unrelated drift from the large working tree — apply ONLY statements for `brand_profiles` / `brand_profiles_rels`.

- [ ] **Step 2: Apply the additive DDL in a transaction**

Put the exact statements from Step 1 into a heredoc and run them with `ON_ERROR_STOP`. Example shape (substitute the real statements from Step 1):

```bash
set -a && source /home/bitnami/stack/excelent-site/.env 2>/dev/null && set +a
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- paste the brand_profiles_rels CREATE TABLE (+ indexes/FKs) from schema-preview here
-- paste: ALTER TABLE "brand_profiles" ADD COLUMN "image_style_guidance" varchar;
COMMIT;
SQL
```

Re-run `node --import tsx scripts/schema-preview.mts` and confirm the `brand_profiles` / `brand_profiles_rels` statements no longer appear.

- [ ] **Step 3: Hand-patch payload-types.ts (UNCOMMITTED)**

In `src/payload-types.ts`, find the `BrandProfile` interface and add (mirroring how other relationship/text fields are typed there):

```ts
  seedImages?: (number | SocialAsset)[] | null;
  imageStyleGuidance?: string | null;
```

Find the `BrandProfilesSelect` interface (the `*Select` for brand profiles) and add:

```ts
  seedImages?: T;
  imageStyleGuidance?: T;
```

(If `SocialPosts` `generateImage` ui field is reflected in the posts `*Select` interface for other ui fields, mirror that too; ui fields usually are not — match the existing `generate` ui field on BrandProfiles, which does not appear in types.)

- [ ] **Step 4: Full build**

Run: `npm run build`
Expected: build exits 0 with the new fields compiled. (Re-run once on the manifest race.)

- [ ] **Step 5: Restart the web app**

```bash
cd /home/bitnami/stack/excelent-site && pm2 restart excelent-site --update-env
```

- [ ] **Step 6: Smoke-check routes (auth required, so 401 is the healthy signal)**

```bash
curl -s -o /dev/null -w 'image route (expect 401): %{http_code}\n' -X POST http://localhost:3000/api/social/image -H 'content-type: application/json' -d '{"postId":1}'
curl -s -o /dev/null -w 'admin (expect 200): %{http_code}\n' http://localhost:3000/admin
```

Expected: image route → 401 (route exists, rejects unauthenticated), admin → 200.

- [ ] **Step 7: Commit (nothing new to commit here)**

No git commit in this task — `payload-types.ts` stays uncommitted for the user. The schema change is in the database, not a tracked file.

---

## Post-implementation handoff (for the user, from their own terminal)

1. Add `OPENAI_API_KEY=...` to `.env` (and optionally `OPENAI_IMAGE_MODEL`/`OPENAI_IMAGE_SIZE`/`OPENAI_IMAGE_QUALITY`/`OPENAI_IMAGE_MAX_REFS`), then `pm2 restart excelent-site --update-env`. The button returns a clear error until the key is set.
2. Commit `src/app/(payload)/admin/importMap.js` and `src/payload-types.ts` (and `package*.json` if touched — this feature does not touch them).
3. `git push feat/social-agent-phase-a`.
4. Upload 2–4 seed images to a brand profile (Brand Profiles → Seed Images → Create New), optionally fill Image Style Guidance, then open a saved post and click "Generate image (AI)".

## Self-Review

- **Spec coverage:** seedImages relationship (T5) ✓; imageStyleGuidance (T5) ✓; reuse social-assets (T4 store, T5 relationTo) ✓; every seed image both postable+reference (relationTo social-assets makes them selectable; refs loader uses them) ✓; gpt-image-1 edits with references + input_fidelity high (T2) ✓; on-demand per-post button (T5) ✓; text-only fallback when no seeds (T4) ✓; raw fetch no SDK (T2) ✓; env config (Global Constraints + T2/T3) ✓; schema via schema-preview + manual DDL (T6) ✓; payload-types hand-patch (T6) ✓; leave importMap/types uncommitted (Global + T5/T6) ✓; unit tests for prompt + client + refs (T1/T2/T3) ✓; route/UI verified by build (T4/T5) ✓.
- **Placeholder scan:** none — Step 2 of T6 intentionally defers to schema-preview output (correct: codegen is broken and exact types must come from the tool), with the expected statements documented.
- **Type consistency:** `buildImagePrompt(post, brand)` signature consistent T1↔T4; `editImage`/`generateImage` args/return (`Buffer`) consistent T2↔T4; `loadSeedImageFiles(payload, brand, opts)` returning `{buffer, filename, mimetype}` consistent T3↔T4; importMap key `/components/admin/GenerateImageButton#default` matches the SocialPosts field path `/components/admin/GenerateImageButton` (T5).
