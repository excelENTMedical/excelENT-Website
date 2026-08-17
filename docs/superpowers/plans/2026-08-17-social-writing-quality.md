# Social Writing Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Measure slop on every generated draft, repair it once automatically, stop the few-shot loop from amplifying its own tics, and let the model use bullets when the content is a genuine list.

**Architecture:** A new pure module `src/lib/social/slop.ts` mirrors the existing `guardrails.ts` — no I/O, no Payload, no network. `generate.ts` runs it after parsing and makes one repair call on a flagged draft. `corpus.ts` uses it to rank few-shot exemplars by quality instead of recency alone, which is the actual fix for the decay. Bullets enter through the JSON contract as a per-post model choice.

**Tech Stack:** TypeScript, Next.js 15, Payload CMS 3, `node:test` + `node:assert/strict`, Anthropic Messages API via plain `fetch` (no SDK), PostgreSQL 15.

**Spec:** `docs/superpowers/specs/2026-08-17-social-writing-quality-design.md`

## Global Constraints

- **Zero DDL.** No new Payload fields, no schema migration. Slop flags fold into the existing `generationMeta.guardrailFlags` string; `format` is not persisted. The Payload 3 codegen CLI is broken in this environment (payload 3.75.0, both `generate:types` paths fail), so a new field would mean hand-patching `src/payload-types.ts`.
- **Advisory, never blocking.** Guardrails in this system flag; they never prevent a save. The human review gate is the control. An empty calendar slot is worse than an imperfect draft.
- **One repair attempt per draft.** Never loop. A stubborn theme must not burn credits without a ceiling.
- **Required disclaimers are mandated verbatim** and are excluded from slop detection. The patient-facing disclaimer carries its own em dash.
- Run tests with `npm test` (`node --import tsx --test "src/**/*.test.ts"`).
- Test style: `import { test } from 'node:test'` + `import assert from 'node:assert/strict'`. Co-located `*.test.ts` beside the module.
- Do **not** `git push`. The user pushes from their own terminal (PAT never enters a session). Commit locally only.
- Commit **only the files each task names.** The working tree carries ~100 unrelated modified files from parallel work.
- Branch: `feat/social-agent-phase-a`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/social/slop.ts` | **Create.** Pure slop detection. Text preparation (strip disclaimers + hashtag block), eight rules, bullet-aware exclusions. |
| `src/lib/social/slop.test.ts` | **Create.** One case per rule plus every exclusion. |
| `src/lib/social/types.ts` | **Modify.** Add `PostFormat`. |
| `src/lib/social/corpus.ts` | **Modify.** Quality-rank exemplars, de-duplicate openers. |
| `src/lib/social/corpus.test.ts` | **Modify.** Gate behaviour. |
| `src/lib/social/prompt.ts` | **Modify.** Mid-sentence contrast rule, bullet guidance, `format` in the JSON contract, `PROMPT_VERSION` → `v3-bullets`. |
| `src/lib/social/prompt.test.ts` | **Modify.** Assert the new rules ship in the system prompt. |
| `src/lib/social/generate.ts` | **Modify.** Parse `format`, add `buildRepairPrompt`, wire the repair pass, merge flags. |
| `src/lib/social/generate.test.ts` | **Modify.** Repair-pass behaviour. |
| `scripts/add-banned-terms-2026-08.sql` | **Create.** Banned-term data for brands 1–4, and first-ever lists for 5 and 8. |
| `scripts/reslop-check.mts` | **Create.** Backfill the nine drafts scheduled 2026-08-19 → 08-31. |

---

### Task 1: Slop module foundation — text preparation and the em-dash rules

**Files:**
- Create: `src/lib/social/slop.ts`
- Create: `src/lib/social/slop.test.ts`

**Interfaces:**
- Consumes: `norm` from `./guardrails`.
- Produces:
  - `type SlopRule = 'emDash' | 'multiEmDash' | 'colonReveal' | 'notYButX' | 'binaryContrast' | 'dramaticFragment' | 'formulaOpener' | 'weaselAttribution'`
  - `interface SlopFlag { rule: SlopRule; excerpt: string }`
  - `interface SlopResult { ok: boolean; flags: SlopFlag[] }`
  - `interface DetectSlopOpts { requiredDisclaimers?: string[] }`
  - `function prepare(copy: string, requiredDisclaimers?: string[]): string` (exported for tests)
  - `function detectSlop(copy: string, opts?: DetectSlopOpts): SlopResult`

- [ ] **Step 1: Write the failing test**

Create `src/lib/social/slop.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectSlop, prepare } from './slop'

const rules = (copy: string, disclaimers?: string[]) =>
  detectSlop(copy, { requiredDisclaimers: disclaimers }).flags.map((f) => f.rule)

test('clean prose trips nothing', () => {
  const copy = 'Your denial rate is a cash-flow number. Partner practices have pushed their rate toward 2.5% with coders who work only in ENT.\n\nRequest a Demo.'
  assert.deepEqual(detectSlop(copy), { ok: true, flags: [] })
})

test('flags a single em dash and quotes the offending line', () => {
  const flags = detectSlop('The phones ring all day — and nobody answers them.').flags
  assert.deepEqual(flags.map((f) => f.rule), ['emDash'])
  assert.match(flags[0].excerpt, /phones ring all day/)
})

test('flags two em dashes as both emDash and multiEmDash', () => {
  assert.deepEqual(
    rules('One thing — then another — then a third.').sort(),
    ['emDash', 'multiEmDash'],
  )
})

test('a required disclaimer is excluded even though it carries an em dash', () => {
  const disclaimer = 'This content is for general information only — it is not medical advice.'
  assert.deepEqual(rules(`Book a visit today.\n\n${disclaimer}`, [disclaimer]), [])
})

test('disclaimer exclusion survives reflowed whitespace', () => {
  const disclaimer = 'Not medical advice — talk to your doctor.'
  const copy = 'Book a visit.\n\nNot medical advice —\ntalk to your doctor.'
  assert.deepEqual(rules(copy, [disclaimer]), [])
})

test('the trailing hashtag block is excluded', () => {
  const copy = 'Open capacity costs you money.\n\n#ENT #Otolaryngology #PracticeManagement'
  assert.deepEqual(rules(copy), [])
})

test('prepare strips disclaimers and hashtags but keeps the body', () => {
  const out = prepare('Body text here.\n\n#ENT #Sinus', [])
  assert.match(out, /Body text here\./)
  assert.doesNotMatch(out, /#ENT/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | grep -A3 slop`
Expected: FAIL — `Cannot find module './slop'`

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/social/slop.ts`:

```ts
/**
 * Detects the writing tics the anti-slop rules ban.
 *
 * Pure: no I/O, no Payload, no network. Mirrors `guardrails.ts`, which does the same job
 * for banned terms and required disclaimers.
 *
 * Every rule here corresponds to a pattern measured in the 2026-07-31 corpus audit
 * (43 generated posts + 8 seeds). A prompt instruction is a hope; this is the check.
 *
 * Each flag carries the offending excerpt, not just a rule name. That excerpt is what
 * makes the repair pass in `generate.ts` work — quoting a sentence back to the model
 * fixes it far more reliably than naming the rule it broke.
 */

export type SlopRule =
  | 'emDash'
  | 'multiEmDash'
  | 'colonReveal'
  | 'notYButX'
  | 'binaryContrast'
  | 'dramaticFragment'
  | 'formulaOpener'
  | 'weaselAttribution'

export interface SlopFlag {
  rule: SlopRule
  excerpt: string
}

export interface SlopResult {
  ok: boolean
  flags: SlopFlag[]
}

export interface DetectSlopOpts {
  /** Disclaimer text the brand mandates verbatim. Excluded from detection. */
  requiredDisclaimers?: string[]
}

/** A line that is nothing but hashtags. */
const HASHTAG_LINE = /^\s*(#[^\s#]+\s*)+$/

/** Escape a literal string for use inside a RegExp. */
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Strip the text that must not be judged: disclaimers the brand mandates verbatim, and
 * the trailing hashtag block.
 *
 * The disclaimer exclusion is not a nicety. The patient-facing disclaimer contains an em
 * dash and is required word-for-word — counting it flags the writer for compliance, which
 * is exactly what made the first pass of the 07-31 audit read wrong until it was excluded.
 *
 * Disclaimers are matched with `\s+` between words so a reflowed line break still matches.
 */
export function prepare(copy: string, requiredDisclaimers: string[] = []): string {
  let out = copy

  for (const d of requiredDisclaimers) {
    const trimmed = d.trim()
    if (!trimmed) continue
    const pattern = trimmed.split(/\s+/).map(escapeRe).join('\\s+')
    out = out.replace(new RegExp(pattern, 'gi'), ' ')
  }

  const lines = out.split('\n')
  while (lines.length && (HASHTAG_LINE.test(lines[lines.length - 1]) || !lines[lines.length - 1].trim())) {
    lines.pop()
  }
  return lines.join('\n')
}

/** First line containing `needle`, trimmed — used as the flag excerpt. */
const lineContaining = (text: string, needle: string): string => {
  const line = text.split('\n').find((l) => l.includes(needle))
  return (line || text).trim()
}

export function detectSlop(copy: string, opts: DetectSlopOpts = {}): SlopResult {
  const text = prepare(copy, opts.requiredDisclaimers)
  const flags: SlopFlag[] = []

  const emDashes = text.match(/—/g) || []
  if (emDashes.length > 0) {
    flags.push({ rule: 'emDash', excerpt: lineContaining(text, '—') })
  }
  if (emDashes.length > 1) {
    flags.push({ rule: 'multiEmDash', excerpt: `${emDashes.length} em dashes in one post` })
  }

  return { ok: flags.length === 0, flags }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test 2>&1 | tail -20`
Expected: all slop tests PASS, no existing suite regressions.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/slop.ts src/lib/social/slop.test.ts
git commit -m "feat(social): slop detector foundation with disclaimer and hashtag exclusions"
```

---

### Task 2: The remaining six slop rules

**Files:**
- Modify: `src/lib/social/slop.ts`
- Modify: `src/lib/social/slop.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces: no new exports. `detectSlop` now emits all eight rules.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/social/slop.test.ts`:

```ts
test('flags a dramatic colon reveal', () => {
  assert.ok(rules('The best part: it learns your payer mix.').includes('colonReveal'))
})

test('a colon introducing a bullet list is correct, not a reveal', () => {
  const copy = 'Most denials trace back to the same four causes:\n\n• Coverage not verified\n• Wrong modifier\n• Missing documentation\n• Filed late'
  assert.ok(!rules(copy).includes('colonReveal'))
})

test('a clock time is not a colon reveal', () => {
  assert.ok(!rules('Your phone stays locked after 5:30 p.m. every weekday.').includes('colonReveal'))
})

test('flags the mid-sentence X-not-Y contrast the v2 rules missed', () => {
  assert.ok(rules('A new sinus patient evaluation is a starting point, not the destination.').includes('notYButX'))
})

test('flags the not-just-but form', () => {
  assert.ok(rules('This is not just billing, but the whole revenue cycle.').includes('notYButX'))
})

test('flags the two-sentence binary contrast', () => {
  assert.ok(rules("That's not a marketing problem. That's a patient journey problem.").includes('binaryContrast'))
})

test('flags a dramatic fragment', () => {
  // The fragment must NOT be on the last line — that line is the CTA and is excluded.
  const copy = 'The claim goes out clean every time. That is it.\n\nRequest a Demo.'
  assert.ok(rules(copy).includes('dramaticFragment'))
})

test('a bullet line is never a dramatic fragment', () => {
  const copy = 'Four causes drive most denials.\n\n• Coverage unverified\n• Wrong modifier\n• Missing notes\n\nPS | RCM catches all four before the claim goes out.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('the final CTA line is never a dramatic fragment', () => {
  const copy = 'Your front desk answers the same three questions all day long.\n\nRequest a Demo.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('a quoted line is never a dramatic fragment', () => {
  // Lives in a real seed example: the phone-tree quote in brand 2.
  const copy = '"Press 1 for scheduling. Press 2 for billing."\n\nPhone trees were designed around the org chart rather than the patient problem.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('flags the Most-noun formula opener', () => {
  assert.ok(rules('Most practices accept denied claims as a billing reality. They should not.').includes('formulaOpener'))
})

test('only the opening sentence can be a formula opener', () => {
  assert.ok(!rules('Denials cost you real money. Most practices accept them anyway.').includes('formulaOpener'))
})

test('flags weasel attribution', () => {
  assert.ok(rules('Studies show that denial rates keep climbing.').includes('weaselAttribution'))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | grep -c "not ok"`
Expected: FAIL — 13 new failures, since `detectSlop` emits only the em-dash rules.

- [ ] **Step 3: Write minimal implementation**

In `src/lib/social/slop.ts`, add these constants above `detectSlop`:

```ts
/**
 * A colon that does not introduce a list.
 *
 * `(?!\d)` skips clock times (5:30). Requiring whitespace after the colon skips URLs
 * (https://). The negative lookahead on `•` is what keeps a legitimate list intro legal —
 * the writing rules allow colons for lists and labels, only drama is banned.
 */
const COLON_REVEAL = /[^\s:][^.!?\n]{0,80}:(?!\d)[ \t]*\n?\s*(?![•\-*])\S[^.!?\n]*/

/** Mid-sentence negation contrasts. The v2 rules banned only the two-sentence form. */
const NOT_Y_BUT_X: RegExp[] = [
  /[^.!?\n]{0,80},\s+not\s+(?!to mention\b)[^.!?\n]{0,60}/,
  /\bnot\s+(?:just|only)\b[^.!?\n]{0,60},?\s+but\b[^.!?\n]{0,60}/,
  /\b(?:is|are|was|were)n['’]?t\b[^.!?\n]{0,60},\s+(?:it|they|that)['’]?s?\b/,
]

/** The two-sentence version: "That's not X. That's Y." */
const BINARY_CONTRAST =
  /\b(?:that['’]s|that is|this is|it['’]s|it is)\s+not\b[^.!?\n]{0,80}[.!?]\s+(?:that['’]s|that is|this is|it['’]s|it is)\b/i

const FORMULA_OPENERS: RegExp[] = [
  /^most\s+\w+/i,
  /^here['’]s the thing/i,
  /^let me be clear/i,
  /^i['’]ll be honest/i,
  /^here['’]s what (?:nobody|no one) tells you/i,
  /^what most \w+ get wrong/i,
  /^it['’]s worth noting/i,
  /^in today['’]s world/i,
  /^when it comes to/i,
  /^the (?:reality|truth) is/i,
  /^at the end of the day/i,
]

const WEASEL =
  /\b(?:studies show|research shows|experts agree|many argue|it is widely believed|some say)\b/i

/** A line that is a bullet item. Bullets are legitimately short and legitimately preceded by a colon. */
const BULLET_LINE = /^\s*[•]/

const MAX_FRAGMENT_WORDS = 4
```

Then replace the `return` at the end of `detectSlop` with the full rule set:

```ts
  const colon = text.match(COLON_REVEAL)
  if (colon) flags.push({ rule: 'colonReveal', excerpt: colon[0].trim() })

  for (const re of NOT_Y_BUT_X) {
    const m = text.match(re)
    if (m) {
      flags.push({ rule: 'notYButX', excerpt: m[0].trim() })
      break
    }
  }

  const binary = text.match(BINARY_CONTRAST)
  if (binary) flags.push({ rule: 'binaryContrast', excerpt: binary[0].trim() })

  const fragment = findDramaticFragment(text)
  if (fragment) flags.push({ rule: 'dramaticFragment', excerpt: fragment })

  const opener = text.trim().split(/(?<=[.!?])\s+/)[0] || ''
  if (FORMULA_OPENERS.some((re) => re.test(opener.trim()))) {
    flags.push({ rule: 'formulaOpener', excerpt: opener.trim() })
  }

  const weasel = text.match(WEASEL)
  if (weasel) flags.push({ rule: 'weaselAttribution', excerpt: lineContaining(text, weasel[0]) })

  return { ok: flags.length === 0, flags }
```

And add the fragment helper above `detectSlop`:

```ts
/**
 * Finds a sentence of four words or fewer.
 *
 * Three exclusions, each earned:
 * - Bullet lines are supposed to be short fragments.
 * - The last non-empty line is the call to action ("Request a Demo."), which the writing
 *   rules explicitly permit as an ending.
 * - A quoted line is deliberate voice, not a tic. Brand 2's seed example opens on a
 *   phone-tree quote made of four-word sentences.
 */
function findDramaticFragment(text: string): string | null {
  const lines = text.split('\n')
  let lastContentIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) {
      lastContentIdx = i
      break
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) continue
    if (i === lastContentIdx) continue
    if (BULLET_LINE.test(line)) continue
    if (trimmed.startsWith('"') || trimmed.startsWith('“')) continue

    for (const sentence of trimmed.split(/(?<=[.!?])\s+/)) {
      const s = sentence.trim()
      if (!/[.!?]$/.test(s)) continue
      const words = s.split(/\s+/).filter(Boolean)
      if (words.length > 0 && words.length <= MAX_FRAGMENT_WORDS) return s
    }
  }
  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test 2>&1 | tail -20`
Expected: all slop tests PASS.

Then sanity-check against real copy — this is the number the whole plan exists to move:

```bash
cd /home/bitnami/stack/excelent-site && node --import tsx -e "
import('./src/lib/social/slop.ts').then(async (m) => {
  const { Client } = await import('pg')
  const c = new Client({ host:'localhost', user:'excelent', password:'ExcelENT2024Secure', database:'excelent_cms' })
  await c.connect()
  const { rows } = await c.query('select id, copy from social_posts order by id')
  let clean = 0
  for (const r of rows) {
    const res = m.detectSlop(r.copy)
    if (res.ok) clean++
    else console.log(r.id, res.flags.map(f => f.rule).join(','))
  }
  console.log('clean:', clean, '/', rows.length)
  await c.end()
})"
```

Expected: roughly 40 posts flagged for `emDash`, and the flagged set should look plausible on inspection. **If a post you consider well-written is flagged, note it — do not loosen a rule without checking the copy first.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/slop.ts src/lib/social/slop.test.ts
git commit -m "feat(social): detect colon reveals, negation contrasts, fragments, formula openers"
```

---

### Task 3: Corpus quality gate

This is the task that actually stops the decay. The detector catches slop in one draft; the gate stops the loop from manufacturing it.

**Files:**
- Modify: `src/lib/social/corpus.ts`
- Modify: `src/lib/social/corpus.test.ts`

**Interfaces:**
- Consumes: `detectSlop` from `./slop`.
- Produces: `buildCorpus` keeps its existing signature `(posts: CorpusPost[], opts?: BuildCorpusOpts) => FewShotCorpus`. Behaviour changes only.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/social/corpus.test.ts`:

```ts
test('prefers a clean post over a more recent flagged one', () => {
  const c = buildCorpus(
    [
      post({ copy: 'The claim goes out — and comes back denied.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'Your coders know the payer mix before a claim goes out.', status: 'approved', updatedAt: '2026-08-01T00:00:00.000Z' }),
    ],
    { maxApproved: 1 },
  )
  assert.deepEqual(c.approved, ['Your coders know the payer mix before a claim goes out.'])
})

test('collapses repeated openers so one formula cannot fill the corpus', () => {
  const c = buildCorpus(
    [
      // The first FOUR words must match for openerKey to collapse them.
      post({ copy: 'Most practices accept denials without ever appealing them.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'Most practices accept denials as the cost of doing business.', status: 'approved', updatedAt: '2026-08-16T00:00:00.000Z' }),
      post({ copy: 'Your front desk answers the same three questions all day.', status: 'approved', updatedAt: '2026-08-15T00:00:00.000Z' }),
    ],
    { maxApproved: 3 },
  )
  assert.equal(c.approved.length, 2, 'the second "Most practices accept" post must be dropped')
  assert.ok(c.approved.some((x) => x.startsWith('Your front desk')))
})

test('falls back to flagged posts rather than returning an empty corpus', () => {
  const c = buildCorpus(
    [
      post({ copy: 'One thing — then another — then a third.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'A single tic — right here.', status: 'approved', updatedAt: '2026-08-16T00:00:00.000Z' }),
    ],
    { maxApproved: 2 },
  )
  assert.equal(c.approved.length, 2, 'a brand with no clean history must still generate')
  assert.equal(c.approved[0], 'A single tic — right here.', 'fewest flags first')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | grep -A5 "prefers a clean post"`
Expected: FAIL — selection is by recency, so the flagged Aug 17 post wins.

- [ ] **Step 3: Write minimal implementation**

In `src/lib/social/corpus.ts`, add the import and two helpers:

```ts
import { detectSlop } from './slop'

/**
 * Normalized first four words. Two posts that share this share a formula.
 *
 * The 2026-07-31 audit found eight posts opening `Most [noun]`. Nothing instructed that;
 * the loop learned it from its own approved output and taught it back. De-duplicating
 * openers is what stops one formula from occupying most of the exemplar slots.
 */
const openerKey = (copy: string): string => norm(copy).split(' ').slice(0, 4).join(' ')

/**
 * Rank exemplars by quality, then recency, and never let one opener repeat.
 *
 * Selection used to be recency alone, and the prompt hands these to the model labelled
 * "match this quality and tone" — so any tic that survived human review became the next
 * template. That is why the em dash rate climbed back from 27% to 60% after the seed
 * examples were cleaned up.
 *
 * Flagged posts are kept as a fallback, ordered fewest-flags-first: a brand with no clean
 * history still needs exemplars, and an empty corpus generates worse copy than a flawed one.
 */
function rankByQuality(posts: CorpusPost[], max: number): CorpusPost[] {
  const scored = posts.map((p) => ({ p, flags: detectSlop(p.copy).flags.length }))
  const clean = scored.filter((s) => s.flags === 0)
  // Array.prototype.sort is stable, so recency order survives within an equal flag count.
  const rest = scored.filter((s) => s.flags > 0).sort((a, b) => a.flags - b.flags)

  const seen = new Set<string>()
  const picked: CorpusPost[] = []
  for (const { p } of [...clean, ...rest]) {
    if (picked.length >= max) break
    const key = openerKey(p.copy)
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(p)
  }
  return picked
}
```

Then replace the `editedPosts` and `approved` blocks in `buildCorpus`:

```ts
  // A human edit that removed slop is the most valuable signal in the system. Rank these
  // first so the strongest exemplars claim their slots before the plain approved pool.
  const editedPosts = rankByQuality(
    approvedPosts.filter((p) => p.originalCopy && norm(p.originalCopy) !== norm(p.copy)),
    maxEdited,
  )
  const editedSet = new Set(editedPosts.map((p) => p.copy))
  const edited = editedPosts.map((p) => ({ before: p.originalCopy as string, after: p.copy }))

  const approved = rankByQuality(
    approvedPosts.filter((p) => !editedSet.has(p.copy)),
    maxApproved,
  ).map((p) => p.copy)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test 2>&1 | tail -20`
Expected: all corpus tests PASS, including the pre-existing ones.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/corpus.ts src/lib/social/corpus.test.ts
git commit -m "fix(social): rank few-shot exemplars by quality, not recency

The loop selected approved posts by recency and labelled them 'match this
quality and tone', so any tic surviving review became the next template.
Three of eight recently approved posts opened 'Most [noun]'."
```

---

### Task 4: Bullets and the v3 prompt

**Files:**
- Modify: `src/lib/social/types.ts`
- Modify: `src/lib/social/prompt.ts`
- Modify: `src/lib/social/prompt.test.ts`
- Modify: `src/lib/social/generate.ts` (the `parseDrafts` half only)
- Modify: `src/lib/social/generate.test.ts`

**Interfaces:**
- Produces:
  - `export type PostFormat = 'prose' | 'bullets'` in `types.ts`
  - `export const POST_FORMATS: PostFormat[]` in `generate.ts`
  - `ParsedDraft` gains `format: PostFormat`
  - `PROMPT_VERSION` becomes `'v3-bullets'`

- [ ] **Step 1: Write the failing test**

Append to `src/lib/social/generate.test.ts`:

```ts
test('parses the format field', () => {
  const out = parseDrafts('[{"copy":"hi","format":"bullets"}]')
  assert.equal(out[0].format, 'bullets')
})

test('defaults format to prose when absent or unknown', () => {
  assert.equal(parseDrafts('[{"copy":"hi"}]')[0].format, 'prose')
  assert.equal(parseDrafts('[{"copy":"hi","format":"banana"}]')[0].format, 'prose')
})
```

Append to `src/lib/social/prompt.test.ts`:

```ts
test('the system prompt bans the mid-sentence negation contrast', () => {
  const sys = buildSystemPrompt({
    name: 'B', voice: 'v', themes: [], defaultCtas: [],
    bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
  })
  assert.match(sys, /not the destination/)
})

test('the system prompt explains when bullets are allowed and how to render them', () => {
  const sys = buildSystemPrompt({
    name: 'B', voice: 'v', themes: [], defaultCtas: [],
    bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
  })
  assert.match(sys, /•/)
  assert.match(sys, /strips markdown/i)
})

test('the user prompt asks for a format in the JSON contract', () => {
  const user = buildUserPrompt(
    { name: 'B', voice: 'v', themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [] },
    { approved: [], edited: [], rejections: [] },
    { theme: 'T', platform: 'linkedin', language: 'en', count: 1 },
  )
  assert.match(user, /"format"/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | grep -c "not ok"`
Expected: FAIL — 5 new failures.

- [ ] **Step 3: Write minimal implementation**

In `src/lib/social/types.ts`, add:

```ts
/** Whether a post is written as paragraphs or as a bulleted list. Generation-time only — not persisted. */
export type PostFormat = 'prose' | 'bullets'
```

In `src/lib/social/generate.ts`:

```ts
import type { BrandConfigForPrompt, CorpusPost, GenerateOptions, GraphicFields, GraphicStyle, PostFormat } from './types'

interface ParsedDraft {
  copy: string
  cta?: string
  format: PostFormat
  graphicStyle: GraphicStyle
  graphic: GraphicFields
}

export const POST_FORMATS: PostFormat[] = ['prose', 'bullets']
```

and inside the `.map((d) => {` block of `parseDrafts`, add before the return:

```ts
      const rawFormat = String((d as any).format || '')
```

and add to the returned object:

```ts
        format: (POST_FORMATS.includes(rawFormat as PostFormat) ? rawFormat : 'prose') as PostFormat,
```

In `src/lib/social/prompt.ts`, bump the version:

```ts
// v3 added bullets and the mid-sentence negation contrast rule.
export const PROMPT_VERSION = 'v3-bullets'
```

Add to `WRITING_RULES`, immediately after the `Binary contrasts` bullet:

```
- Mid-sentence negation contrasts. Not "a starting point, not the destination" and not
  "not just billing, but the whole revenue cycle." Say what the thing is and stop. This
  is the same tic as a binary contrast wearing a comma.
```

Append to `WRITING_RULES`, after the "Do this instead" block:

```
BULLETS — set "format" to "bullets" only when the content is genuinely a list: causes,
steps, features, or items that share a grammatical shape. A company story, a patient
narrative, or anything with a through-line stays "prose". Most posts are prose.

When you do use bullets:
- Open with one short paragraph of setup, then the list, then the call to action. Never
  open a post on a bullet.
- Start each item with the literal character • — LinkedIn strips markdown, so "-" and "*"
  render as themselves.
- Three to five items. Two is a sentence; six is a spreadsheet.
- Parallel grammar: every item opens with the same part of speech.
- No terminal periods on fragments.
- A colon introducing the list is correct. That is the one colon these rules allow.
```

In `buildUserPrompt`, change the JSON contract line to:

```ts
  lines.push(
    '\nReturn ONLY a JSON array. Each element: {"copy":"<post text>","cta":"<cta>","format":"prose|bullets",' +
      '"graphicStyle":"hook|stat|dataviz",' +
      '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":""}}. ' +
      'Include only the graphic keys your chosen style needs. No prose, no markdown code fences.',
  )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test 2>&1 | tail -20`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/types.ts src/lib/social/prompt.ts src/lib/social/prompt.test.ts src/lib/social/generate.ts src/lib/social/generate.test.ts
git commit -m "feat(social): model-chosen bullets and the v3 writing rules"
```

---

### Task 5: The repair pass

**Files:**
- Modify: `src/lib/social/generate.ts`
- Modify: `src/lib/social/generate.test.ts`

**Interfaces:**
- Consumes: `detectSlop`, `SlopFlag` from `./slop`; `PostFormat` from `./types`.
- Produces: `export function buildRepairPrompt(copy: string, flags: SlopFlag[], format: PostFormat): string`

- [ ] **Step 1: Write the failing test**

Add `buildRepairPrompt` to the existing top-of-file import in `src/lib/social/generate.test.ts`:

```ts
import { parseDrafts, buildBrandConfig, generateDrafts, buildPostTitle, buildRepairPrompt } from './generate'
```

Then append:

```ts
const brandDoc = {
  id: 1, name: 'Brand', voice: 'v', audience: 'a',
  themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
}

test('buildRepairPrompt quotes each violation back to the model', () => {
  const p = buildRepairPrompt('The claim goes out — and comes back.', [
    { rule: 'emDash', excerpt: 'The claim goes out — and comes back.' },
  ], 'prose')
  assert.match(p, /emDash/)
  assert.match(p, /The claim goes out/)
})

test('a flagged draft triggers exactly one repair call and saves the repaired copy', async () => {
  const createCalls: any[] = []
  const prompts: string[] = []
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 7 } },
  }
  const fakeClaude = async (_sys: string, user: string) => {
    prompts.push(user)
    return prompts.length === 1
      ? { text: '[{"copy":"The claim goes out — and comes back denied.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'The claim goes out and comes back denied.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.equal(prompts.length, 2, 'exactly one repair call')
  assert.equal(createCalls[0].data.copy, 'The claim goes out and comes back denied.')
  assert.equal(createCalls[0].data.generationMeta.guardrailFlags, '', 'repaired copy is clean')
})

test('a clean draft triggers no repair call', async () => {
  const prompts: string[] = []
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async () => ({ id: 8 }),
  }
  const fakeClaude = async (_sys: string, user: string) => {
    prompts.push(user)
    return { text: '[{"copy":"Your coders know the payer mix before a claim goes out.","graphicStyle":"hook","graphic":{}}]' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )
  assert.equal(prompts.length, 1)
})

test('a repair that does not improve the copy is discarded and residual flags are recorded', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 9 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"One — two — three.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'Still — just — as — bad.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.equal(createCalls[0].data.copy, 'One — two — three.', 'a worse repair is rejected')
  assert.match(createCalls[0].data.generationMeta.guardrailFlags, /slop: emDash/)
})

test('generationMeta.originalCopy holds the saved copy, not the pre-repair draft', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 10 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"The claim goes out — denied.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'The claim goes out and comes back denied every time.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  // buildCorpus treats originalCopy !== copy as a HUMAN edit and feeds it back as a
  // before/after training pair. Storing the pre-repair draft here would teach the loop
  // from our own machine repair — the amplification bug through the back door.
  assert.equal(createCalls[0].data.generationMeta.originalCopy, createCalls[0].data.copy)
})

test('a repair that drops a required disclaimer is rejected', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => ({ ...brandDoc, requiredDisclaimers: [{ text: 'Not medical advice.' }] }),
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 11 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"Book a visit — today. Not medical advice.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'Book a visit today.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.match(createCalls[0].data.copy, /Not medical advice\./)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | grep -c "not ok"`
Expected: FAIL — `buildRepairPrompt` is not exported.

- [ ] **Step 3: Write minimal implementation**

In `src/lib/social/generate.ts`, add the import:

```ts
import { detectSlop, type SlopFlag } from './slop'
```

Add `buildRepairPrompt` above `generateDrafts`:

```ts
/**
 * Asks the model to fix its own slop, quoting each violation back at it.
 *
 * Scoped deliberately narrow. A wholesale rewrite produces correct, lifeless copy — the
 * failure mode of mechanical de-slopping. Naming the offending spans and forbidding
 * everything else keeps the voice the brand prompt built.
 */
export function buildRepairPrompt(copy: string, flags: SlopFlag[], format: PostFormat): string {
  const violations = flags.map((f) => `- ${f.rule}: "${f.excerpt}"`).join('\n')
  return [
    'The post below breaks the writing rules in your brief. Fix it.',
    '',
    'VIOLATIONS:',
    violations,
    '',
    'Rewrite ONLY what is needed to clear these violations. Keep the meaning, every fact and',
    'figure, the call to action, and any required disclaimer word for word. Do not invent',
    'numbers, do not add claims, and do not change the subject.',
    format === 'bullets'
      ? 'Keep the bulleted structure, including the • characters.'
      : 'Keep it as prose. Do not convert it to a list.',
    '',
    'Return ONLY the corrected post text. No JSON, no commentary, no code fences.',
    '',
    'POST:',
    copy,
  ].join('\n')
}
```

Replace the body of the `for (const d of drafts)` loop in `generateDrafts`:

```ts
  for (const d of drafts) {
    let copy = d.copy
    const disclaimers = brandConfig.requiredDisclaimers
    const before = detectSlop(copy, { requiredDisclaimers: disclaimers })
    let residual = before

    // One attempt, best-effort. A repair failure must never cost the calendar a draft,
    // and a retry loop on a stubborn theme burns credits with no ceiling.
    if (!before.ok) {
      try {
        const { text: repaired } = await callClaudeImpl(
          system,
          buildRepairPrompt(copy, before.flags, d.format),
        )
        const candidate = repaired.trim()
        if (candidate) {
          const after = detectSlop(candidate, { requiredDisclaimers: disclaimers })
          const stillCompliant =
            checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers).missingDisclaimers
              .length === 0
          // Accept only a strict improvement that kept the disclaimer. A repair is allowed
          // to fail; it is not allowed to make the draft worse or drop mandated text.
          if (after.flags.length < before.flags.length && stillCompliant) {
            copy = candidate
            residual = after
          }
        }
      } catch {
        // Leave the draft as generated; the flags below still surface it for review.
      }
    }

    const g = checkGuardrails(copy, brandConfig.bannedTerms, disclaimers)
    const flagParts: string[] = []
    if (g.bannedHits.length) flagParts.push(`banned: ${g.bannedHits.join(', ')}`)
    if (g.missingDisclaimers.length) {
      flagParts.push(`missing disclaimers: ${g.missingDisclaimers.join(' | ')}`)
    }
    if (residual.flags.length) {
      flagParts.push(`slop: ${[...new Set(residual.flags.map((f) => f.rule))].join(', ')}`)
    }

    const assetId = pickAsset()
    const doc = await payload.create({
      collection: 'social-posts',
      context: createContext,
      data: {
        title: buildPostTitle(opts.theme, copy),
        brand: Number(brandId),
        platform: opts.platform,
        language: opts.language,
        theme: opts.theme,
        copy,
        cta: d.cta,
        graphicStyle: d.graphicStyle,
        graphic: d.graphic,
        asset: assetId != null ? Number(assetId) : undefined,
        status: 'draft',
        generationMeta: {
          model,
          promptVersion: PROMPT_VERSION,
          // Post-repair on purpose: buildCorpus reads originalCopy !== copy as a human
          // edit. Storing the pre-repair draft would feed our own machine repair back as
          // a human correction.
          originalCopy: copy,
          guardrailFlags: flagParts.join('; '),
        },
      },
    })
    created.push(String(doc.id))
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test 2>&1 | tail -25`
Expected: all PASS, including the pre-existing `count`-cap and `createContext` tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/generate.ts src/lib/social/generate.test.ts
git commit -m "feat(social): one-shot slop repair pass before a draft is saved

Accepts the repair only on strict improvement with the disclaimer intact.
originalCopy keeps the saved copy so the corpus does not mistake a machine
repair for a human edit."
```

---

### Task 6: Banned-term data

**Files:**
- Create: `scripts/add-banned-terms-2026-08.sql`

No code, no tests — this is data. Brands 5 and 8 have zero banned-term rows today, and brand 8 is the Monday Company pillar.

- [ ] **Step 1: Check the current state**

```bash
export PGPASSWORD=ExcelENT2024Secure
psql -h localhost -U excelent -d excelent_cms -c \
  "select _parent_id, count(*) from brand_profiles_banned_terms group by 1 order by 1;"
```

Expected: rows for parents 1–4 only. Note the table shape first:

```bash
psql -h localhost -U excelent -d excelent_cms -c "\d brand_profiles_banned_terms"
```

- [ ] **Step 2: Write the script**

Create `scripts/add-banned-terms-2026-08.sql`. Adjust the `id` generation to match the column type observed in Step 1 (Payload array rows use a varchar `id`):

```sql
-- Banned-term additions, 2026-08-17.
--
-- `actually` appeared in 14 of 51 posts in the 07-31 corpus audit as pure filler.
-- Brands 5 (excelent-practice-solutions) and 8 (excelent-company) had NO banned terms
-- at all; brand 8 is the Monday Company pillar.
--
-- Deliberately NOT banned: `journey` (it is a theme name) and `solution`
-- ("Practice Solutions" is a brand name).
BEGIN;

-- Filler and marketing-speak, added to every brand that already has a list.
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT
  (SELECT COALESCE(MAX(_order), 0) FROM brand_profiles_banned_terms b2 WHERE b2._parent_id = p.id)
    + row_number() OVER (PARTITION BY p.id ORDER BY t.term),
  p.id,
  gen_random_uuid()::text,
  t.term
FROM (SELECT unnest(ARRAY['actually', 'seamless', 'seamlessly']) AS term) t
CROSS JOIN (SELECT unnest(ARRAY[1, 2, 3, 4]) AS id) p
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
  WHERE x._parent_id = p.id AND lower(x.term) = lower(t.term)
);

-- First list for brand 5 (excelENT Practice Solutions — the PS-suite seller).
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT row_number() OVER (ORDER BY t.term), 5, gen_random_uuid()::text, t.term
FROM (SELECT unnest(ARRAY[
  'guaranteed', 'guarantee', 'risk-free', 'cure', 'service tiers',
  'actually', 'seamless', 'seamlessly', 'one-stop shop', 'best-in-class'
]) AS term) t
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
  WHERE x._parent_id = 5 AND lower(x.term) = lower(t.term)
);

-- First list for brand 8 (excelENT | Company — company story, no product pitch).
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT row_number() OVER (ORDER BY t.term), 8, gen_random_uuid()::text, t.term
FROM (SELECT unnest(ARRAY[
  'guaranteed', 'guarantee', 'risk-free', 'cure',
  'actually', 'seamless', 'seamlessly', 'disrupt', 'disruptive',
  'revolutionize', 'best-in-class', 'industry-leading'
]) AS term) t
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
  WHERE x._parent_id = 8 AND lower(x.term) = lower(t.term)
);

COMMIT;
```

- [ ] **Step 3: Apply it**

```bash
cd /home/bitnami/stack/excelent-site
export PGPASSWORD=ExcelENT2024Secure
psql -h localhost -U excelent -d excelent_cms -v ON_ERROR_STOP=1 -f scripts/add-banned-terms-2026-08.sql
```

Expected: three `INSERT` results, then `COMMIT`. If `gen_random_uuid()` is unavailable, run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` first.

- [ ] **Step 4: Verify**

```bash
psql -h localhost -U excelent -d excelent_cms -c \
  "select _parent_id, string_agg(term, ', ' order by _order) from brand_profiles_banned_terms group by 1 order by 1;"
```

Expected: six rows (parents 1, 2, 3, 4, 5, 8). Re-running the script must change nothing — it is idempotent by design.

- [ ] **Step 5: Commit**

```bash
git add scripts/add-banned-terms-2026-08.sql
git commit -m "chore(social): banned terms for brands 5 and 8, plus actually/seamless"
```

---

### Task 7: Backfill script for the nine Aug 19–31 drafts

**Files:**
- Create: `scripts/reslop-check.mts`

**Interfaces:**
- Consumes: `detectSlop` from `src/lib/social/slop`, `buildRepairPrompt` from `src/lib/social/generate`, `buildSystemPrompt`/`buildBrandConfig`, `callClaude`.

- [ ] **Step 1: Stop the scheduler first**

```bash
pm2 stop social-scheduler
```

The hourly planner refills any empty slot in its 14-day horizon and has sniped a vacated slot before (post 38, 2026-07-09). It stays stopped until Step 5.

- [ ] **Step 2: Write the script**

Create `scripts/reslop-check.mts`, following the `.env` loading convention from `scripts/generate-company-batch.mts`:

```ts
// Re-run slop detection and the repair pass over already-generated drafts.
//
// Scoped by what makes a post ELIGIBLE (a future-dated draft), never by a bare date
// range. On 2026-07-31 a date-scoped delete nearly swept up eight posts generated between
// planning and execution.
//
// Run from the project root:
//   node --import tsx scripts/reslop-check.mts                 # dry run, writes nothing
//   node --import tsx scripts/reslop-check.mts --apply
//   node --import tsx scripts/reslop-check.mts --apply --from 2026-08-19
import { readFileSync } from 'node:fs'
for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const APPLY = process.argv.includes('--apply')
const fromIdx = process.argv.indexOf('--from')
const FROM = fromIdx > -1 ? process.argv[fromIdx + 1] : '2026-08-19'

const { getPayload } = await import('payload')
const config = (await import('../src/payload.config')).default
const { detectSlop } = await import('../src/lib/social/slop')
const { buildRepairPrompt, buildBrandConfig } = await import('../src/lib/social/generate')
const { buildSystemPrompt } = await import('../src/lib/social/prompt')
const { checkGuardrails } = await import('../src/lib/social/guardrails')
const { callClaude } = await import('../src/lib/social/claude')

const payload = await getPayload({ config })

const res = await payload.find({
  collection: 'social-posts',
  where: {
    and: [
      { status: { equals: 'draft' } },
      { scheduledTime: { greater_than_equal: `${FROM}T00:00:00.000Z` } },
    ],
  },
  sort: 'scheduledTime',
  limit: 100,
  depth: 0,
})

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — ${res.docs.length} draft(s) scheduled on/after ${FROM}\n`)

const brandCache = new Map<string, any>()
let repaired = 0
let unchanged = 0

for (const post of res.docs as Array<Record<string, any>>) {
  const brandId = String(post.brand)
  if (!brandCache.has(brandId)) {
    brandCache.set(brandId, await payload.findByID({ collection: 'brand-profiles', id: brandId, depth: 0 }))
  }
  const brandConfig = buildBrandConfig(brandCache.get(brandId))
  const disclaimers = brandConfig.requiredDisclaimers

  const before = detectSlop(post.copy, { requiredDisclaimers: disclaimers })
  if (before.ok) {
    console.log(`  post ${post.id}  clean`)
    unchanged++
    continue
  }

  console.log(`  post ${post.id}  ${before.flags.map((f) => f.rule).join(', ')}`)
  for (const f of before.flags) console.log(`      ${f.rule}: ${f.excerpt.slice(0, 90)}`)

  const system = buildSystemPrompt(brandConfig)
  const { text } = await callClaude(system, buildRepairPrompt(post.copy, before.flags, 'prose'))
  const candidate = text.trim()
  const after = detectSlop(candidate, { requiredDisclaimers: disclaimers })
  const keptDisclaimer =
    checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers).missingDisclaimers.length === 0

  if (!candidate || after.flags.length >= before.flags.length || !keptDisclaimer) {
    console.log(`      repair rejected (${after.flags.length} flags, disclaimer ${keptDisclaimer ? 'ok' : 'DROPPED'}) — leaving as is\n`)
    unchanged++
    continue
  }

  console.log(`      → ${candidate.slice(0, 140).replace(/\n/g, ' ')}\n`)

  if (APPLY) {
    const g = checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers)
    const flagParts: string[] = []
    if (g.bannedHits.length) flagParts.push(`banned: ${g.bannedHits.join(', ')}`)
    if (g.missingDisclaimers.length) flagParts.push(`missing disclaimers: ${g.missingDisclaimers.join(' | ')}`)
    if (after.flags.length) {
      flagParts.push(`slop: ${[...new Set(after.flags.map((f) => f.rule))].join(', ')}`)
    }
    await payload.update({
      collection: 'social-posts',
      id: post.id,
      context: { skipNotify: true },
      data: {
        copy: candidate,
        generationMeta: {
          ...(post.generationMeta || {}),
          originalCopy: candidate,
          guardrailFlags: flagParts.join('; '),
        },
      },
    })
  }
  repaired++
}

console.log(`\n${APPLY ? 'repaired' : 'would repair'}: ${repaired}   unchanged: ${unchanged}`)
process.exit(0)
```

- [ ] **Step 3: Dry run and read every diff**

```bash
cd /home/bitnami/stack/excelent-site
node --import tsx scripts/reslop-check.mts 2>&1 | tee /tmp/claude-1000/-home-bitnami/reslop-dryrun.txt
```

Expected: nine posts listed (ids 69, 71–78), roughly seven flagged for `emDash`.

**Read the proposed rewrites before continuing.** Two specific things to check, both from the 07-31 audit: no figure may change, and no aggregate may be re-attributed to a single practice. Post 60 once turned *"Across partner practices, PS | Connect has delivered 192 kept appointments"* into *"A Southeast ENT practice saw that across 192 kept appointments"* — the figure was real, the attribution invented. If a rewrite does anything like that, stop and report it rather than applying.

- [ ] **Step 4: Apply**

```bash
node --import tsx scripts/reslop-check.mts --apply 2>&1 | tail -30
```

Verify against the database:

```bash
export PGPASSWORD=ExcelENT2024Secure
psql -h localhost -U excelent -d excelent_cms -c \
  "select id, (copy like '%—%') emdash, generation_meta_guardrail_flags from social_posts where scheduled_time >= '2026-08-19' order by scheduled_time;"
```

Expected: the em-dash column now reads `f` for the repaired posts. (Confirm the flags column name from `\d social_posts` — Payload flattens `generationMeta.guardrailFlags`.)

- [ ] **Step 5: Restart the scheduler**

```bash
pm2 start social-scheduler && pm2 list --no-color | grep social-
```

Expected: all three processes online.

- [ ] **Step 6: Commit**

```bash
git add scripts/reslop-check.mts
git commit -m "chore(social): backfill script to re-slop-check future drafts"
```

---

### Task 8: Deploy and verify

**Files:** none — build and restart only.

- [ ] **Step 1: Full test suite**

```bash
cd /home/bitnami/stack/excelent-site && npm test 2>&1 | tail -20
```

Expected: every suite green.

- [ ] **Step 2: Production build**

```bash
cd /home/bitnami/stack/excelent-site && npm run build 2>&1 | tail -30
```

Expected: exit 0. A type error here is most likely `PostFormat` not exported from `types.ts` or `ParsedDraft.format` missing from a call site.

- [ ] **Step 3: Restart the app and the workers**

The scheduler runs the planner and holds its own Payload instance, so it needs the new code too.

```bash
pm2 restart excelent-site social-scheduler && pm2 list --no-color | grep -E 'excelent-site|social-'
```

Expected: all three online. Then confirm the sites answer:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://excelentmedical.com
curl -s -o /dev/null -w '%{http_code}\n' https://patients.excelentmedical.com
```

Expected: `200` from both.

- [ ] **Step 4: Generate one live draft and inspect it**

```bash
cd /home/bitnami/stack/excelent-site
node --import tsx scripts/generate-smoke.mts ps-rcm "The hidden cost of denials" linkedin 1
```

Then read what it wrote:

```bash
export PGPASSWORD=ExcelENT2024Secure
psql -h localhost -U excelent -d excelent_cms -c \
  "select id, generation_meta_prompt_version, generation_meta_guardrail_flags, copy from social_posts order by id desc limit 1;"
```

Expected: `promptVersion` is `v3-bullets`. The draft is a real post — delete it in the admin if it is not wanted on the calendar.

- [ ] **Step 5: Re-run the corpus audit against the 07-31 baseline**

```bash
cd /home/bitnami/tools/social && python3 analyze-corpus.py
```

That script is the reason this problem was ever visible; it stays the measurement of record. Compare against the 07-31 baseline (88% em dash, 29% colon reveal, 27% X-not-Y, 23% dramatic fragment).

- [ ] **Step 6: Update the changelog and commit**

Add an entry to `CHANGELOG.md` at the project root describing the slop detector, the corpus quality gate, bullets, and the backfill.

```bash
git add CHANGELOG.md
git commit -m "docs: changelog for social writing-quality work"
```

- [ ] **Step 7: Hand the push back to the user**

Do **not** push. Report the commit range and let the user push `feat/social-agent-phase-a` from their own terminal.

---

## Follow-ups (not in this plan)

- **Cross-post repetition.** Posts 73 and 78 both open "Generic healthcare software…"; four posts share "partner practices, that has meant". A per-post detector cannot catch this — it needs corpus comparison. The quality gate reduces it indirectly by not feeding duplicate openers back in.
- **`/api/social/revise`** gets no slop check. Small change once `slop.ts` exists.
- **Check the em-dash rate again after one week** of live generation. That number is what says whether the gate held where the prompt-only fix decayed.
