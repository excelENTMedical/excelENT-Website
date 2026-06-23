# Social Post Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Email the right people at four social-post lifecycle moments — draft generated, review window open, 24h approval reminder, and published.

**Architecture:** Pure, unit-tested logic in `src/lib/social/notify/` (timezone math, due-detection, recipient resolution, email rendering, send orchestration). Immediate events (generated, published) fire from a Payload `afterChange` hook on `social-posts`; time-based events (review, reminder) fire from a dedicated 60s pm2 poller `scripts/social-notifications.mts`. Email goes through the already-registered SES adapter via `payload.sendEmail`.

**Tech Stack:** TypeScript, Payload CMS 3, Next.js 15, Postgres 15, `node:test` + `tsx`, AWS SES (`@aws-sdk/client-sesv2` via `src/lib/sesEmailAdapter.ts`), pm2.

## Global Constraints

- **Scope is notifications only** — never create, schedule, or publish posts here.
- **Email is the only channel.** Send via `payload.sendEmail({ to, subject, html })`.
- **All time math uses `America/New_York`** (business-day counting + the send hour).
- **Idempotent:** every send is guarded by a `notify.*` timestamp on the post; the 60s poller must never double-send.
- **Email failures must NEVER block a save or a tick** — wrap every send in try/catch and log.
- **Lead-time default = 2 business days** (`SOCIAL_REVIEW_LEAD_DAYS`), which lands review emails on the team's stated days: Company→Thu, RCM→Fri, Lexi→Mon, Connect→Tue.
- **Rejected** posts get no review/reminder. **Approved** or already **sent/publishing** posts get no reminder.
- **Payload type codegen is broken in this env** — after editing collections, hand-patch `src/payload-types.ts` (both the main interface and the `*Select` interface). `npm run build` fails on missing fields otherwise.
- **`push:true` does not create prod tables** — derive additive DDL with `scripts/schema-preview.mts`, filter unrelated drift, apply in a `BEGIN/COMMIT` txn with `psql -v ON_ERROR_STOP=1`.
- **Test style:** `import { test } from 'node:test'` + `import assert from 'node:assert/strict'`. Inject `now`/`payload` for determinism (mirrors `src/lib/social/publish/publish.ts`).
- Run all tests: `npm test`. Run one file: `node --import tsx --test "<path>.test.ts"`.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/social/notify/types.ts` | Shared types: `NotifyEvent`, `NotifyPost`, `NotifyBrand`, `NotifyConfig` |
| `src/lib/social/notify/config.ts` | `loadNotifyConfig(env)` — read settings from env with defaults |
| `src/lib/social/notify/businessDays.ts` | ET timezone math: `zonedYMD`, `zonedToUtc`, `businessDaysBefore`, `reviewSendAt` |
| `src/lib/social/notify/due.ts` | `reviewDue`, `reminderDue`, `immediateEvents` — when each event fires |
| `src/lib/social/notify/recipients.ts` | `ownerEmails`, `recipientsFor` — who to email per event |
| `src/lib/social/notify/email.ts` | `renderEmail` — subject + HTML body per event |
| `src/lib/social/notify/send.ts` | `notify`, `stampNotify`, `withBrand` — orchestrate send + idempotency stamp |
| `src/lib/social/notify/hook.ts` | `socialPostsAfterChange` — Payload afterChange handler for immediate events |
| `src/collections/BrandProfiles.ts` | + `reviewers` email array field |
| `src/collections/SocialPosts.ts` | + `notify` group; register `afterChange` hook |
| `src/payload-types.ts` | hand-patched to mirror the two collection changes |
| `scripts/social-notifications.mts` | pm2 worker: 60s poll for review/reminder-due posts |
| `scripts/apply-social-notify-columns.sql` | additive DDL (derived from schema-preview) |
| `.env` | `SOCIAL_TEAM_EMAILS`, `SOCIAL_REVIEW_LEAD_DAYS`, `SOCIAL_NOTIFY_HOUR_ET` |

---

### Task 1: Shared types + config loader

**Files:**
- Create: `src/lib/social/notify/types.ts`
- Create: `src/lib/social/notify/config.ts`
- Test: `src/lib/social/notify/config.test.ts`

**Interfaces:**
- Produces: `NotifyEvent = 'generated' | 'review' | 'reminder' | 'published'`; `NotifyPost`, `NotifyBrand`, `NotifyConfig` interfaces; `loadNotifyConfig(env?: NodeJS.ProcessEnv): NotifyConfig`.

- [ ] **Step 1: Write `types.ts`** (no test — pure types)

```ts
// src/lib/social/notify/types.ts
export type NotifyEvent = 'generated' | 'review' | 'reminder' | 'published'

export interface NotifyBrand {
  name?: string | null
  slug?: string | null
  reviewers?: Array<{ email?: string | null }> | null
}

export interface NotifyPost {
  id: string | number
  title?: string | null
  copy: string
  platform: string
  language?: string | null
  theme?: string | null
  scheduledTime?: string | null
  status: 'draft' | 'needs-changes' | 'approved' | 'rejected'
  publish?: { state?: string | null } | null
  generationMeta?: { guardrailFlags?: string | null } | null
  notify?: {
    generatedAt?: string | null
    reviewSentAt?: string | null
    reminderSentAt?: string | null
    publishedNotifiedAt?: string | null
  } | null
  brand?: NotifyBrand | string | number | null
}

export interface NotifyConfig {
  leadDays: number
  hourEt: number
  tz: string
  teamEmails: string[]
  serverUrl: string
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/social/notify/config.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadNotifyConfig } from './config'

test('defaults when env is empty', () => {
  const c = loadNotifyConfig({})
  assert.equal(c.leadDays, 2)
  assert.equal(c.hourEt, 9)
  assert.equal(c.tz, 'America/New_York')
  assert.deepEqual(c.teamEmails, [])
  assert.equal(c.serverUrl, '')
})

test('parses team emails and trims serverUrl trailing slash', () => {
  const c = loadNotifyConfig({
    SOCIAL_TEAM_EMAILS: ' a@x.com, b@x.com ,',
    SOCIAL_REVIEW_LEAD_DAYS: '3',
    SOCIAL_NOTIFY_HOUR_ET: '8',
    NEXT_PUBLIC_SERVER_URL: 'https://admin.example.com/',
  })
  assert.deepEqual(c.teamEmails, ['a@x.com', 'b@x.com'])
  assert.equal(c.leadDays, 3)
  assert.equal(c.hourEt, 8)
  assert.equal(c.serverUrl, 'https://admin.example.com')
})

test('falls back to defaults on non-numeric env', () => {
  const c = loadNotifyConfig({ SOCIAL_REVIEW_LEAD_DAYS: 'abc', SOCIAL_NOTIFY_HOUR_ET: '' })
  assert.equal(c.leadDays, 2)
  assert.equal(c.hourEt, 9)
})
```

- [ ] **Step 3: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/config.test.ts"`
Expected: FAIL — `Cannot find module './config'`.

- [ ] **Step 4: Write `config.ts`**

```ts
// src/lib/social/notify/config.ts
import type { NotifyConfig } from './types'

function num(v: string | undefined, fallback: number): number {
  const n = Number(v)
  return v !== undefined && v !== '' && Number.isFinite(n) ? n : fallback
}

export function loadNotifyConfig(env: NodeJS.ProcessEnv = process.env): NotifyConfig {
  return {
    leadDays: num(env.SOCIAL_REVIEW_LEAD_DAYS, 2),
    hourEt: num(env.SOCIAL_NOTIFY_HOUR_ET, 9),
    tz: 'America/New_York',
    teamEmails: (env.SOCIAL_TEAM_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    serverUrl: (env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, ''),
  }
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/config.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/notify/types.ts src/lib/social/notify/config.ts src/lib/social/notify/config.test.ts
git commit -m "feat(social): notify types + config loader"
```

---

### Task 2: ET business-day math

**Files:**
- Create: `src/lib/social/notify/businessDays.ts`
- Test: `src/lib/social/notify/businessDays.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `zonedYMD(date: Date, tz: string): { y: number; m: number; d: number }`; `zonedToUtc(y, m, d, hour, minute, tz): Date`; `businessDaysBefore(scheduled: Date, n: number, tz: string): { y; m; d }`; `reviewSendAt(scheduledTime: string, leadDays: number, hourEt: number, tz: string): Date`.

- [ ] **Step 1: Write the failing test**

These dates are real 2026 weekdays: 2026-06-22 = Monday, 06-23 = Tuesday, 06-24 = Wednesday, 06-25 = Thursday. June is EDT (UTC-4), so 09:00 ET = 13:00Z. January is EST (UTC-5), so 09:00 ET = 14:00Z.

```ts
// src/lib/social/notify/businessDays.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { zonedYMD, reviewSendAt } from './businessDays'

const TZ = 'America/New_York'

test('zonedYMD reports the ET calendar date across a UTC midnight boundary', () => {
  // 02:00Z is still the previous evening (22:00 EDT) in New York
  assert.deepEqual(zonedYMD(new Date('2026-06-25T02:00:00Z'), TZ), { y: 2026, m: 6, d: 24 })
})

test('review lands 2 business days before each weekday go-live, 09:00 ET', () => {
  // Company: Monday go-live -> Thursday prior week
  assert.equal(reviewSendAt('2026-06-22T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-18T13:00:00.000Z')
  // RCM: Tuesday -> Friday prior week
  assert.equal(reviewSendAt('2026-06-23T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-19T13:00:00.000Z')
  // Lexi: Wednesday -> Monday
  assert.equal(reviewSendAt('2026-06-24T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-22T13:00:00.000Z')
  // Connect: Thursday -> Tuesday
  assert.equal(reviewSendAt('2026-06-25T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-23T13:00:00.000Z')
})

test('handles EST (winter) offset', () => {
  // 2026-01-07 is a Wednesday; 2 business days before = Monday 2026-01-05, 09:00 EST = 14:00Z
  assert.equal(reviewSendAt('2026-01-07T15:00:00Z', 2, 9, TZ).toISOString(), '2026-01-05T14:00:00.000Z')
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/businessDays.test.ts"`
Expected: FAIL — `Cannot find module './businessDays'`.

- [ ] **Step 3: Write `businessDays.ts`**

```ts
// src/lib/social/notify/businessDays.ts
const MS_DAY = 86_400_000

interface YMD {
  y: number
  m: number
  d: number
}

function partsIn(date: Date, tz: string, withTime: boolean): Record<string, number> {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {}),
  })
  const out: Record<string, number> = {}
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  if (out.hour === 24) out.hour = 0 // some engines emit "24" at midnight
  return out
}

export function zonedYMD(date: Date, tz: string): YMD {
  const p = partsIn(date, tz, false)
  return { y: p.year, m: p.month, d: p.day }
}

// ms to add to `date.getTime()` so the result equals the same wall clock read as UTC.
function tzOffsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz, true)
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUTC - date.getTime()
}

export function zonedToUtc(y: number, m: number, d: number, hour: number, minute: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, hour, minute)
  const offset = tzOffsetMs(new Date(guess), tz)
  return new Date(guess - offset)
}

export function businessDaysBefore(scheduled: Date, n: number, tz: string): YMD {
  const { y, m, d } = zonedYMD(scheduled, tz)
  let cur = Date.UTC(y, m - 1, d)
  let counted = 0
  while (counted < n) {
    cur -= MS_DAY
    const dow = new Date(cur).getUTCDay() // 0=Sun .. 6=Sat
    if (dow !== 0 && dow !== 6) counted++
  }
  const dt = new Date(cur)
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
}

export function reviewSendAt(scheduledTime: string, leadDays: number, hourEt: number, tz: string): Date {
  const { y, m, d } = businessDaysBefore(new Date(scheduledTime), leadDays, tz)
  return zonedToUtc(y, m, d, hourEt, 0, tz)
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/businessDays.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/notify/businessDays.ts src/lib/social/notify/businessDays.test.ts
git commit -m "feat(social): ET business-day math for review timing"
```

---

### Task 3: Due-detection

**Files:**
- Create: `src/lib/social/notify/due.ts`
- Test: `src/lib/social/notify/due.test.ts`

**Interfaces:**
- Consumes: `reviewSendAt` (Task 2); `NotifyPost`, `NotifyConfig`, `NotifyEvent` (Task 1).
- Produces: `reviewDue(post: NotifyPost, now: Date, cfg: NotifyConfig): boolean`; `reminderDue(post: NotifyPost, now: Date): boolean`; `immediateEvents(args: { operation: 'create' | 'update'; doc: NotifyPost; previousDoc?: NotifyPost | null }): NotifyEvent[]`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/notify/due.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewDue, reminderDue, immediateEvents } from './due'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: [], serverUrl: '' }
const base: NotifyPost = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-06-24T15:00:00Z' }
// review for this post fires at 2026-06-22T13:00:00Z

test('reviewDue true once now passes the send instant', () => {
  assert.equal(reviewDue(base, new Date('2026-06-22T13:00:00Z'), cfg), true)
  assert.equal(reviewDue(base, new Date('2026-06-22T12:59:00Z'), cfg), false)
})

test('reviewDue false when already sent, rejected, or unscheduled', () => {
  const now = new Date('2026-06-23T00:00:00Z')
  assert.equal(reviewDue({ ...base, notify: { reviewSentAt: '2026-06-22T13:00:00Z' } }, now, cfg), false)
  assert.equal(reviewDue({ ...base, status: 'rejected' }, now, cfg), false)
  assert.equal(reviewDue({ ...base, scheduledTime: null }, now, cfg), false)
})

test('reminderDue true within 24h when not approved/rejected', () => {
  // go-live 2026-06-24T15:00:00Z -> deadline 2026-06-23T15:00:00Z
  assert.equal(reminderDue(base, new Date('2026-06-23T15:00:00Z')), true)
  assert.equal(reminderDue(base, new Date('2026-06-23T14:59:00Z')), false)
})

test('reminderDue false when approved, rejected, already sent, or already reminded', () => {
  const now = new Date('2026-06-24T00:00:00Z')
  assert.equal(reminderDue({ ...base, status: 'approved' }, now), false)
  assert.equal(reminderDue({ ...base, status: 'rejected' }, now), false)
  assert.equal(reminderDue({ ...base, publish: { state: 'sent' } }, now), false)
  assert.equal(reminderDue({ ...base, notify: { reminderSentAt: '2026-06-23T16:00:00Z' } }, now), false)
})

test('immediateEvents flags generated on create', () => {
  assert.deepEqual(immediateEvents({ operation: 'create', doc: base }), ['generated'])
  assert.deepEqual(immediateEvents({ operation: 'create', doc: { ...base, notify: { generatedAt: 'x' } } }), [])
  assert.deepEqual(immediateEvents({ operation: 'update', doc: base }), [])
})

test('immediateEvents flags published on transition into sent', () => {
  const sent = { ...base, publish: { state: 'sent' } }
  assert.deepEqual(
    immediateEvents({ operation: 'update', doc: sent, previousDoc: { ...base, publish: { state: 'publishing' } } }),
    ['published'],
  )
  // no transition: was already sent
  assert.deepEqual(immediateEvents({ operation: 'update', doc: sent, previousDoc: sent }), [])
  // already notified
  assert.deepEqual(
    immediateEvents({ operation: 'update', doc: { ...sent, notify: { publishedNotifiedAt: 'x' } }, previousDoc: base }),
    [],
  )
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/due.test.ts"`
Expected: FAIL — `Cannot find module './due'`.

- [ ] **Step 3: Write `due.ts`**

```ts
// src/lib/social/notify/due.ts
import type { NotifyConfig, NotifyEvent, NotifyPost } from './types'
import { reviewSendAt } from './businessDays'

const TERMINAL = new Set(['sent', 'publishing'])
const DAY_MS = 24 * 3_600_000

export function reviewDue(post: NotifyPost, now: Date, cfg: NotifyConfig): boolean {
  if (!post.scheduledTime) return false
  if (post.status === 'rejected') return false
  if (post.notify?.reviewSentAt) return false
  return now.getTime() >= reviewSendAt(post.scheduledTime, cfg.leadDays, cfg.hourEt, cfg.tz).getTime()
}

export function reminderDue(post: NotifyPost, now: Date): boolean {
  if (!post.scheduledTime) return false
  if (post.status === 'approved' || post.status === 'rejected') return false
  if (TERMINAL.has(post.publish?.state ?? '')) return false
  if (post.notify?.reminderSentAt) return false
  const deadline = new Date(post.scheduledTime).getTime() - DAY_MS
  return now.getTime() >= deadline
}

export function immediateEvents(args: {
  operation: 'create' | 'update'
  doc: NotifyPost
  previousDoc?: NotifyPost | null
}): NotifyEvent[] {
  const { operation, doc, previousDoc } = args
  const events: NotifyEvent[] = []
  if (operation === 'create' && !doc.notify?.generatedAt) events.push('generated')
  const nowSent = doc.publish?.state === 'sent'
  const wasSent = previousDoc?.publish?.state === 'sent'
  if (nowSent && !wasSent && !doc.notify?.publishedNotifiedAt) events.push('published')
  return events
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/due.test.ts"`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/notify/due.ts src/lib/social/notify/due.test.ts
git commit -m "feat(social): notification due-detection"
```

---

### Task 4: Recipient resolution

**Files:**
- Create: `src/lib/social/notify/recipients.ts`
- Test: `src/lib/social/notify/recipients.test.ts`

**Interfaces:**
- Consumes: `NotifyBrand`, `NotifyConfig`, `NotifyEvent`, `NotifyPost` (Task 1).
- Produces: `ownerEmails(brand: NotifyPost['brand']): string[]`; `recipientsFor(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): string[]`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/notify/recipients.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ownerEmails, recipientsFor } from './recipients'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: ['team@x.com'], serverUrl: '' }
const post: NotifyPost = {
  id: 1, copy: 'x', platform: 'linkedin', status: 'draft',
  brand: { name: 'Company', reviewers: [{ email: ' eric@x.com ' }, { email: 'zack@x.com' }, { email: '' }] },
}

test('ownerEmails extracts + trims + drops blanks', () => {
  assert.deepEqual(ownerEmails(post.brand), ['eric@x.com', 'zack@x.com'])
})

test('ownerEmails is empty when brand is an unpopulated id', () => {
  assert.deepEqual(ownerEmails(5), [])
  assert.deepEqual(ownerEmails(null), [])
})

test('recipientsFor routes published to team, others to owners', () => {
  assert.deepEqual(recipientsFor('published', post, cfg), ['team@x.com'])
  assert.deepEqual(recipientsFor('generated', post, cfg), ['eric@x.com', 'zack@x.com'])
  assert.deepEqual(recipientsFor('review', post, cfg), ['eric@x.com', 'zack@x.com'])
  assert.deepEqual(recipientsFor('reminder', post, cfg), ['eric@x.com', 'zack@x.com'])
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/recipients.test.ts"`
Expected: FAIL — `Cannot find module './recipients'`.

- [ ] **Step 3: Write `recipients.ts`**

```ts
// src/lib/social/notify/recipients.ts
import type { NotifyBrand, NotifyConfig, NotifyEvent, NotifyPost } from './types'

export function ownerEmails(brand: NotifyPost['brand']): string[] {
  if (!brand || typeof brand !== 'object') return []
  const reviewers = (brand as NotifyBrand).reviewers ?? []
  return reviewers.map((r) => (r.email ?? '').trim()).filter(Boolean)
}

export function recipientsFor(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): string[] {
  if (event === 'published') return cfg.teamEmails
  return ownerEmails(post.brand)
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/recipients.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/notify/recipients.ts src/lib/social/notify/recipients.test.ts
git commit -m "feat(social): notification recipient resolution"
```

---

### Task 5: Email rendering

**Files:**
- Create: `src/lib/social/notify/email.ts`
- Test: `src/lib/social/notify/email.test.ts`

**Interfaces:**
- Consumes: `NotifyConfig`, `NotifyEvent`, `NotifyPost` (Task 1).
- Produces: `renderEmail(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): { subject: string; html: string }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/notify/email.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderEmail } from './email'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: [], serverUrl: 'https://admin.x.com' }
const post: NotifyPost = {
  id: 42, title: 'Denials drop', copy: 'Cut denials <fast>', platform: 'linkedin', language: 'en',
  status: 'draft', scheduledTime: '2026-06-24T15:00:00Z',
  brand: { name: 'PS | RCM' },
}

test('subject names the event, brand, and title', () => {
  const { subject } = renderEmail('review', post, cfg)
  assert.match(subject, /Draft ready for review/)
  assert.match(subject, /PS \| RCM/)
  assert.match(subject, /Denials drop/)
})

test('html links to the admin edit page and escapes copy', () => {
  const { html } = renderEmail('review', post, cfg)
  assert.match(html, /https:\/\/admin\.x\.com\/admin\/collections\/social-posts\/42/)
  assert.match(html, /Cut denials &lt;fast&gt;/)
})

test('guardrail flags block appears only when flags are present', () => {
  assert.doesNotMatch(renderEmail('generated', post, cfg).html, /Guardrail flags/)
  const flagged = { ...post, generationMeta: { guardrailFlags: 'banned: cure' } }
  assert.match(renderEmail('generated', flagged, cfg).html, /Guardrail flags/)
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/email.test.ts"`
Expected: FAIL — `Cannot find module './email'`.

- [ ] **Step 3: Write `email.ts`**

```ts
// src/lib/social/notify/email.ts
import type { NotifyConfig, NotifyEvent, NotifyPost } from './types'

const LABELS: Record<NotifyEvent, string> = {
  generated: 'New draft generated',
  review: 'Draft ready for review',
  reminder: 'Approval needed — 24h to go-live',
  published: 'Post published',
}

function brandName(post: NotifyPost): string {
  const b = post.brand
  return b && typeof b === 'object' ? (b.name ?? b.slug ?? 'Unknown brand') : 'Unknown brand'
}

function fmtEt(iso: string | null | undefined, tz: string): string {
  if (!iso) return 'unscheduled'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso))
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderEmail(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): { subject: string; html: string } {
  const brand = brandName(post)
  const title = post.title || '(untitled)'
  const editUrl = `${cfg.serverUrl}/admin/collections/social-posts/${post.id}`
  const goLive = fmtEt(post.scheduledTime, cfg.tz)
  const flags = (post.generationMeta?.guardrailFlags ?? '').trim()
  const flagsBlock = flags
    ? `<p style="color:#b00"><strong>Guardrail flags:</strong> ${esc(flags)}</p>`
    : ''

  const subject = `[Social · ${brand}] ${LABELS[event]}: ${title}`
  const html = `
<h2>${esc(LABELS[event])}</h2>
<p><strong>Brand:</strong> ${esc(brand)} &middot; <strong>Platform:</strong> ${esc(post.platform)} &middot; <strong>Language:</strong> ${esc(post.language || 'en')}</p>
<p><strong>Go-live:</strong> ${esc(goLive)}</p>
${flagsBlock}
<hr />
<pre style="white-space:pre-wrap;font-family:inherit">${esc(post.copy)}</pre>
<hr />
<p><a href="${editUrl}">Review &amp; edit in admin</a></p>
`.trim()
  return { subject, html }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/email.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/notify/email.ts src/lib/social/notify/email.test.ts
git commit -m "feat(social): notification email rendering"
```

---

### Task 6: Send orchestration + idempotency stamp

**Files:**
- Create: `src/lib/social/notify/send.ts`
- Test: `src/lib/social/notify/send.test.ts`

**Interfaces:**
- Consumes: `recipientsFor` (Task 4), `renderEmail` (Task 5), types (Task 1).
- Produces:
  - `SendablePayload` — minimal payload shape: `{ sendEmail; update; findByID }`.
  - `notify(event, post, cfg, payload, nowIso): Promise<{ sent: boolean; reason?: string }>`
  - `stampNotify(payload, post, field, iso): Promise<void>`
  - `withBrand(payload, post): Promise<NotifyPost>` — populate `post.brand` from id when needed.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/notify/send.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notify, withBrand } from './send'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: ['team@x.com'], serverUrl: 'https://a.x' }

function fakePayload() {
  const calls: { emails: any[]; updates: any[]; finds: any[] } = { emails: [], updates: [], finds: [] }
  return {
    calls,
    sendEmail: async (m: any) => { calls.emails.push(m) },
    update: async (a: any) => { calls.updates.push(a) },
    findByID: async (a: any) => { calls.finds.push(a); return { name: 'Loaded', reviewers: [{ email: 'eric@x.com' }] } },
  }
}

const owned: NotifyPost = {
  id: 7, copy: 'hi', platform: 'linkedin', status: 'draft',
  brand: { name: 'PS | RCM', reviewers: [{ email: 'zack@x.com' }] },
  notify: { generatedAt: '2026-01-01T00:00:00Z' },
}

test('notify sends to owners then stamps the matching field', async () => {
  const p = fakePayload()
  const res = await notify('review', owned, cfg, p, '2026-06-22T13:00:00Z')
  assert.deepEqual(res, { sent: true })
  assert.equal(p.calls.emails.length, 1)
  assert.deepEqual(p.calls.emails[0].to, ['zack@x.com'])
  assert.equal(p.calls.updates.length, 1)
  // stamp preserves existing notify fields and sets reviewSentAt
  assert.equal(p.calls.updates[0].data.notify.generatedAt, '2026-01-01T00:00:00Z')
  assert.equal(p.calls.updates[0].data.notify.reviewSentAt, '2026-06-22T13:00:00Z')
  assert.equal(p.calls.updates[0].context.skipNotify, true)
})

test('notify skips and does not send when there are no recipients', async () => {
  const p = fakePayload()
  const res = await notify('review', { ...owned, brand: 5 }, cfg, p, '2026-06-22T13:00:00Z')
  assert.deepEqual(res, { sent: false, reason: 'no-recipients' })
  assert.equal(p.calls.emails.length, 0)
  assert.equal(p.calls.updates.length, 0)
})

test('notify published uses the team list', async () => {
  const p = fakePayload()
  await notify('published', owned, cfg, p, '2026-06-25T15:00:00Z')
  assert.deepEqual(p.calls.emails[0].to, ['team@x.com'])
  assert.equal(p.calls.updates[0].data.notify.publishedNotifiedAt, '2026-06-25T15:00:00Z')
})

test('withBrand loads the brand when it is an id, leaves populated brand alone', async () => {
  const p = fakePayload()
  const loaded = await withBrand(p, { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', brand: 99 })
  assert.equal((loaded.brand as any).name, 'Loaded')
  assert.equal(p.calls.finds[0].id, 99)

  const p2 = fakePayload()
  const already = await withBrand(p2, owned)
  assert.equal((already.brand as any).name, 'PS | RCM')
  assert.equal(p2.calls.finds.length, 0)
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/send.test.ts"`
Expected: FAIL — `Cannot find module './send'`.

- [ ] **Step 3: Write `send.ts`**

```ts
// src/lib/social/notify/send.ts
import type { NotifyEvent, NotifyConfig, NotifyPost } from './types'
import { recipientsFor } from './recipients'
import { renderEmail } from './email'

type StampField = 'generatedAt' | 'reviewSentAt' | 'reminderSentAt' | 'publishedNotifiedAt'

const STAMP_FIELD: Record<NotifyEvent, StampField> = {
  generated: 'generatedAt',
  review: 'reviewSentAt',
  reminder: 'reminderSentAt',
  published: 'publishedNotifiedAt',
}

export interface SendablePayload {
  sendEmail: (m: { to: string[]; subject: string; html: string }) => Promise<unknown>
  update: (a: { collection: string; id: string | number; data: unknown; context?: unknown }) => Promise<unknown>
  findByID: (a: { collection: string; id: string | number; depth?: number }) => Promise<unknown>
}

export async function notify(
  event: NotifyEvent,
  post: NotifyPost,
  cfg: NotifyConfig,
  payload: SendablePayload,
  nowIso: string,
): Promise<{ sent: boolean; reason?: string }> {
  const to = recipientsFor(event, post, cfg)
  if (to.length === 0) return { sent: false, reason: 'no-recipients' }
  const { subject, html } = renderEmail(event, post, cfg)
  await payload.sendEmail({ to, subject, html })
  await stampNotify(payload, post, STAMP_FIELD[event], nowIso)
  return { sent: true }
}

export async function stampNotify(
  payload: SendablePayload,
  post: NotifyPost,
  field: StampField,
  iso: string,
): Promise<void> {
  await payload.update({
    collection: 'social-posts',
    id: post.id,
    data: { notify: { ...(post.notify ?? {}), [field]: iso } },
    context: { skipNotify: true },
  })
}

export async function withBrand(payload: SendablePayload, post: NotifyPost): Promise<NotifyPost> {
  if (post.brand && typeof post.brand !== 'object') {
    const brand = (await payload.findByID({ collection: 'brand-profiles', id: post.brand, depth: 0 })) as NotifyPost['brand']
    return { ...post, brand }
  }
  return post
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/send.test.ts"`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the whole notify suite + commit**

Run: `node --import tsx --test "src/lib/social/notify/*.test.ts"`
Expected: PASS (all notify tests green).

```bash
git add src/lib/social/notify/send.ts src/lib/social/notify/send.test.ts
git commit -m "feat(social): notification send orchestration + idempotency stamp"
```

---

### Task 7: Schema fields + types + DDL

**Files:**
- Modify: `src/collections/BrandProfiles.ts` (add `reviewers` after the `active` field, ~line 26)
- Modify: `src/collections/SocialPosts.ts` (add `notify` group after the `generationMeta` group, ~line 145)
- Modify: `src/payload-types.ts` (hand-patch — codegen is broken in this env)
- Create: `scripts/apply-social-notify-columns.sql`

**Interfaces:**
- Produces: a `reviewers` array field on `brand-profiles` and a read-only `notify` group on `social-posts`, both reflected in `payload-types.ts` and the prod DB.

- [ ] **Step 1: Add `reviewers` to `BrandProfiles.ts`**

Insert immediately after the `active` field object (the `{ name: 'active', ... }` entry):

```ts
    {
      name: 'reviewers',
      type: 'array',
      labels: { singular: 'Reviewer', plural: 'Reviewers' },
      admin: { description: 'Email(s) notified to review/approve this brand’s posts.' },
      fields: [{ name: 'email', type: 'email', required: true }],
    },
```

- [ ] **Step 2: Add `notify` group to `SocialPosts.ts`**

Insert immediately after the `generationMeta` group object (the last field in the array):

```ts
    {
      name: 'notify',
      type: 'group',
      admin: { readOnly: true, description: 'Notification timestamps — set automatically.' },
      fields: [
        { name: 'generatedAt', type: 'date' },
        { name: 'reviewSentAt', type: 'date' },
        { name: 'reminderSentAt', type: 'date' },
        { name: 'publishedNotifiedAt', type: 'date' },
      ],
    },
```

- [ ] **Step 3: Hand-patch `src/payload-types.ts`**

Codegen is broken in this env (see Global Constraints). Open `src/payload-types.ts` and make four edits:

1. In the `BrandProfile` interface, add:
```ts
  reviewers?:
    | {
        email: string
        id?: string | null
      }[]
    | null
```
2. In the `BrandProfilesSelect<T>` interface, add:
```ts
  reviewers?:
    | T
    | {
        email?: T
        id?: T
      }
```
3. In the `SocialPost` interface, add:
```ts
  notify?: {
    generatedAt?: string | null
    reviewSentAt?: string | null
    reminderSentAt?: string | null
    publishedNotifiedAt?: string | null
  }
```
4. In the `SocialPostsSelect<T>` interface, add:
```ts
  notify?:
    | T
    | {
        generatedAt?: T
        reviewSentAt?: T
        reminderSentAt?: T
        publishedNotifiedAt?: T
      }
```

- [ ] **Step 4: Verify the build type-checks**

Run: `npm run build`
Expected: build completes with no type errors referencing `reviewers` or `notify`. (If it fails on those names, the interface edits in Step 3 are incomplete.)

- [ ] **Step 5: Derive the additive DDL**

Run: `npx tsx scripts/schema-preview.mts`
Expected: prints `ALTER TABLE`/`CREATE TABLE` statements. Identify ONLY the statements for the two new changes:
- the new `brand_profiles_reviewers` array table (and any FK/index on it),
- the `notify_*` timestamp columns on `social_posts`,
- the `version_notify_*` columns on `_social_posts_v`.

Ignore the known unrelated pre-existing drift on `faqs`/`users`/`testimonials`/`demo_requests` (same filter used for prior schema syncs — see `project_social_agent` memory).

- [ ] **Step 6: Write `scripts/apply-social-notify-columns.sql`**

Paste the exact statements captured in Step 5, wrapped in a transaction:

```sql
BEGIN;
-- << paste the brand_profiles_reviewers CREATE TABLE (+ FK/index) from schema-preview >>
-- << paste the social_posts notify_* ADD COLUMN statements from schema-preview >>
-- << paste the _social_posts_v version_notify_* ADD COLUMN statements from schema-preview >>
COMMIT;
```

(DDL is applied in Task 10, against prod, after review. Do not apply here.)

- [ ] **Step 7: Commit**

```bash
git add src/collections/BrandProfiles.ts src/collections/SocialPosts.ts src/payload-types.ts scripts/apply-social-notify-columns.sql
git commit -m "feat(social): reviewers + notify schema fields, types, DDL"
```

---

### Task 8: afterChange hook for immediate events

**Files:**
- Create: `src/lib/social/notify/hook.ts`
- Test: `src/lib/social/notify/hook.test.ts`
- Modify: `src/collections/SocialPosts.ts` (register the hook)

**Interfaces:**
- Consumes: `immediateEvents` (Task 3), `notify`/`withBrand` (Task 6), `loadNotifyConfig` (Task 1).
- Produces: `socialPostsAfterChange` — a Payload `CollectionAfterChangeHook`. Skips when `context.skipNotify` is set (prevents the stamp-update from re-triggering).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/social/notify/hook.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { socialPostsAfterChange } from './hook'

function fakeReq() {
  const calls: { emails: any[]; updates: any[]; finds: any[]; errors: any[] } = { emails: [], updates: [], finds: [], errors: [] }
  const payload = {
    sendEmail: async (m: any) => { calls.emails.push(m) },
    update: async (a: any) => { calls.updates.push(a) },
    findByID: async (a: any) => { calls.finds.push(a); return { name: 'RCM', reviewers: [{ email: 'zack@x.com' }] } },
    logger: { error: (...a: any[]) => { calls.errors.push(a) } },
  }
  return { req: { payload }, calls }
}

const env = { SOCIAL_TEAM_EMAILS: 'team@x.com', NEXT_PUBLIC_SERVER_URL: 'https://a.x' }

test('create sends generated to owners (loading brand by id)', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: {}, env })
  assert.equal(calls.finds[0].id, 3)
  assert.deepEqual(calls.emails[0].to, ['zack@x.com'])
  assert.equal(calls.updates[0].data.notify.generatedAt !== undefined, true)
})

test('publish transition sends published to team', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'approved', brand: 3, publish: { state: 'sent' } }
  const previousDoc = { ...doc, publish: { state: 'publishing' } }
  await socialPostsAfterChange({ doc, previousDoc, operation: 'update', req, context: {}, env })
  assert.deepEqual(calls.emails[0].to, ['team@x.com'])
})

test('skipNotify context short-circuits (no recursion)', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: { skipNotify: true }, env })
  assert.equal(calls.emails.length, 0)
})

test('a send failure is swallowed and logged, never thrown', async () => {
  const { req, calls } = fakeReq()
  req.payload.sendEmail = async () => { throw new Error('SES down') }
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: {}, env })
  assert.equal(calls.errors.length, 1)
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --import tsx --test "src/lib/social/notify/hook.test.ts"`
Expected: FAIL — `Cannot find module './hook'`.

- [ ] **Step 3: Write `hook.ts`**

The handler takes an optional `env` for testability (defaults to `process.env` in production). Loosely typed args keep it unit-testable without constructing a full Payload `req`.

```ts
// src/lib/social/notify/hook.ts
import { loadNotifyConfig } from './config'
import { immediateEvents } from './due'
import { notify, withBrand } from './send'
import type { NotifyPost } from './types'

interface AfterChangeArgs {
  doc: NotifyPost
  previousDoc?: NotifyPost | null
  operation: 'create' | 'update'
  req: { payload: any }
  context?: { skipNotify?: boolean }
  env?: NodeJS.ProcessEnv
}

export async function socialPostsAfterChange(args: AfterChangeArgs): Promise<NotifyPost> {
  const { doc, previousDoc, operation, req, context, env } = args
  if (context?.skipNotify) return doc

  const events = immediateEvents({ operation, doc, previousDoc })
  if (events.length === 0) return doc

  const cfg = loadNotifyConfig(env ?? process.env)
  const nowIso = new Date().toISOString()
  // Owner-routed events need a populated brand; published (team-routed) does not.
  const post = events.some((e) => e !== 'published') ? await withBrand(req.payload, doc) : doc

  for (const event of events) {
    try {
      await notify(event, post, cfg, req.payload, nowIso)
    } catch (err) {
      req.payload.logger?.error({ err }, `social-notify: ${event} email failed for post ${doc.id}`)
    }
  }
  return doc
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `node --import tsx --test "src/lib/social/notify/hook.test.ts"`
Expected: PASS (4 tests).

- [ ] **Step 5: Register the hook in `SocialPosts.ts`**

Add the import at the top of `src/collections/SocialPosts.ts`:

```ts
import { socialPostsAfterChange } from '@/lib/social/notify/hook'
```

Add a `hooks` block inside the `SocialPosts` config object, right after the `access` block:

```ts
  hooks: {
    afterChange: [
      ({ doc, previousDoc, operation, req, context }) =>
        socialPostsAfterChange({ doc: doc as any, previousDoc: previousDoc as any, operation, req: req as any, context: context as any }),
    ],
  },
```

- [ ] **Step 6: Verify the build type-checks**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/social/notify/hook.ts src/lib/social/notify/hook.test.ts src/collections/SocialPosts.ts
git commit -m "feat(social): afterChange hook for generated + published emails"
```

---

### Task 9: Time-based notifications worker

**Files:**
- Create: `scripts/social-notifications.mts`

**Interfaces:**
- Consumes: `getPayloadClient` (`src/lib/payload`), `loadNotifyConfig`, `reviewDue`/`reminderDue` (Task 3), `notify`/`withBrand` (Task 6).
- Produces: a long-running pm2 worker (no exports).

- [ ] **Step 1: Write the worker** (mirrors `scripts/social-scheduler.mts`)

```ts
// scripts/social-notifications.mts
/**
 * Polls every 60s for scheduled posts whose review-window or 24h-approval
 * reminder is due, and emails the brand owner(s). Idempotent via notify.*
 * stamps written by notify(). Run under pm2 (see plan Task 10).
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { loadNotifyConfig } = await import('../src/lib/social/notify/config')
const { reviewDue, reminderDue } = await import('../src/lib/social/notify/due')
const { notify, withBrand } = await import('../src/lib/social/notify/send')

const POLL_MS = 60_000
const cfg = loadNotifyConfig()
const payload = await getPayloadClient()

async function tick(): Promise<void> {
  const now = new Date()
  const res = await payload.find({
    collection: 'social-posts',
    where: { and: [{ scheduledTime: { exists: true } }, { status: { not_equals: 'rejected' } }] },
    depth: 0,
    limit: 50,
  })
  for (const raw of res.docs as any[]) {
    try {
      const post = await withBrand(payload as any, raw)
      if (reviewDue(post, now, cfg)) await notify('review', post, cfg, payload as any, now.toISOString())
      if (reminderDue(post, now)) await notify('reminder', post, cfg, payload as any, now.toISOString())
    } catch (err) {
      payload.logger.error({ err }, `social-notifications: failed for post ${raw.id}`)
    }
  }
}

payload.logger.info('social-notifications: started')
// eslint-disable-next-line no-constant-condition
while (true) {
  try {
    await tick()
  } catch (err) {
    payload.logger.error({ err }, 'social-notifications: tick error')
  }
  await new Promise((r) => setTimeout(r, POLL_MS))
}
```

- [ ] **Step 2: Smoke-run one tick against the dev DB**

(Requires the DDL from Task 7 applied locally, or run against prod read in Task 10.) Start it, confirm the `started` log line and no crash, then stop with Ctrl-C:

Run: `npx tsx scripts/social-notifications.mts`
Expected: logs `social-notifications: started`, then idles (one tick per 60s) without throwing.

- [ ] **Step 3: Commit**

```bash
git add scripts/social-notifications.mts
git commit -m "feat(social): time-based review/reminder notifications worker"
```

---

### Task 10: Deploy — env, Company profile, DDL, pm2, verify

**Files:**
- Modify: `.env` (uncommitted on this box — not in git)

This task is operational; it has no unit test. Each step ends in an observable check.

- [ ] **Step 1: Confirm SES works** (before relying on it)

Run: `npx tsx scripts/test-email.ts you@excelentmedical.com`
Expected: `sent. messageId: ...` and the email arrives. If it errors, fix SES (verified identities / sandbox) before continuing.

- [ ] **Step 2: Add env vars** to `/home/bitnami/stack/excelent-site/.env`

```
SOCIAL_TEAM_EMAILS=eric@excelentmedical.com,zack@excelentmedical.com,samir@excelentmedical.com,ai@excelentmedical.com
SOCIAL_REVIEW_LEAD_DAYS=2
SOCIAL_NOTIFY_HOUR_ET=9
```

(Use the team's real addresses. `NEXT_PUBLIC_SERVER_URL` already exists — confirm it points at the admin host.)

- [ ] **Step 3: Apply the DDL to prod** (the Task 7 additive columns)

Re-derive to be safe, then apply in a transaction:

Run:
```bash
cd /home/bitnami/stack/excelent-site
npx tsx scripts/schema-preview.mts   # confirm apply-social-notify-columns.sql still matches
PGPASSWORD=ExcelENT2024Secure psql -h localhost -U excelent -d excelent_cms -v ON_ERROR_STOP=1 -f scripts/apply-social-notify-columns.sql
```
Expected: `BEGIN ... COMMIT`, no errors. Re-running `schema-preview.mts` should now show no `reviewers`/`notify` statements.

- [ ] **Step 4: Rebuild + reload the Next app** (loads the hook + new fields)

Run: `npm run build && pm2 restart excelent-site`
Expected: build succeeds, pm2 shows `excelent-site` online.

- [ ] **Step 5: Create the Company brand profile + set reviewers**

In the admin (`/admin/collections/brand-profiles`):
- Create a profile: **Name** "Company", **slug** `company`, **voice** (short company-voice text), **platforms** linkedin/facebook.
- Set **Reviewers** on each profile: Company → eric@, zack@; `ps-rcm` → zack@; `ps-lexi` → eric@; `ps-connect` → samir@.

Expected: profiles save; reviewers persist (confirms the array table from Step 3).

- [ ] **Step 6: Start the notifications worker under pm2**

Run:
```bash
cd /home/bitnami/stack/excelent-site
pm2 start npx --name social-notifications -- tsx scripts/social-notifications.mts
pm2 save
```
Expected: `pm2 list` shows `social-notifications` online; `pm2 logs social-notifications --lines 20` shows `social-notifications: started`.

- [ ] **Step 7: End-to-end smoke**

1. In admin, create a draft post on a brand that has reviewers, leave `scheduledTime` empty → confirm the **generated** email arrives to that brand's owner(s).
2. Edit a draft: set `scheduledTime` to ~23h from now → within a minute the worker should send the **reminder** email (24h window already open). Confirm arrival, and that `notify.reminderSentAt` is now set and no duplicate arrives next tick.
3. Approve + publish a post (LinkedIn) → confirm the **published** email goes to `SOCIAL_TEAM_EMAILS`.

Expected: each email arrives exactly once. Note any gap as a follow-up.

- [ ] **Step 8: Commit any doc/notes** (the `.env` is not committed)

```bash
git add -A
git commit -m "chore(social): notifications deploy notes" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:**
- Four events (generated / review / reminder / published) → Tasks 3 (detection), 5 (rendering), 6/8 (immediate send), 9 (time-based send). ✓
- Recipients (owners for generated/review/reminder; team for published) → Task 4 + `recipientsFor`. ✓
- Owner fields on Brand Profile + Company profile → Task 7 (`reviewers`), Task 10 Step 5. ✓
- Idempotency stamps → Task 7 (`notify` group), Task 6 (`stampNotify`), enforced in Tasks 3/9. ✓
- Lead-time = 2 business days, ET, 9am, DST-safe → Tasks 1/2. ✓
- 24h reminder only when not approved/rejected/sent → Task 3 `reminderDue`. ✓
- No `scheduledTime` ⇒ generated only → `reviewDue`/`reminderDue` return false on null `scheduledTime` (Task 3). ✓
- Email failures never block save/tick → Task 8 (hook try/catch), Task 9 (tick try/catch). ✓
- Broken codegen ⇒ hand-patch types → Task 7 Step 3. ✓
- push:true no-op ⇒ manual DDL via schema-preview → Task 7 Steps 5-6, Task 10 Step 3. ✓
- Dedicated pm2 worker, env settings, SES already wired → Tasks 9/10. ✓

**Placeholder scan:** The only intentional fill-ins are the SQL statements in `apply-social-notify-columns.sql` (Task 7 Step 6) — deliberately derived from `schema-preview.mts` rather than hand-written, per the established (and safer) schema-sync flow in project memory. All code steps contain complete code.

**Type consistency:** `NotifyEvent`, `NotifyPost`, `NotifyConfig`, `SendablePayload` are defined in Tasks 1/6 and used consistently. `notify(event, post, cfg, payload, nowIso)` signature matches across Tasks 6/8/9. `withBrand(payload, post)` and `recipientsFor(event, post, cfg)` match their definitions. `reviewSendAt(scheduledTime, leadDays, hourEt, tz)` matches between Tasks 2 and 3.
