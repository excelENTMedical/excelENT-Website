# ExcelENT Social Agent — Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the drafts-and-approval half of the social agent — four config-driven brand profiles, a curated asset library, AI draft generation, and a human review/approve/edit/feedback loop — entirely inside the existing Payload CMS, with no publishing and no external platform access.

**Architecture:** Three new Payload collections (`brand-profiles`, `social-assets`, `social-posts`) plus a small pure-logic generation engine under `src/lib/social/`. A "Generate drafts" admin button (and a matching auth-guarded API route) builds a Claude prompt from a brand profile + a few-shot corpus drawn from that brand's own approved/edited/rejected posts, calls the Anthropic Messages API over `fetch`, runs healthcare guardrails, and saves drafts. Reviewers work natively in the Payload admin; every approve/edit/reject feeds the next generation. No publishing component exists in Phase A.

**Tech Stack:** Next.js 15, Payload CMS 3, PostgreSQL 15 (adapter runs with `push: true`, so schema auto-syncs — no migrations), Anthropic Messages API via `fetch` (no SDK), tests via Node's built-in `node:test` run through `tsx` (no new dependency).

---

## Conventions for this plan

- **Branch:** Do all work on `feat/social-agent-phase-a`. Create it before Task 1 (`git checkout -b feat/social-agent-phase-a`).
- **Test command (verified working):** `node --import tsx --test <path/to/file.test.ts>`. This runs `.ts` tests with no build step and no new package.
- **TDD scope:** The three pure-logic modules (`guardrails`, `corpus`, `prompt`) are built test-first with real `node:test` tests. Collections, the Claude `fetch` wrapper, the orchestrator, the API route, and the admin button are config/integration code with no unit-test harness in this repo; they are verified with `npx tsc --noEmit`, `payload generate:types`, and explicit manual smoke commands. This mirrors the existing codebase, which has no test framework.
- **Type-check command:** `npx tsc --noEmit` (the repo's tsconfig has `noEmit: true`).
- **Commit after every task.** Conventional-commit messages. End each commit body with the Co-Authored-By line the repo uses.

---

### Task 1: Test harness, npm script, and environment wiring

**Files:**
- Modify: `package.json` (add a `test` script)
- Modify: `.env` (add `ANTHROPIC_API_KEY`, `SOCIAL_MODEL`)
- Create: `src/lib/social/smoke.test.ts` (temporary harness proof — deleted in this task's last step)

- [ ] **Step 1: Write a throwaway failing test to prove the runner**

Create `src/lib/social/smoke.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('runner is wired', () => {
  assert.equal(1 + 1, 2)
})
```

- [ ] **Step 2: Run it**

Run: `node --import tsx --test src/lib/social/smoke.test.ts`
Expected: TAP output ending in `# pass 1` and `# fail 0`.

- [ ] **Step 3: Add the `test` script to package.json**

In `package.json` `"scripts"`, add after `"generate:types"`:

```json
    "test": "node --import tsx --test \"src/**/*.test.ts\""
```

(The quotes let Node 20 receive the glob; the shell will also expand it on Linux. If `src/**/*.test.ts` does not expand on the execution shell, run individual files as the tasks below specify.)

- [ ] **Step 4: Add environment variables**

Append to `.env`:

```
# Social agent (Phase A) — Claude generation
ANTHROPIC_API_KEY=
# Generation model. Sonnet is the cost-sensible default for short social copy;
# set to claude-opus-4-8 for maximum quality.
SOCIAL_MODEL=claude-sonnet-4-6
```

Then set a real key value in `ANTHROPIC_API_KEY` (ask the user for it; do not commit the populated value — `.env` is gitignored, confirm with `git check-ignore .env`).

- [ ] **Step 5: Delete the throwaway test**

Run: `rm src/lib/social/smoke.test.ts`

- [ ] **Step 6: Commit**

```bash
git add package.json
git commit -m "chore: add node:test script and social-agent env keys

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Shared types

**Files:**
- Create: `src/lib/social/types.ts`

- [ ] **Step 1: Write the types module**

Create `src/lib/social/types.ts`:

```ts
export type ReviewStatus = 'draft' | 'needs-changes' | 'approved' | 'rejected'
export type Platform = 'linkedin' | 'facebook' | 'instagram'
export type Language = 'en' | 'es'

/** A prior post used to teach the next generation. */
export interface CorpusPost {
  copy: string
  cta?: string | null
  status: ReviewStatus
  reviewerFeedback?: string | null
  /** Copy exactly as the model generated it, before any human edit. */
  originalCopy?: string | null
  theme?: string | null
  updatedAt?: string
}

export interface FewShotCorpus {
  /** Exemplar copy to imitate. */
  approved: string[]
  /** Human-corrected pairs: the reviewer turned `before` into `after`. */
  edited: { before: string; after: string }[]
  /** What to avoid, with the reviewer's stated reason. */
  rejections: { copy: string; reason: string }[]
}

export interface BrandConfigForPrompt {
  name: string
  voice: string
  audience?: string | null
  themes: { theme: string; description?: string | null }[]
  defaultCtas: string[]
  bannedTerms: string[]
  requiredDisclaimers: string[]
  seedExamples: string[]
}

export interface GenerateOptions {
  theme: string
  platform: Platform
  language: Language
  count: number
}

export interface GuardrailResult {
  ok: boolean
  bannedHits: string[]
  missingDisclaimers: string[]
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/social/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/social/types.ts
git commit -m "feat: social agent shared types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Guardrails (TDD)

Pure function that flags banned terms and missing required disclaimers in generated copy. Healthcare safety net.

**Files:**
- Create: `src/lib/social/guardrails.ts`
- Test: `src/lib/social/guardrails.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/social/guardrails.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkGuardrails } from './guardrails'

test('clean copy with no rules passes', () => {
  const r = checkGuardrails('Helping ENTs run a better practice.', [], [])
  assert.deepEqual(r, { ok: true, bannedHits: [], missingDisclaimers: [] })
})

test('flags a banned term case-insensitively', () => {
  const r = checkGuardrails('Guaranteed CURE for sinusitis!', ['cure', 'guarantee'], [])
  assert.equal(r.ok, false)
  assert.deepEqual(r.bannedHits.sort(), ['cure', 'guarantee'])
})

test('flags a missing required disclaimer', () => {
  const r = checkGuardrails('Book your visit today.', [], ['Not medical advice.'])
  assert.equal(r.ok, false)
  assert.deepEqual(r.missingDisclaimers, ['Not medical advice.'])
})

test('passes when the required disclaimer is present (whitespace/case tolerant)', () => {
  const r = checkGuardrails('Book today.   not   MEDICAL   advice.', [], ['Not medical advice.'])
  assert.equal(r.ok, true)
  assert.deepEqual(r.missingDisclaimers, [])
})

test('ignores empty/whitespace rule entries', () => {
  const r = checkGuardrails('Anything goes.', ['', '   '], ['', '  '])
  assert.equal(r.ok, true)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/social/guardrails.test.ts`
Expected: FAIL — cannot find module `./guardrails` / `checkGuardrails` is not a function.

- [ ] **Step 3: Write the implementation**

Create `src/lib/social/guardrails.ts`:

```ts
import type { GuardrailResult } from './types'

/** Lowercase + collapse whitespace so matches survive formatting noise. */
export const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function checkGuardrails(
  copy: string,
  bannedTerms: string[],
  requiredDisclaimers: string[],
): GuardrailResult {
  const haystack = norm(copy)

  const bannedHits = bannedTerms
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .filter((t) => haystack.includes(norm(t)))

  const missingDisclaimers = requiredDisclaimers
    .map((d) => d.trim())
    .filter((d) => d.length > 0)
    .filter((d) => !haystack.includes(norm(d)))

  return {
    ok: bannedHits.length === 0 && missingDisclaimers.length === 0,
    bannedHits,
    missingDisclaimers,
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --import tsx --test src/lib/social/guardrails.test.ts`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/guardrails.ts src/lib/social/guardrails.test.ts
git commit -m "feat: social agent guardrail checks (banned terms, required disclaimers)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Few-shot corpus selector (TDD)

Pure function that turns a brand's recent posts into the learning signal: approved exemplars, human-edit pairs, and rejection reasons.

**Files:**
- Create: `src/lib/social/corpus.ts`
- Test: `src/lib/social/corpus.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/social/corpus.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCorpus } from './corpus'
import type { CorpusPost } from './types'

const post = (p: Partial<CorpusPost>): CorpusPost => ({
  copy: 'x',
  status: 'draft',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...p,
})

test('collects approved copy as exemplars', () => {
  const c = buildCorpus([
    post({ copy: 'good one', status: 'approved' }),
    post({ copy: 'still a draft', status: 'draft' }),
  ])
  assert.deepEqual(c.approved, ['good one'])
})

test('detects a human edit when final copy differs from generated', () => {
  const c = buildCorpus([
    post({ copy: 'final edited text', originalCopy: 'raw model text', status: 'approved' }),
  ])
  assert.equal(c.edited.length, 1)
  assert.deepEqual(c.edited[0], { before: 'raw model text', after: 'final edited text' })
})

test('does not treat an unchanged approved post as an edit', () => {
  const c = buildCorpus([
    post({ copy: 'same', originalCopy: 'same', status: 'approved' }),
  ])
  assert.equal(c.edited.length, 0)
})

test('collects rejections/needs-changes that have feedback', () => {
  const c = buildCorpus([
    post({ copy: 'bad', status: 'rejected', reviewerFeedback: 'too salesy' }),
    post({ copy: 'meh', status: 'needs-changes', reviewerFeedback: 'tighten it' }),
    post({ copy: 'no reason', status: 'rejected', reviewerFeedback: '' }),
  ])
  assert.deepEqual(c.rejections, [
    { copy: 'bad', reason: 'too salesy' },
    { copy: 'meh', reason: 'tighten it' },
  ])
})

test('respects the max caps and prefers newest', () => {
  const many: CorpusPost[] = Array.from({ length: 10 }, (_, i) =>
    post({ copy: `a${i}`, status: 'approved', updatedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
  )
  const c = buildCorpus(many, { maxApproved: 3 })
  assert.equal(c.approved.length, 3)
  assert.equal(c.approved[0], 'a9') // newest first
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/social/corpus.test.ts`
Expected: FAIL — cannot find module `./corpus`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/social/corpus.ts`:

```ts
import type { CorpusPost, FewShotCorpus } from './types'
import { norm } from './guardrails'

interface BuildCorpusOpts {
  maxApproved?: number
  maxEdited?: number
  maxRejections?: number
}

const byNewest = (a: CorpusPost, b: CorpusPost): number =>
  (b.updatedAt || '').localeCompare(a.updatedAt || '')

export function buildCorpus(posts: CorpusPost[], opts: BuildCorpusOpts = {}): FewShotCorpus {
  const { maxApproved = 6, maxEdited = 4, maxRejections = 4 } = opts
  const sorted = [...posts].sort(byNewest)

  const approvedPosts = sorted.filter((p) => p.status === 'approved')

  const edited = approvedPosts
    .filter((p) => p.originalCopy && norm(p.originalCopy) !== norm(p.copy))
    .slice(0, maxEdited)
    .map((p) => ({ before: p.originalCopy as string, after: p.copy }))

  const approved = approvedPosts.slice(0, maxApproved).map((p) => p.copy)

  const rejections = sorted
    .filter(
      (p) =>
        (p.status === 'rejected' || p.status === 'needs-changes') &&
        !!p.reviewerFeedback &&
        p.reviewerFeedback.trim().length > 0,
    )
    .slice(0, maxRejections)
    .map((p) => ({ copy: p.copy, reason: (p.reviewerFeedback as string).trim() }))

  return { approved, edited, rejections }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --import tsx --test src/lib/social/corpus.test.ts`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/corpus.ts src/lib/social/corpus.test.ts
git commit -m "feat: few-shot corpus selector from approved/edited/rejected posts

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Prompt builder (TDD)

Pure functions that assemble the system and user prompts from a brand config, the corpus, and the generation options.

**Files:**
- Create: `src/lib/social/prompt.ts`
- Test: `src/lib/social/prompt.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/social/prompt.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from './prompt'
import type { BrandConfigForPrompt, FewShotCorpus, GenerateOptions } from './types'

const brand: BrandConfigForPrompt = {
  name: 'PS | RCM',
  voice: 'Confident, plain-spoken, never hypey.',
  audience: 'ENT practice administrators.',
  themes: [{ theme: 'Denials', description: 'Reducing claim denials' }],
  defaultCtas: ['Book a demo'],
  bannedTerms: ['guarantee'],
  requiredDisclaimers: ['Results vary by practice.'],
  seedExamples: ['Denials quietly drain revenue. Here is how to stop them.'],
}

const emptyCorpus: FewShotCorpus = { approved: [], edited: [], rejections: [] }
const opts: GenerateOptions = { theme: 'Denials', platform: 'linkedin', language: 'en', count: 2 }

test('system prompt includes voice, banned terms, and disclaimers', () => {
  const s = buildSystemPrompt(brand)
  assert.match(s, /Confident, plain-spoken/)
  assert.match(s, /guarantee/)
  assert.match(s, /Results vary by practice\./)
  assert.match(s, /healthcare/i)
})

test('user prompt renders count, language, theme description, and platform rules', () => {
  const u = buildUserPrompt(brand, emptyCorpus, opts)
  assert.match(u, /2 distinct social media post/)
  assert.match(u, /English/)
  assert.match(u, /Reducing claim denials/)
  assert.match(u, /LinkedIn/)
  assert.match(u, /JSON array/)
})

test('user prompt omits corpus sections when empty', () => {
  const u = buildUserPrompt(brand, emptyCorpus, opts)
  assert.doesNotMatch(u, /APPROVED/)
  assert.doesNotMatch(u, /REJECTED/)
  assert.doesNotMatch(u, /HUMAN EDITS/)
})

test('user prompt includes corpus sections when present', () => {
  const corpus: FewShotCorpus = {
    approved: ['nice post'],
    edited: [{ before: 'raw', after: 'polished' }],
    rejections: [{ copy: 'bad', reason: 'too salesy' }],
  }
  const u = buildUserPrompt(brand, corpus, opts)
  assert.match(u, /nice post/)
  assert.match(u, /raw/)
  assert.match(u, /polished/)
  assert.match(u, /too salesy/)
})

test('exposes a prompt version string', () => {
  assert.equal(typeof PROMPT_VERSION, 'string')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --import tsx --test src/lib/social/prompt.test.ts`
Expected: FAIL — cannot find module `./prompt`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/social/prompt.ts`:

```ts
import type { BrandConfigForPrompt, FewShotCorpus, GenerateOptions, Platform } from './types'

export const PROMPT_VERSION = 'v1'

const PLATFORM_GUIDE: Record<Platform, string> = {
  linkedin:
    'LinkedIn: professional tone, 1–3 short paragraphs, up to ~1300 characters, 3–5 relevant hashtags at the end. No clickbait.',
  facebook:
    'Facebook: warm and conversational, 1–2 short paragraphs, under ~500 characters, at most 2 hashtags.',
  instagram:
    'Instagram: a punchy first line as the hook, short lines, an emoji or two is fine, 5–10 hashtags grouped at the end.',
}

export function buildSystemPrompt(brand: BrandConfigForPrompt): string {
  const lines: string[] = []
  lines.push(`You are the social-media copywriter for ${brand.name}, a healthcare brand.`)
  lines.push(`\nBRAND VOICE:\n${brand.voice}`)
  if (brand.audience) lines.push(`\nTARGET AUDIENCE:\n${brand.audience}`)
  if (brand.seedExamples.length) {
    lines.push('\nREFERENCE POSTS THAT CAPTURE THE BRAND STYLE:')
    brand.seedExamples.forEach((ex, i) => lines.push(`${i + 1}. ${ex}`))
  }
  if (brand.bannedTerms.length) {
    lines.push(`\nNEVER use these words or phrases: ${brand.bannedTerms.join(', ')}.`)
  }
  if (brand.requiredDisclaimers.length) {
    lines.push('\nEVERY post MUST include this disclaimer text verbatim:')
    brand.requiredDisclaimers.forEach((d) => lines.push(`"${d}"`))
  }
  lines.push(
    '\nThis is healthcare marketing. Do not make medical claims, guarantee outcomes, or give individual medical advice.',
  )
  return lines.join('\n')
}

export function buildUserPrompt(
  brand: BrandConfigForPrompt,
  corpus: FewShotCorpus,
  opts: GenerateOptions,
): string {
  const lines: string[] = []
  const themeDesc = brand.themes.find((t) => t.theme === opts.theme)?.description
  const langName = opts.language === 'es' ? 'Spanish' : 'English'

  lines.push(`Write ${opts.count} distinct social media post(s) in ${langName}.`)
  lines.push(`\nTHEME: ${opts.theme}${themeDesc ? ` — ${themeDesc}` : ''}`)
  lines.push(`\nPLATFORM RULES — ${PLATFORM_GUIDE[opts.platform]}`)

  if (brand.defaultCtas.length) {
    lines.push(
      `\nEnd each post with one of these calls to action (or a close variant): ${brand.defaultCtas.join(' | ')}`,
    )
  }
  if (corpus.approved.length) {
    lines.push('\nPOSTS THAT WERE APPROVED — match this quality and tone:')
    corpus.approved.forEach((c, i) => lines.push(`[A${i + 1}] ${c}`))
  }
  if (corpus.edited.length) {
    lines.push('\nHUMAN EDITS — the reviewer changed the first version into the second. Learn the preference:')
    corpus.edited.forEach((e, i) => {
      lines.push(`[E${i + 1}] BEFORE: ${e.before}`)
      lines.push(`[E${i + 1}] AFTER:  ${e.after}`)
    })
  }
  if (corpus.rejections.length) {
    lines.push('\nPOSTS THAT WERE REJECTED — do not repeat these mistakes:')
    corpus.rejections.forEach((r, i) => lines.push(`[R${i + 1}] "${r.copy}" — reason: ${r.reason}`))
  }

  lines.push(
    '\nReturn ONLY a JSON array. Each element must be an object: {"copy": "<post text>", "cta": "<the call to action you used>"}. No prose, no markdown code fences.',
  )
  return lines.join('\n')
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --import tsx --test src/lib/social/prompt.test.ts`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/prompt.ts src/lib/social/prompt.test.ts
git commit -m "feat: social agent prompt builder with few-shot learning sections

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Claude API wrapper (fetch, no SDK)

**Files:**
- Create: `src/lib/social/claude.ts`

- [ ] **Step 1: Write the implementation**

Create `src/lib/social/claude.ts`:

```ts
const API_URL = 'https://api.anthropic.com/v1/messages'

export interface ClaudeResult {
  text: string
}

/** Minimal call to the Anthropic Messages API. No SDK — keeps the box lean. */
export async function callClaude(
  system: string,
  userMessage: string,
  opts: { model?: string; maxTokens?: number } = {},
): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model || process.env.SOCIAL_MODEL || 'claude-sonnet-4-6',
      max_tokens: opts.maxTokens ?? 2000,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Claude API ${res.status}: ${detail}`)
  }

  const data = (await res.json()) as { content?: Array<{ text?: string }> }
  const text = (data?.content?.[0]?.text ?? '').trim()
  return { text }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/social/claude.ts`.

- [ ] **Step 3: Live smoke (optional but recommended — requires a real API key in `.env`)**

Run:
```bash
node --import tsx -e "import('./src/lib/social/claude.ts').then(async m => { const r = await m.callClaude('You are terse.', 'Reply with the single word OK.'); console.log(JSON.stringify(r)) })"
```
Expected: `{"text":"OK"}` (or similar). If `ANTHROPIC_API_KEY` is unset, expect the thrown "ANTHROPIC_API_KEY is not set" — set the key and retry.

- [ ] **Step 4: Commit**

```bash
git add src/lib/social/claude.ts
git commit -m "feat: minimal Anthropic Messages API wrapper over fetch

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Brand Profiles collection

One editable record per product (PS | RCM, PS | Lexi, PS | Connect, excelENT Patient-Facing). Holds everything the generator reads.

**Files:**
- Create: `src/collections/BrandProfiles.ts`

- [ ] **Step 1: Write the collection**

Create `src/collections/BrandProfiles.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const BrandProfiles: CollectionConfig = {
  slug: 'brand-profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active'],
    description: 'One editable "agent" per product: voice, audience, themes, CTAs, and guardrails.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "PS | RCM"' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Lowercase id, e.g. "ps-rcm". Used by the generator.' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'voice',
      type: 'textarea',
      required: true,
      admin: { description: 'Voice and tone guidance the writer must follow.' },
    },
    { name: 'audience', type: 'textarea', admin: { description: 'Who these posts are for.' } },
    {
      name: 'themes',
      type: 'array',
      labels: { singular: 'Theme', plural: 'Themes' },
      admin: { description: 'Content pillars the generator can write about.' },
      fields: [
        { name: 'theme', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'defaultCtas',
      type: 'array',
      labels: { singular: 'CTA', plural: 'CTAs' },
      fields: [{ name: 'cta', type: 'text', required: true }],
    },
    {
      name: 'platforms',
      type: 'select',
      hasMany: true,
      defaultValue: ['linkedin'],
      options: [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
      ],
    },
    {
      name: 'cadence',
      type: 'text',
      admin: { description: 'Free text for now, e.g. "3 posts/week". Guidance only in Phase A.' },
    },
    {
      name: 'bannedTerms',
      type: 'array',
      labels: { singular: 'Banned term', plural: 'Banned terms' },
      admin: { description: 'Words/phrases that must never appear. Compliance guardrail.' },
      fields: [{ name: 'term', type: 'text', required: true }],
    },
    {
      name: 'requiredDisclaimers',
      type: 'array',
      labels: { singular: 'Required disclaimer', plural: 'Required disclaimers' },
      admin: { description: 'Text that must appear verbatim in every post.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'seedExamples',
      type: 'array',
      labels: { singular: 'Seed example', plural: 'Seed examples' },
      admin: { description: 'A few example posts that anchor the brand style.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
  ],
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `BrandProfiles.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/collections/BrandProfiles.ts
git commit -m "feat: BrandProfiles collection (per-product agent config)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Social Assets collection

Curated, approved image library, tagged by brand and theme. A `source` field leaves a clean seam for AI-generated assets later (Phase C), with no schema change required.

**Files:**
- Create: `src/collections/SocialAssets.ts`

- [ ] **Step 1: Write the collection**

Create `src/collections/SocialAssets.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const SocialAssets: CollectionConfig = {
  slug: 'social-assets',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'brand', 'source'],
    description: 'Approved images for social posts, tagged by brand and theme.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: '../public/social-assets',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'preview', width: 1200, height: 1200, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Accessibility text / internal label.' } },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brand-profiles',
      admin: { description: 'Leave empty to make the asset usable by any brand.' },
    },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      admin: { description: 'Theme tags the generator matches against (e.g. "Denials").' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'uploaded',
      admin: { position: 'sidebar', description: 'AI-generated is a future source; everything is uploaded in Phase A.' },
      options: [
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'AI-generated', value: 'ai-generated' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `SocialAssets.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/collections/SocialAssets.ts
git commit -m "feat: SocialAssets collection (curated asset library)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Social Posts collection

The working record. Holds the draft, the review status, reviewer feedback, generation provenance, and (via Payload versions) full edit history.

**Files:**
- Create: `src/collections/SocialPosts.ts`

- [ ] **Step 1: Write the collection**

Create `src/collections/SocialPosts.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  versions: { drafts: false, maxPerDoc: 20 }, // keep edit history without a separate publish flow
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'platform', 'status', 'updatedAt'],
    description: 'AI-drafted posts. Review, edit, approve/reject here — your feedback trains the next batch.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Short label; auto-filled by the generator, editable.' } },
    { name: 'brand', type: 'relationship', relationTo: 'brand-profiles', required: true },
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'linkedin',
      options: [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'theme', type: 'text' },
    { name: 'copy', type: 'textarea', required: true, admin: { description: 'The post text. Edit freely before approving.' } },
    { name: 'cta', type: 'text' },
    { name: 'asset', type: 'relationship', relationTo: 'social-assets' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: { position: 'sidebar', description: 'Set to Approved when ready, or leave feedback and set Needs changes / Rejected.' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Needs changes', value: 'needs-changes' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'reviewerFeedback',
      type: 'textarea',
      admin: { description: 'Why it needs changes or was rejected. This text trains the next generation.' },
    },
    {
      name: 'generationMeta',
      type: 'group',
      admin: { description: 'Provenance — read only.' },
      fields: [
        { name: 'model', type: 'text', admin: { readOnly: true } },
        { name: 'promptVersion', type: 'text', admin: { readOnly: true } },
        { name: 'originalCopy', type: 'textarea', admin: { readOnly: true, description: 'Copy as generated, before edits.' } },
        { name: 'guardrailFlags', type: 'textarea', admin: { readOnly: true, description: 'Non-empty means a banned term or missing disclaimer — review before approving.' } },
      ],
    },
  ],
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `SocialPosts.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/collections/SocialPosts.ts
git commit -m "feat: SocialPosts collection (draft + review + provenance + history)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Register collections and generate types

**Files:**
- Modify: `src/collections/index.ts`
- Modify: `src/payload.config.ts`
- Modify (generated): `src/payload-types.ts`

- [ ] **Step 1: Export the new collections**

In `src/collections/index.ts`, append:

```ts
export { BrandProfiles } from './BrandProfiles'
export { SocialAssets } from './SocialAssets'
export { SocialPosts } from './SocialPosts'
```

- [ ] **Step 2: Import and register them in the config**

In `src/payload.config.ts`, add the imports next to the other collection imports:

```ts
import { BrandProfiles } from './collections/BrandProfiles'
import { SocialAssets } from './collections/SocialAssets'
import { SocialPosts } from './collections/SocialPosts'
```

Then add them to the `collections` array (after `DemoRequests`):

```ts
    DemoRequests,
    BrandProfiles,
    SocialAssets,
    SocialPosts,
```

- [ ] **Step 3: Generate Payload types**

Run: `npm run generate:types`
Expected: `src/payload-types.ts` updated with `BrandProfile`, `SocialAsset`, `SocialPost` interfaces. (If the loadEnv/tsx patch noted in project memory bites here, apply that patch, then re-run.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify the schema syncs and the admin loads**

Because the Postgres adapter runs with `push: true`, starting the app creates the three tables. Start dev (or rely on the running pm2 process restart) and confirm:

Run: `npm run build`
Expected: build completes with no type or schema errors. (A successful build confirms the collections compile into the admin; the running pm2 process will pick them up on restart in Task 14's smoke.)

- [ ] **Step 6: Commit**

```bash
git add src/collections/index.ts src/payload.config.ts src/payload-types.ts
git commit -m "feat: register social collections and regenerate types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Generation orchestrator

Ties it together: load the brand, build the corpus from its recent posts, build prompts, call Claude, parse drafts, run guardrails, pick a default asset, and save drafts via the Payload local API.

**Files:**
- Create: `src/lib/social/generate.ts`

- [ ] **Step 1: Write the orchestrator**

Create `src/lib/social/generate.ts`:

```ts
import { getPayloadClient } from '@/lib/payload'
import { buildCorpus } from './corpus'
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from './prompt'
import { checkGuardrails, norm } from './guardrails'
import { callClaude } from './claude'
import type { BrandConfigForPrompt, CorpusPost, GenerateOptions } from './types'

interface ParsedDraft {
  copy: string
  cta?: string
}

/** Tolerate stray prose or ```json fences around the JSON array. */
export function parseDrafts(text: string): ParsedDraft[] {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array in model output')
  const arr = JSON.parse(text.slice(start, end + 1))
  if (!Array.isArray(arr)) throw new Error('Model output was not an array')
  return arr
    .filter((d: unknown): d is { copy: string; cta?: unknown } =>
      Boolean(d) && typeof (d as { copy?: unknown }).copy === 'string')
    .map((d) => ({ copy: String(d.copy).trim(), cta: d.cta ? String(d.cta).trim() : undefined }))
}

export async function generateDrafts(brandId: string, opts: GenerateOptions): Promise<string[]> {
  const payload = await getPayloadClient()

  const brand = await payload.findByID({ collection: 'brand-profiles', id: brandId })
  if (!brand) throw new Error(`Brand ${brandId} not found`)

  const recent = await payload.find({
    collection: 'social-posts',
    where: { brand: { equals: brandId } },
    sort: '-updatedAt',
    limit: 50,
    depth: 0,
  })

  const corpusPosts: CorpusPost[] = recent.docs.map((d: Record<string, any>) => ({
    copy: d.copy,
    cta: d.cta,
    status: d.status,
    reviewerFeedback: d.reviewerFeedback,
    originalCopy: d.generationMeta?.originalCopy,
    theme: d.theme,
    updatedAt: d.updatedAt,
  }))
  const corpus = buildCorpus(corpusPosts)

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

  const system = buildSystemPrompt(brandConfig)
  const user = buildUserPrompt(brandConfig, corpus, opts)
  const { text } = await callClaude(system, user)
  const drafts = parseDrafts(text)

  const assetRes = await payload.find({
    collection: 'social-assets',
    where: { brand: { equals: brandId } },
    limit: 50,
    depth: 0,
  })
  const assets = assetRes.docs as Array<Record<string, any>>
  const pickAsset = (): string | number | undefined => {
    const themed = assets.find((a) => (a.tags || []).some((t: any) => norm(t.tag) === norm(opts.theme)))
    return (themed || assets[0])?.id
  }

  const model = process.env.SOCIAL_MODEL || 'claude-sonnet-4-6'
  const created: string[] = []
  for (const d of drafts) {
    const g = checkGuardrails(d.copy, brandConfig.bannedTerms, brandConfig.requiredDisclaimers)
    const doc = await payload.create({
      collection: 'social-posts',
      data: {
        title: `[${brandConfig.name} · ${opts.platform}] ${d.copy.slice(0, 50)}`,
        brand: brandId,
        platform: opts.platform,
        language: opts.language,
        theme: opts.theme,
        copy: d.copy,
        cta: d.cta,
        asset: pickAsset() ?? undefined,
        status: 'draft',
        generationMeta: {
          model,
          promptVersion: PROMPT_VERSION,
          originalCopy: d.copy,
          guardrailFlags: g.ok
            ? ''
            : `banned: ${g.bannedHits.join(', ')}; missing disclaimers: ${g.missingDisclaimers.join(' | ')}`,
        },
      },
    })
    created.push(String(doc.id))
  }
  return created
}
```

- [ ] **Step 2: Add a focused unit test for the one piece of pure logic here (`parseDrafts`)**

Create `src/lib/social/generate.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDrafts } from './generate'

test('parses a clean JSON array', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'hi', cta: 'Book' }])
})

test('tolerates fences and surrounding prose', () => {
  const out = parseDrafts('Here you go:\n```json\n[{"copy":"a"}]\n```\nThanks!')
  assert.deepEqual(out, [{ copy: 'a', cta: undefined }])
})

test('drops malformed elements', () => {
  const out = parseDrafts('[{"copy":"ok"},{"nope":1},42]')
  assert.deepEqual(out, [{ copy: 'ok', cta: undefined }])
})

test('throws when there is no array', () => {
  assert.throws(() => parseDrafts('the model refused'))
})
```

Note: importing `generate.ts` pulls in `@/lib/payload`, which is only evaluated when its functions are *called*, not at import time — so this test runs without a DB. If module resolution of the `@/` alias fails under the test runner, this test can instead import a copy of `parseDrafts`; but `tsx` honors `tsconfig` `paths`, so the import should resolve.

- [ ] **Step 3: Run the test**

Run: `node --import tsx --test src/lib/social/generate.test.ts`
Expected: `# pass 4`, `# fail 0`.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/generate.ts src/lib/social/generate.test.ts
git commit -m "feat: generation orchestrator (corpus -> prompt -> Claude -> drafts)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12: Auth-guarded generate API route

**Files:**
- Create: `src/app/api/social/generate/route.ts`

- [ ] **Step 1: Write the route**

Create `src/app/api/social/generate/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateDrafts } from '@/lib/social/generate'
import type { Platform, Language } from '@/lib/social/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const brandId = body.brand
  if (!brandId) return NextResponse.json({ error: 'missing brand' }, { status: 400 })

  const opts = {
    theme: String(body.theme || 'General'),
    platform: (String(body.platform || 'linkedin') as Platform),
    language: (String(body.language || 'en') as Language),
    count: Math.min(Math.max(Number(body.count) || 3, 1), 10),
  }

  try {
    const created = await generateDrafts(String(brandId), opts)
    return NextResponse.json({ ok: true, created })
  } catch (err) {
    payload.logger.error({ err }, 'social generate failed')
    const message = err instanceof Error ? err.message : 'generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Verify the auth guard rejects anonymous calls (after Task 14 starts the server, or now if dev is running)**

Run: `curl -s -X POST http://localhost:3000/api/social/generate -H 'content-type: application/json' -d '{"brand":"x"}'`
Expected: `{"error":"unauthorized"}` with HTTP 401. (Full authenticated smoke is Task 14.)

- [ ] **Step 4: Commit**

```bash
git add src/app/api/social/generate/route.ts
git commit -m "feat: auth-guarded /api/social/generate route

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 13: "Generate drafts" admin button

A client component rendered as a `ui` field on the Brand Profile edit view, so a reviewer generates drafts in one click from inside the admin.

**Files:**
- Create: `src/components/admin/GenerateDraftsButton.tsx`
- Modify: `src/collections/BrandProfiles.ts` (add a `ui` field)
- Modify (generated): `src/app/(payload)/admin/importMap.js`

- [ ] **Step 1: Write the client component**

Create `src/components/admin/GenerateDraftsButton.tsx`:

```tsx
'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function GenerateDraftsButton() {
  const { id } = useDocumentInfo()
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [count, setCount] = useState(3)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) {
    return <p style={{ fontSize: 12, color: '#666' }}>Save this brand profile first, then generate drafts.</p>
  }

  const run = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ brand: id, theme: theme || 'General', platform, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(`Created ${data.created.length} draft(s). Open Social Posts to review.`)
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, marginTop: 12 }}>
      <strong style={{ color: '#89007a' }}>Generate drafts</strong>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
        </select>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: 60 }}
        />
        <button type="button" onClick={run} disabled={busy}>
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Add the `ui` field to BrandProfiles**

In `src/collections/BrandProfiles.ts`, add as the last entry of the `fields` array:

```ts
    {
      name: 'generate',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/GenerateDraftsButton',
        },
      },
    },
```

- [ ] **Step 3: Regenerate the import map**

Run: `npx payload generate:importmap`
Expected: `src/app/(payload)/admin/importMap.js` now references `GenerateDraftsButton`. (Per project memory, importMap is required for Payload 3 custom components; the baseDir is `src`, so the `/components/...` path resolves under `src/`.)

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed. If the build complains that the `ui` field component can't be found, confirm the importMap regenerated and the path matches `src/components/admin/GenerateDraftsButton.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/GenerateDraftsButton.tsx src/collections/BrandProfiles.ts "src/app/(payload)/admin/importMap.js"
git commit -m "feat: in-admin Generate drafts button on brand profiles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 14: End-to-end smoke + verify the learning loop

Prove the whole Phase A path against the running app: seed a brand, generate, edit+approve, regenerate, and confirm the second batch is fed the first round's approved/edited/rejected signal.

**Files:** none (manual verification)

- [ ] **Step 1: Restart the app so the new schema and routes load**

Run: `pm2 restart excelent-site && sleep 5 && pm2 logs excelent-site --lines 20 --nostream`
Expected: clean startup, no schema errors. The three new tables are created by `push: true`.

- [ ] **Step 2: Confirm the admin shows the Social group**

Open the Payload admin in a browser (logged in). Expected: a "Social" nav group with Brand Profiles, Social Assets, Social Posts.

- [ ] **Step 3: Seed one brand profile**

In the admin, create a Brand Profile:
- name: `PS | RCM`, slug: `ps-rcm`, active: on
- voice: `Confident, plain-spoken, evidence-led. Never hypey. Speaks to practice operators, not patients.`
- audience: `ENT practice administrators and billing leads.`
- themes: one row — theme `Denials`, description `Reducing and recovering claim denials.`
- defaultCtas: one row — `Book a 15-minute demo`
- platforms: LinkedIn
- requiredDisclaimers: one row — `Individual results vary by practice.`
- bannedTerms: one row — `guarantee`
- seedExamples: one row — `Denials quietly drain ENT revenue. Here's the playbook we use to claw it back.`

Save. Note the record id from the URL.

- [ ] **Step 4: Generate the first batch from the admin button**

On that brand's edit page, in "Generate drafts": theme `Denials`, platform LinkedIn, count `3`, click Generate.
Expected: "Created 3 draft(s)…". Open Social Posts — three drafts in status Draft, each with `generationMeta.model` and `originalCopy` set. Any post containing "guarantee" or missing the disclaimer shows a non-empty `guardrailFlags`.

- [ ] **Step 5: Exercise the review loop**

- Edit one draft's `copy` (change wording), set status **Approved**, save. (This becomes an "edited" exemplar — `copy` now differs from `generationMeta.originalCopy`.)
- On another, set status **Rejected** and `reviewerFeedback`: `Too salesy — lead with the practical step, not a pitch.`
- Leave the third as Draft.

- [ ] **Step 6: Regenerate and confirm the loop feeds back**

Click Generate again (same theme, count 2). Then inspect what the corpus sent by adding a temporary log — OR verify indirectly: the new drafts should visibly avoid the rejected post's "salesy" pattern and echo the approved/edited tone.

For a definitive check, run this one-off that prints the corpus the generator would build (uses the local API, no server needed if dev is stopped):

```bash
node --import tsx -e "
import('./src/lib/payload.ts').then(async (p) => {
  const payload = await p.getPayloadClient();
  const recent = await payload.find({ collection: 'social-posts', sort: '-updatedAt', limit: 50, depth: 0 });
  const { buildCorpus } = await import('./src/lib/social/corpus.ts');
  const posts = recent.docs.map((d) => ({ copy: d.copy, status: d.status, reviewerFeedback: d.reviewerFeedback, originalCopy: d.generationMeta?.originalCopy, updatedAt: d.updatedAt }));
  console.log(JSON.stringify(buildCorpus(posts), null, 2));
  process.exit(0);
});
"
```
Expected JSON: `approved` contains your approved post, `edited` contains the before/after pair for the one you reworded, `rejections` contains `{copy, reason:"Too salesy…"}`. This proves the few-shot learning loop is closed.

- [ ] **Step 7: Confirm edit history**

Open the approved post → Versions. Expected: at least two versions (generated draft → approved edit), confirming history is captured.

- [ ] **Step 8: Commit a note (no code change — record the smoke result)**

If any defect was found and fixed, commit the fix on its own. Otherwise proceed to Task 15.

---

### Task 15: Docs and changelog

**Files:**
- Modify: `CHANGELOG.md`
- Create: `docs/social-agent-phase-a.md` (operator quick-start)

- [ ] **Step 1: Write a short operator guide**

Create `docs/social-agent-phase-a.md`:

```markdown
# Social Agent — Phase A (drafts + approval)

## What it does
Generates brand-aligned social drafts and routes them through human review inside
the Payload admin. No publishing yet — nothing leaves the CMS.

## Setup
- Set `ANTHROPIC_API_KEY` in `.env`. `SOCIAL_MODEL` defaults to `claude-sonnet-4-6`
  (set `claude-opus-4-8` for max quality).

## Daily use
1. **Brand Profiles** — one record per product. Edit voice, themes, CTAs, banned
   terms, required disclaimers, seed examples.
2. On a brand, use **Generate drafts** (theme + platform + count).
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

## Not in Phase A
Publishing to LinkedIn/Meta, scheduling, comment replies, and performance analytics
are later phases and intentionally excluded here.
```

- [ ] **Step 2: Add a changelog entry**

Prepend an entry to `CHANGELOG.md` under a new dated heading describing Phase A (three collections, generation engine, in-admin Generate button, few-shot learning loop, healthcare guardrails; no publishing).

- [ ] **Step 3: Commit**

```bash
git add docs/social-agent-phase-a.md CHANGELOG.md
git commit -m "docs: social agent Phase A operator guide and changelog

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 4: Run the full test suite once**

Run: `node --import tsx --test src/lib/social/guardrails.test.ts src/lib/social/corpus.test.ts src/lib/social/prompt.test.ts src/lib/social/generate.test.ts`
Expected: all pass, `# fail 0`.

---

## What Phase A deliberately excludes (next phases)

- **Publishing** to LinkedIn/Meta via an aggregator (Phase B) — needs the aggregator account + platform approvals; start that paperwork in parallel.
- **Scheduling / orchestrator cron** (Phase B) — auto-fill the queue on a cadence.
- **Comment monitoring & AI-drafted replies** (later) — human-approved, same gate.
- **Performance analytics feedback** (Phase C) — needs published history first.
- **AI image generation** — the `social-assets.source` field already leaves the seam.

---

## Self-Review (completed during planning)

- **Spec coverage:** Brand profiles (§2, §5) → Task 7. Asset library (§5) → Task 8. Social Post record + status + feedback + history (§5, §7) → Task 9. Generation pipeline + few-shot learning (§6) → Tasks 3–6, 11. Approval/feedback loop (§7) → Tasks 9, 14. Guardrails (§5) → Task 3. "Generate now" manual action (§9 Phase A) → Tasks 12–13. Publishing/orchestrator/analytics (§8, §9 B/C) → explicitly deferred. Config-driven, not separate agents (§2) → Task 7 single engine. Costs/Claude usage (§10) → env model default. Open items (§11) → seeded in Task 14, documented in Task 15.
- **Placeholder scan:** No "TBD/handle errors/etc." — every code step shows complete code; every command shows expected output.
- **Type consistency:** `checkGuardrails`, `buildCorpus`, `buildSystemPrompt`/`buildUserPrompt`, `callClaude`, `generateDrafts`, `parseDrafts`, and the `norm` helper (defined once in `guardrails.ts`, reused in `corpus.ts` and `generate.ts`) are referenced consistently. Collection slugs (`brand-profiles`, `social-assets`, `social-posts`) and field names (`originalCopy`, `guardrailFlags`, `reviewerFeedback`, `status` values) match across collections, orchestrator, and tests.
