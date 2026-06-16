# Revise-with-Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-post "Revise" action — type a note, pick Copy / Graphic / Both, and the AI rewrites those parts of the post in place (version history preserved).

**Architecture:** A pure revise prompt builder + response parser (`src/lib/social/revise.ts`) reuse the existing brand system prompt and graphic-field coercion; an orchestrator `reviseDraft` loads the post, calls Claude, re-checks guardrails, and updates only the targeted fields. An auth-gated route and an admin `ui` button drive it. No schema changes, no new deps.

**Tech Stack:** Next 15 route handlers, Payload CMS 3, the existing `callClaude` + `checkGuardrails` + `buildSystemPrompt`, `node:test` via `tsx`.

---

## File Structure

**New files**
- `src/lib/social/revise.ts` — `ReviseTarget`, `RevisePostState`, `buildRevisePrompt`, `parseRevision`, `reviseDraft`.
- `src/lib/social/revise.test.ts` — unit tests for the pure pieces.
- `src/app/api/social/revise/route.ts` — `POST` revise endpoint.
- `src/components/admin/ReviseDraftButton.tsx` — admin control.

**Modified files**
- `src/lib/social/generate.ts` — export `GRAPHIC_STYLES`, `GRAPHIC_KEYS`; extract + export `buildBrandConfig`; use it in `generateDrafts`.
- `src/lib/social/generate.test.ts` — add a `buildBrandConfig` test.
- `src/collections/SocialPosts.ts` — add the revise `ui` field.
- `src/app/(payload)/admin/importMap.js` — register `ReviseDraftButton`.

---

## Task 1: Extract `buildBrandConfig` + export graphic constants

**Files:**
- Modify: `src/lib/social/generate.ts`
- Test: `src/lib/social/generate.test.ts`

- [ ] **Step 1: Write the failing test** — append to `src/lib/social/generate.test.ts`:

```ts
import { buildBrandConfig } from './generate'

test('buildBrandConfig maps a brand doc to prompt config', () => {
  const cfg = buildBrandConfig({
    name: 'PS | RCM', voice: 'v', audience: 'a',
    themes: [{ theme: 'T', description: 'd' }],
    defaultCtas: [{ cta: 'Book' }, { cta: '' }],
    bannedTerms: [{ term: 'guaranteed' }],
    requiredDisclaimers: [{ text: 'D' }],
    seedExamples: [{ text: 'ex' }],
  })
  assert.equal(cfg.name, 'PS | RCM')
  assert.equal(cfg.voice, 'v')
  assert.deepEqual(cfg.themes, [{ theme: 'T', description: 'd' }])
  assert.deepEqual(cfg.defaultCtas, ['Book'])
  assert.deepEqual(cfg.bannedTerms, ['guaranteed'])
  assert.deepEqual(cfg.requiredDisclaimers, ['D'])
  assert.deepEqual(cfg.seedExamples, ['ex'])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/generate.test.ts`
Expected: FAIL — `buildBrandConfig` is not exported.

- [ ] **Step 3: Export the two graphic constants.** In `src/lib/social/generate.ts`, add `export` to the existing const declarations (currently `const GRAPHIC_STYLES` and `const GRAPHIC_KEYS`):

```ts
export const GRAPHIC_STYLES: GraphicStyle[] = ['none', 'hook', 'stat', 'dataviz']
export const GRAPHIC_KEYS: (keyof GraphicFields)[] = ['headline', 'subtext', 'statFrom', 'statTo', 'statLabel', 'caption']
```

- [ ] **Step 4: Add the exported `buildBrandConfig`.** In `src/lib/social/generate.ts`, add this function (place it just above `generateDrafts`):

```ts
/** Map a brand-profiles doc to the prompt config. Shared by generate + revise. */
export function buildBrandConfig(brand: Record<string, any>): BrandConfigForPrompt {
  const b = brand
  return {
    name: b.name,
    voice: b.voice,
    audience: b.audience,
    themes: (b.themes || []).map((t: any) => ({ theme: t.theme, description: t.description })),
    defaultCtas: (b.defaultCtas || []).map((c: any) => c.cta).filter(Boolean),
    bannedTerms: (b.bannedTerms || []).map((x: any) => x.term).filter(Boolean),
    requiredDisclaimers: (b.requiredDisclaimers || []).map((r: any) => r.text).filter(Boolean),
    seedExamples: (b.seedExamples || []).map((s: any) => s.text).filter(Boolean),
  }
}
```

- [ ] **Step 5: Use it in `generateDrafts`.** In `generateDrafts`, replace the inline block:

```ts
  const b = brand as Record<string, any>
  const brandConfig: BrandConfigForPrompt = {
    name: b.name,
    voice: b.voice,
    audience: b.audience,
    themes: (b.themes || []).map((t: any) => ({ theme: t.theme, description: t.description })),
    defaultCtas: (b.defaultCtas || []).map((c: any) => c.cta).filter(Boolean),
    bannedTerms: (b.bannedTerms || []).map((x: any) => x.term).filter(Boolean),
    requiredDisclaimers: (b.requiredDisclaimers || []).map((r: any) => r.text).filter(Boolean),
    seedExamples: (b.seedExamples || []).map((s: any) => s.text).filter(Boolean),
  }
```

with:

```ts
  const brandConfig = buildBrandConfig(brand as Record<string, any>)
```

- [ ] **Step 6: Run the full generator suite to verify nothing broke**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/generate.test.ts`
Expected: PASS (existing tests + the new `buildBrandConfig` test).

- [ ] **Step 7: Typecheck**

Run: `cd /home/bitnami/stack/excelent-site && npx tsc --noEmit 2>&1 | grep -E 'social/generate' || echo 'generate tsc clean'`
Expected: `generate tsc clean`.

- [ ] **Step 8: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/lib/social/generate.ts src/lib/social/generate.test.ts
git commit -m "refactor(social): extract buildBrandConfig; export graphic constants"
```

---

## Task 2: Revise prompt builder

**Files:**
- Create: `src/lib/social/revise.ts`
- Test: `src/lib/social/revise.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/social/revise.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRevisePrompt } from './revise'
import type { BrandConfigForPrompt } from './types'

const BRAND: BrandConfigForPrompt = {
  name: 'PS | RCM', voice: 'operator voice', audience: 'ENT owners',
  themes: [], defaultCtas: ['Request a Demo'], bannedTerms: ['guaranteed'],
  requiredDisclaimers: [], seedExamples: [],
}

test('buildRevisePrompt(copy) carries the note, current copy, and a copy-only JSON contract', () => {
  const { system, user } = buildRevisePrompt(BRAND, { copy: 'old copy', cta: 'Book' }, 'make it punchier', 'copy')
  assert.match(user, /make it punchier/)
  assert.match(user, /old copy/)
  assert.match(user, /"copy"/)
  assert.doesNotMatch(user, /graphicStyle/)
  assert.match(system, /BRAND VOICE/)
  assert.match(system, /guaranteed/)
})

test('buildRevisePrompt(graphic) asks for graphic JSON only', () => {
  const { user } = buildRevisePrompt(
    BRAND, { copy: 'c', graphicStyle: 'hook', graphic: { headline: 'h' } }, 'use the stat card', 'graphic')
  assert.match(user, /use the stat card/)
  assert.match(user, /graphicStyle/)
  assert.doesNotMatch(user, /"copy"/)
})

test('buildRevisePrompt(both) asks for copy and graphic', () => {
  const { user } = buildRevisePrompt(BRAND, { copy: 'c' }, 'tighten everything', 'both')
  assert.match(user, /"copy"/)
  assert.match(user, /graphicStyle/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts`
Expected: FAIL — cannot find module `./revise`.

- [ ] **Step 3: Implement the prompt builder in `src/lib/social/revise.ts`**:

```ts
import { buildSystemPrompt } from './prompt'
import type { BrandConfigForPrompt, GraphicFields, GraphicStyle } from './types'

export type ReviseTarget = 'copy' | 'graphic' | 'both'

export interface RevisePostState {
  copy: string
  cta?: string | null
  graphicStyle?: GraphicStyle | null
  graphic?: GraphicFields | null
}

const COPY_CONTRACT =
  '\nRewrite ONLY the post copy per the feedback; keep it on-brand. Return ONLY JSON: ' +
  '{"copy":"<new post text>","cta":"<the call to action you used>"}. No prose, no markdown code fences.'

const GRAPHIC_CONTRACT =
  '\nRewrite ONLY the graphic per the feedback. Choose a graphicStyle (hook|stat|dataviz) and fill the ' +
  'graphic fields it needs. Return ONLY JSON: {"graphicStyle":"hook|stat|dataviz",' +
  '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":""}}. ' +
  'Include only the keys the chosen style needs. No prose, no markdown code fences.'

const BOTH_CONTRACT =
  '\nRewrite BOTH the post copy and the graphic per the feedback. Return ONLY JSON: ' +
  '{"copy":"...","cta":"...","graphicStyle":"hook|stat|dataviz","graphic":{...}}. ' +
  'No prose, no markdown code fences.'

export function buildRevisePrompt(
  brand: BrandConfigForPrompt,
  post: RevisePostState,
  note: string,
  target: ReviseTarget,
): { system: string; user: string } {
  const system = buildSystemPrompt(brand)
  const lines: string[] = []
  lines.push('Revise an existing social media post based on reviewer feedback.')
  lines.push(`\nREVIEWER FEEDBACK:\n${note}`)
  lines.push('\nCURRENT POST:')
  lines.push(`copy: ${post.copy}`)
  if (post.cta) lines.push(`cta: ${post.cta}`)
  if (post.graphicStyle) lines.push(`graphicStyle: ${post.graphicStyle}`)
  if (post.graphic) lines.push(`graphic: ${JSON.stringify(post.graphic)}`)
  lines.push('\nUse ONLY numbers and facts already present in the brand voice/themes — never invent figures.')
  lines.push(target === 'copy' ? COPY_CONTRACT : target === 'graphic' ? GRAPHIC_CONTRACT : BOTH_CONTRACT)
  return { system, user: lines.join('\n') }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/lib/social/revise.ts src/lib/social/revise.test.ts
git commit -m "feat(social): revise prompt builder"
```

---

## Task 3: Revision response parser

**Files:**
- Modify: `src/lib/social/revise.ts`
- Test: `src/lib/social/revise.test.ts`

- [ ] **Step 1: Write the failing test** — append to `src/lib/social/revise.test.ts`:

```ts
import { parseRevision } from './revise'

test('parseRevision(copy) returns only copy/cta', () => {
  const out = parseRevision('{"copy":"new","cta":"Book","graphicStyle":"stat"}', 'copy')
  assert.deepEqual(out, { copy: 'new', cta: 'Book' })
})

test('parseRevision(graphic) returns only graphic fields and coerces unknown style', () => {
  const out = parseRevision('{"graphicStyle":"banana","graphic":{"statFrom":"9%","headline":""}}', 'graphic')
  assert.equal(out.graphicStyle, 'hook')
  assert.deepEqual(out.graphic, { statFrom: '9%' })
  assert.equal(out.copy, undefined)
})

test('parseRevision(both) returns copy and graphic, tolerating fences/prose', () => {
  const out = parseRevision('Sure:\n```json\n{"copy":"c","cta":"Book","graphicStyle":"stat","graphic":{"statTo":"2%"}}\n```', 'both')
  assert.equal(out.copy, 'c')
  assert.equal(out.graphicStyle, 'stat')
  assert.deepEqual(out.graphic, { statTo: '2%' })
})

test('parseRevision throws when there is no object', () => {
  assert.throws(() => parseRevision('the model refused', 'copy'))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts`
Expected: FAIL — `parseRevision` is not exported.

- [ ] **Step 3: Implement the parser in `src/lib/social/revise.ts`** (add these imports at the top alongside the existing ones, then append the functions):

```ts
import { GRAPHIC_STYLES, GRAPHIC_KEYS } from './generate'
```

```ts
export interface RevisionResult {
  copy?: string
  cta?: string
  graphicStyle?: GraphicStyle
  graphic?: GraphicFields
}

/** Extract the first balanced {...} JSON object, tolerating fences/prose. */
function extractObject(text: string): Record<string, unknown> {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object in model output')
  let depth = 0
  let inString = false
  let escaped = false
  let end = -1
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end === -1) throw new Error('No JSON object in model output')
  const obj = JSON.parse(text.slice(start, end + 1))
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Model output was not an object')
  return obj as Record<string, unknown>
}

/** Parse a revision response, keeping only the fields valid for `target`. */
export function parseRevision(text: string, target: ReviseTarget): RevisionResult {
  const obj = extractObject(text)
  const out: RevisionResult = {}
  if (target === 'copy' || target === 'both') {
    if (typeof obj.copy === 'string') out.copy = obj.copy.trim()
    if (obj.cta != null && obj.cta !== '') out.cta = String(obj.cta).trim()
  }
  if (target === 'graphic' || target === 'both') {
    const rawStyle = String(obj.graphicStyle || '')
    if (rawStyle) out.graphicStyle = (GRAPHIC_STYLES.includes(rawStyle as GraphicStyle) ? rawStyle : 'hook') as GraphicStyle
    const g = (obj.graphic || {}) as Record<string, unknown>
    const graphic: GraphicFields = {}
    for (const k of GRAPHIC_KEYS) if (g[k] != null && g[k] !== '') graphic[k] = String(g[k]).trim()
    if (Object.keys(graphic).length || out.graphicStyle) out.graphic = graphic
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts`
Expected: PASS (3 from Task 2 + 4 new = 7).

- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/lib/social/revise.ts src/lib/social/revise.test.ts
git commit -m "feat(social): revision response parser"
```

---

## Task 4: `reviseDraft` orchestrator

**Files:**
- Modify: `src/lib/social/revise.ts`

Verified manually (matches how `generateDrafts` is structured — the pure pieces carry the tests).

- [ ] **Step 1: Add the orchestrator to `src/lib/social/revise.ts`** (add these imports at the top alongside the existing ones, then append the function):

```ts
import { getPayloadClient } from '@/lib/payload'
import { callClaude } from './claude'
import { checkGuardrails } from './guardrails'
import { buildBrandConfig } from './generate'
```

```ts
/** Rewrite a post's copy and/or graphic in place from a reviewer note. */
export async function reviseDraft(
  postId: string | number,
  opts: { note: string; target: ReviseTarget },
): Promise<void> {
  const payload = await getPayloadClient()
  const post = await payload.findByID({ collection: 'social-posts', id: postId, depth: 1 })
  if (!post) throw new Error(`Post ${postId} not found`)
  const p = post as Record<string, any>

  const brandConfig = buildBrandConfig(p.brand as Record<string, any>)
  const { system, user } = buildRevisePrompt(
    brandConfig,
    { copy: p.copy, cta: p.cta, graphicStyle: p.graphicStyle, graphic: p.graphic },
    opts.note,
    opts.target,
  )
  const { text } = await callClaude(system, user)
  const rev = parseRevision(text, opts.target)

  const data: Record<string, any> = { status: 'draft' }
  if (rev.copy !== undefined) {
    data.copy = rev.copy
    if (rev.cta !== undefined) data.cta = rev.cta
    const g = checkGuardrails(rev.copy, brandConfig.bannedTerms, brandConfig.requiredDisclaimers)
    data.generationMeta = {
      ...(p.generationMeta || {}),
      guardrailFlags: g.ok
        ? ''
        : `banned: ${g.bannedHits.join(', ')}; missing disclaimers: ${g.missingDisclaimers.join(' | ')}`,
    }
  }
  if (rev.graphicStyle !== undefined) data.graphicStyle = rev.graphicStyle
  if (rev.graphic !== undefined) data.graphic = rev.graphic

  await payload.update({ collection: 'social-posts', id: postId, data })
}
```

- [ ] **Step 2: Typecheck the module**

Run: `cd /home/bitnami/stack/excelent-site && npx tsc --noEmit 2>&1 | grep -E 'social/revise' || echo 'revise tsc clean'`
Expected: `revise tsc clean`.

- [ ] **Step 3: Re-run the revise tests (still green; orchestrator added below the pure pieces)**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts`
Expected: PASS (7).

- [ ] **Step 4: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/lib/social/revise.ts
git commit -m "feat(social): reviseDraft orchestrator (in-place, guardrail-checked)"
```

---

## Task 5: Revise route

**Files:**
- Create: `src/app/api/social/revise/route.ts`

- [ ] **Step 1: Implement `src/app/api/social/revise/route.ts`** (mirrors `src/app/api/social/generate/route.ts`):

```ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reviseDraft, type ReviseTarget } from '@/lib/social/revise'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TARGETS: ReviseTarget[] = ['copy', 'graphic', 'both']

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number; note?: string; target?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })
  const note = String(body.note || '').trim()
  if (!note) return NextResponse.json({ error: 'missing note' }, { status: 400 })
  const target = (TARGETS.includes(body.target as ReviseTarget) ? body.target : 'both') as ReviseTarget

  try {
    await reviseDraft(body.postId, { note, target })
    return NextResponse.json({ ok: true })
  } catch (err) {
    payload.logger.error({ err }, 'social revise failed')
    return NextResponse.json({ error: 'revise failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /home/bitnami/stack/excelent-site && npx tsc --noEmit 2>&1 | grep -E 'social/revise' || echo 'revise route tsc clean'`
Expected: `revise route tsc clean`.

- [ ] **Step 3: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/app/api/social/revise/route.ts
git commit -m "feat(social): revise route"
```

---

## Task 6: Admin revise control + wiring

**Files:**
- Create: `src/components/admin/ReviseDraftButton.tsx`
- Modify: `src/collections/SocialPosts.ts`
- Modify: `src/app/(payload)/admin/importMap.js`

- [ ] **Step 1: Implement `src/components/admin/ReviseDraftButton.tsx`** (mirrors `GenerateDraftsButton.tsx`):

```tsx
'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function ReviseDraftButton() {
  const { id } = useDocumentInfo()
  const [note, setNote] = useState('')
  const [target, setTarget] = useState('both')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the draft first, then revise it.</p>

  const run = async () => {
    if (!note.trim()) { setMsg('Add a revision note first.'); return }
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/revise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: id, note, target }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg('Revised. Reloading…')
      window.location.reload()
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
      setBusy(false)
    }
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, marginTop: 12 }}>
      <strong style={{ color: '#89007a' }}>Revise with feedback</strong>
      <textarea
        placeholder="What should change? e.g. 'tighten the hook' or 'use the stat card instead'"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        style={{ width: '100%', marginTop: 8, padding: 8, boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13 }}>Apply to:</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="copy">Copy</option>
          <option value="graphic">Graphic</option>
          <option value="both">Both</option>
        </select>
        <button type="button" onClick={run} disabled={busy}>
          {busy ? 'Revising…' : 'Revise'}
        </button>
      </div>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Add the `ui` field to `src/collections/SocialPosts.ts`.** Insert immediately AFTER the existing `reviewerFeedback` field object (the one whose `name: 'reviewerFeedback'`) and before `generationMeta`:

```ts
    {
      name: 'revise',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ReviseDraftButton' } },
    },
```

- [ ] **Step 3: Register the component in `src/app/(payload)/admin/importMap.js`.** Add the import line next to the existing `PostPreview` import:

```js
import { default as default_reviseDraft_c3d4e5f6 } from '../../../components/admin/ReviseDraftButton'
```

And add the map entry next to the existing `PostPreview` map entry inside `export const importMap = {`:

```js
  "/components/admin/ReviseDraftButton#default": default_reviseDraft_c3d4e5f6,
```

- [ ] **Step 4: Typecheck**

Run: `cd /home/bitnami/stack/excelent-site && npx tsc --noEmit 2>&1 | grep -E 'ReviseDraftButton|SocialPosts' || echo 'admin tsc clean'`
Expected: `admin tsc clean`.

- [ ] **Step 5: Commit**

```bash
cd /home/bitnami/stack/excelent-site
git add src/components/admin/ReviseDraftButton.tsx src/collections/SocialPosts.ts "src/app/(payload)/admin/importMap.js"
git commit -m "feat(social): admin revise-with-feedback control"
```

---

## Task 7: Build, restart, verify

**Files:** none (ops)

- [ ] **Step 1: Run the social test suite**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/revise.test.ts src/lib/social/generate.test.ts src/lib/social/prompt.test.ts src/lib/social/graphics/*.test.ts`
Expected: all PASS.

- [ ] **Step 2: Build**

Run: `cd /home/bitnami/stack/excelent-site && npm run build`
Expected: success; `/api/social/revise` appears in the route list. If Payload reports a missing importMap entry for `/components/admin/ReviseDraftButton`, recheck Task 6 Step 3.

- [ ] **Step 3: Restart**

Run: `pm2 restart excelent-site && pm2 status excelent-site`
Expected: `excelent-site` online.

- [ ] **Step 4: Verify the route is auth-gated**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/social/revise -H 'content-type: application/json' -d '{"postId":12,"note":"x","target":"copy"}'`
Expected: `401` (no auth cookie).

- [ ] **Step 5: Manual end-to-end check (billable Claude call)**

In the admin, open draft #12 → "Revise with feedback" → note "make the hook punchier and shorter", Apply to: **Copy** → Revise. Confirm the page reloads with rewritten copy, `status` back to Draft, and the preview unchanged graphic. Then try Apply to: **Graphic** with "use the data-viz chart" and confirm `graphicStyle`/`graphic` update and the preview graphic changes. Confirm the version history (sidebar) shows the prior versions.

- [ ] **Step 6: Update docs**

Append a short "Revise with feedback (built 2026-06-16)" subsection to `docs/social-agent-phase-a.md` describing the route, the Copy/Graphic/Both targets, in-place overwrite + version history, and that it reuses the brand voice + guardrail check. Commit `docs/social-agent-phase-a.md` by explicit path.

```bash
cd /home/bitnami/stack/excelent-site
git add docs/social-agent-phase-a.md
git commit -m "docs(social): document revise-with-feedback"
```

---

## Self-Review Notes

- **Spec coverage:** brand-config refactor (Task 1) · revise prompt (Task 2) · parser (Task 3) · orchestrator with in-place update + guardrail re-check + status→draft (Task 4) · route (Task 5) · admin Copy/Graphic/Both control + wiring (Task 6) · build/verify + docs (Task 7). All spec sections map to a task.
- **No schema change / no new deps:** revise writes only existing fields; reuses `callClaude`/`checkGuardrails`/`buildSystemPrompt`.
- **Type consistency:** `ReviseTarget`, `RevisePostState`, `RevisionResult`, `buildRevisePrompt`, `parseRevision`, `reviseDraft`, `buildBrandConfig`, `GRAPHIC_STYLES`, `GRAPHIC_KEYS` are used identically across tasks and the route.
- **`originalCopy` preserved** on revision so the batch edit-corpus still anchors to the first generation.
