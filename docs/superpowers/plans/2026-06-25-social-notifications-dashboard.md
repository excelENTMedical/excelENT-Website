# Social Notifications Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only, alert-first Payload admin view at `/admin/social-notifications` that surfaces social posts needing attention (awaiting approval, approval overdue, missed go-live, review-email overdue).

**Architecture:** A pure, unit-tested classification module (`buckets.ts`) assigns each post to exactly one severity-ranked bucket; a thin client component fetches Payload's built-in `/api/social-posts` REST endpoint, runs the classifier in the browser, and renders the buckets with links to each post's editor. Registration mirrors the existing `social-calendar` custom admin view.

**Tech Stack:** Next.js 15, Payload CMS 3, React 19 (client component), TypeScript, node:test + tsx for tests. No new dependencies, no DB schema change.

**Spec:** `docs/superpowers/specs/2026-06-25-social-notifications-dashboard-design.md`

## Global Constraints

- **Branch:** `feat/social-agent-phase-a`. NO worktree. Large pre-existing uncommitted tree — add ONLY each task's exact files; NEVER `git add -A` / `git add .` / `git commit -am` / `git stash`.
- **Leave UNCOMMITTED** (the user commits these from their own terminal): `src/payload.config.ts` and `src/app/(payload)/admin/importMap.js`. Task 3 modifies these two and must NOT commit them.
- **No DB schema change.** The view reads existing columns only. No DDL, no `payload-types.ts` edit, no new dependency / `package.json` change.
- **Test runner** (the quoted-glob `npm test` is broken in this env): single file —
  `node --import tsx --test src/lib/social/notify/buckets.test.ts`.
- **Cadence constants** mirror `.env`: `SOCIAL_REVIEW_LEAD_DAYS=2`, `SOCIAL_NOTIFY_HOUR_ET=9`, tz `America/New_York`.
- **Status values** (exact): `draft`, `needs-changes`, `approved`, `rejected`. `undecided` ≡ status ∈ {`draft`, `needs-changes`}. `publish.state` of interest: `sent`.
- **Reused pure helper:** `reviewSendAt(scheduledTime: string, leadDays: number, hourEt: number, tz: string): Date` from `src/lib/social/notify/businessDays.ts`.
- **Deploy** (user-run, gated on a clean tree): `npm run build && pm2 restart excelent-site` — the same rebuild the generated-email admin hook awaits. Not part of any task.

---

### Task 1: `buckets.ts` — pure classification logic (TDD)

**Files:**
- Create: `src/lib/social/notify/buckets.ts`
- Test: `src/lib/social/notify/buckets.test.ts`

**Interfaces:**
- Consumes: `reviewSendAt(scheduledTime, leadDays, hourEt, tz)` from `./businessDays`.
- Produces (later tasks rely on these exact names/types):
  - `type Bucket = 'missed' | 'overdue' | 'review-overdue' | 'awaiting'`
  - `interface BucketCfg { leadDays: number; hourEt: number; tz: string }`
  - `interface BucketPost { status?: string; scheduledTime?: string | null; publish?: { state?: string | null } | null; notify?: { reviewSentAt?: string | null } | null }`
  - `function classify(post: BucketPost, now: Date, cfg: BucketCfg): Bucket | null`
  - `interface Bucketized<T> { missed: T[]; overdue: T[]; reviewOverdue: T[]; awaiting: T[] }`
  - `function bucketize<T extends BucketPost>(posts: T[], now: Date, cfg: BucketCfg): Bucketized<T>`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/social/notify/buckets.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify, bucketize, type BucketCfg } from './buckets'

const CFG: BucketCfg = { leadDays: 2, hourEt: 9, tz: 'America/New_York' }
// Fixed "now" for deterministic tests: Wed 2026-06-24 18:00:00 UTC (14:00 ET).
const NOW = new Date('2026-06-24T18:00:00Z')
const hours = (n: number) => new Date(NOW.getTime() + n * 3600_000).toISOString()

test('missed: past go-live, undecided, not published', () => {
  const post = { status: 'draft', scheduledTime: hours(-3), publish: { state: 'pending' } }
  assert.equal(classify(post, NOW, CFG), 'missed')
})

test('missed excludes approved and rejected', () => {
  assert.equal(classify({ status: 'approved', scheduledTime: hours(-3) }, NOW, CFG), null)
  assert.equal(classify({ status: 'rejected', scheduledTime: hours(-3) }, NOW, CFG), null)
})

test('missed excludes already-published (publish.state sent)', () => {
  const post = { status: 'draft', scheduledTime: hours(-3), publish: { state: 'sent' } }
  assert.equal(classify(post, NOW, CFG), null)
})

test('overdue: undecided, within 24h before go-live', () => {
  const post = { status: 'needs-changes', scheduledTime: hours(6) }
  assert.equal(classify(post, NOW, CFG), 'overdue')
})

test('overdue takes priority over review-overdue when no review email and <24h out', () => {
  // <24h out AND no review email sent -> single assignment must be 'overdue'.
  const post = { status: 'draft', scheduledTime: hours(6), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), 'overdue')
})

test('awaiting: undecided, review email sent, >24h before go-live', () => {
  const post = { status: 'draft', scheduledTime: hours(72), notify: { reviewSentAt: hours(-24) } }
  assert.equal(classify(post, NOW, CFG), 'awaiting')
})

test('review-overdue: undecided, no review email, past send time, >24h out', () => {
  // +48h go-live → reviewSendAt (2 business days before, 9am ET) = 2026-06-24T13:00Z,
  // which is before NOW (18:00Z); and 48h > 24h so it is not the overdue bucket.
  // (Verified against the real reviewSendAt: +48h reviewSendAt<NOW true, +72h false.)
  const post = { status: 'draft', scheduledTime: hours(48), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), 'review-overdue')
})

test('review-overdue excludes approved posts', () => {
  const post = { status: 'approved', scheduledTime: hours(72), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), null)
})

test('no scheduledTime -> null', () => {
  assert.equal(classify({ status: 'draft' }, NOW, CFG), null)
})

test('invalid scheduledTime -> null (never throws)', () => {
  assert.equal(classify({ status: 'draft', scheduledTime: 'not-a-date' }, NOW, CFG), null)
})

test('bucketize groups and sorts awaiting soonest-first', () => {
  const posts = [
    { id: 1, status: 'draft', scheduledTime: hours(96), notify: { reviewSentAt: hours(-1) } },
    { id: 2, status: 'draft', scheduledTime: hours(48), notify: { reviewSentAt: hours(-1) } },
    { id: 3, status: 'draft', scheduledTime: hours(-3), publish: { state: 'pending' } },
  ]
  const out = bucketize(posts, NOW, CFG)
  assert.deepEqual(out.awaiting.map((p) => (p as any).id), [2, 1])
  assert.deepEqual(out.missed.map((p) => (p as any).id), [3])
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --import tsx --test src/lib/social/notify/buckets.test.ts`
Expected: FAIL — cannot find module `./buckets` (not created yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/social/notify/buckets.ts`:

```ts
import { reviewSendAt } from './businessDays'

export type Bucket = 'missed' | 'overdue' | 'review-overdue' | 'awaiting'

export interface BucketCfg {
  leadDays: number
  hourEt: number
  tz: string
}

export interface BucketPost {
  status?: string
  scheduledTime?: string | null
  publish?: { state?: string | null } | null
  notify?: { reviewSentAt?: string | null } | null
}

export interface Bucketized<T> {
  missed: T[]
  overdue: T[]
  reviewOverdue: T[]
  awaiting: T[]
}

const DAY_MS = 24 * 60 * 60 * 1000
const UNDECIDED = new Set(['draft', 'needs-changes'])

// Assign a post to exactly ONE bucket by severity priority, or null if it needs
// no attention. Priority: missed > overdue > review-overdue > awaiting.
export function classify(post: BucketPost, now: Date, cfg: BucketCfg): Bucket | null {
  const sched = post.scheduledTime ? new Date(post.scheduledTime) : null
  if (!sched || Number.isNaN(sched.getTime())) return null

  const status = post.status ?? ''
  const undecided = UNDECIDED.has(status)
  const reviewSent = Boolean(post.notify?.reviewSentAt)
  const published = post.publish?.state === 'sent'
  const t = now.getTime()
  const go = sched.getTime()

  // 1. missed: past go-live, never resolved, not published.
  if (go < t && status !== 'approved' && status !== 'rejected' && !published) {
    return 'missed'
  }
  // 2. overdue: undecided, inside the 24h-before-go-live window.
  if (undecided && t < go && go - t <= DAY_MS) {
    return 'overdue'
  }
  // 3. review-overdue: undecided, no review email yet, past its scheduled send time.
  if (
    undecided &&
    !reviewSent &&
    t < go &&
    reviewSendAt(post.scheduledTime as string, cfg.leadDays, cfg.hourEt, cfg.tz).getTime() < t
  ) {
    return 'review-overdue'
  }
  // 4. awaiting: undecided, review email sent, still before go-live.
  if (undecided && reviewSent && t < go) {
    return 'awaiting'
  }
  return null
}

export function bucketize<T extends BucketPost>(posts: T[], now: Date, cfg: BucketCfg): Bucketized<T> {
  const out: Bucketized<T> = { missed: [], overdue: [], reviewOverdue: [], awaiting: [] }
  for (const p of posts) {
    switch (classify(p, now, cfg)) {
      case 'missed': out.missed.push(p); break
      case 'overdue': out.overdue.push(p); break
      case 'review-overdue': out.reviewOverdue.push(p); break
      case 'awaiting': out.awaiting.push(p); break
    }
  }
  const at = (p: BucketPost) => new Date(p.scheduledTime as string).getTime()
  out.awaiting.sort((a, b) => at(a) - at(b))
  return out
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --import tsx --test src/lib/social/notify/buckets.test.ts`
Expected: PASS — all tests green (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/notify/buckets.ts src/lib/social/notify/buckets.test.ts
git commit -m "feat(social): notification dashboard bucket classifier"
```

---

### Task 2: Dashboard view components

**Files:**
- Create: `src/components/admin/SocialNotifications.tsx` (server wrapper)
- Create: `src/components/admin/SocialNotificationsClient.tsx` (`'use client'`)

**Interfaces:**
- Consumes: `bucketize`, `type BucketPost` from `@/lib/social/notify/buckets` (Task 1).
- Produces: default-exported React component `SocialNotifications` at module path `/components/admin/SocialNotifications` (Task 3 registers this exact path).

No unit tests — these are presentational and verified by eye after the deploy rebuild (Task 3's manual check). The testable logic lives in Task 1.

- [ ] **Step 1: Create the client component**

Create `src/components/admin/SocialNotificationsClient.tsx`:

```tsx
'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { bucketize, type BucketPost } from '@/lib/social/notify/buckets'

// Mirrors SOCIAL_REVIEW_LEAD_DAYS / SOCIAL_NOTIFY_HOUR_ET in .env.
const CFG = { leadDays: 2, hourEt: 9, tz: 'America/New_York' }

const RED = '#b00020'
const AMBER = '#9a6700'
const GREEN = '#1a7f37'
const MUTED = '#6e7781'

type Reviewer = { email?: string | null }
type Brand = { name?: string; reviewers?: Reviewer[] }
type Post = BucketPost & {
  id: number
  title?: string
  platform?: string
  brand?: Brand | number | null
  notify?: {
    reviewSentAt?: string | null
    reminderSentAt?: string | null
  }
}

function fmtEt(iso?: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso))
}

function ago(iso?: string | null): string {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return 'soon'
  const d = Math.floor(ms / 86_400_000)
  if (d > 0) return `${d}d ago`
  const h = Math.floor(ms / 3_600_000)
  if (h > 0) return `${h}h ago`
  return 'just now'
}

function reviewersOf(brand?: Brand | number | null): string {
  if (!brand || typeof brand !== 'object') return '—'
  const emails = (brand.reviewers ?? []).map((r) => r.email).filter(Boolean) as string[]
  return emails.length ? emails.join(', ') : '—'
}

function brandName(brand?: Brand | number | null): string {
  return brand && typeof brand === 'object' ? brand.name ?? '—' : '—'
}

function Row({ post, note }: { post: Post; note: string }) {
  return (
    <a
      href={`/admin/collections/social-posts/${post.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1.6fr 1fr',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        borderTop: '1px solid #e1e4e8',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span>
        <strong>{brandName(post.brand)}</strong>
        {post.platform ? ` · ${post.platform}` : ''}
        <br />
        <span style={{ color: MUTED }}>{post.title || '(untitled)'}</span>
      </span>
      <span>
        Go-live: {fmtEt(post.scheduledTime)}
        <br />
        <span style={{ color: MUTED }}>Reviewers: {reviewersOf(post.brand)}</span>
      </span>
      <span style={{ textAlign: 'right' }}>
        <span style={{ textTransform: 'capitalize' }}>{post.status}</span>
        <br />
        <span style={{ color: MUTED }}>{note}</span>
      </span>
    </a>
  )
}

function Section({
  title, color, posts, note,
}: {
  title: string; color: string; posts: Post[]; note: (p: Post) => string
}) {
  if (posts.length === 0) return null
  return (
    <section style={{ marginBottom: '1.5rem', border: `1px solid ${color}`, borderRadius: 6 }}>
      <h2 style={{ margin: 0, padding: '0.5rem 0.75rem', background: color, color: '#fff', fontSize: '1rem' }}>
        {title} ({posts.length})
      </h2>
      <div>{posts.map((p) => <Row key={p.id} post={p} note={note(p)} />)}</div>
    </section>
  )
}

export default function SocialNotificationsClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        '/api/social-posts?limit=500&depth=1&where[scheduledTime][exists]=true',
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPosts(json.docs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const b = useMemo(() => bucketize(posts, new Date(), CFG), [posts])
  const total = b.missed.length + b.overdue.length + b.reviewOverdue.length + b.awaiting.length

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Notifications</h1>
        <button type="button" onClick={() => void load()} style={{ cursor: 'pointer' }}>Refresh</button>
      </div>

      {!loading && !error && (
        <p style={{ color: MUTED, marginTop: 0 }}>
          {b.awaiting.length} awaiting · {b.overdue.length} overdue · {b.missed.length} missed · {b.reviewOverdue.length} review-late
        </p>
      )}

      {loading && <p>Loading…</p>}

      {error && (
        <p style={{ color: RED }}>
          Failed to load: {error}{' '}
          <button type="button" onClick={() => void load()} style={{ cursor: 'pointer' }}>Retry</button>
        </p>
      )}

      {!loading && !error && total === 0 && (
        <p style={{ color: GREEN, fontSize: '1.1rem' }}>✓ Nothing needs attention.</p>
      )}

      {!loading && !error && (
        <>
          <Section title="Past go-live, unapproved" color={RED} posts={b.missed}
            note={(p) => `was due ${fmtEt(p.scheduledTime)}`} />
          <Section title="Approval overdue (<24h)" color={RED} posts={b.overdue}
            note={(p) => `reminder ${ago(p.notify?.reminderSentAt)}`} />
          <Section title="Review email overdue" color={AMBER} posts={b.reviewOverdue}
            note={() => 'review never sent'} />
          <Section title="Awaiting approval" color={MUTED} posts={b.awaiting}
            note={(p) => `review sent ${ago(p.notify?.reviewSentAt)}`} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create the server wrapper**

Create `src/components/admin/SocialNotifications.tsx`:

```tsx
import SocialNotificationsClient from './SocialNotificationsClient'

// Registered as a Payload custom admin view at /admin/social-notifications.
export default function SocialNotifications() {
  return <SocialNotificationsClient />
}
```

- [ ] **Step 3: Typecheck the new files compile**

Run: `node --import tsx --eval "import('./src/components/admin/SocialNotifications.tsx').then(() => console.log('ok'))"`
Expected: prints `ok` (module imports without a syntax/type-resolution error). A React-runtime warning about hooks outside a renderer is fine — we only need it to parse/resolve imports.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/SocialNotifications.tsx src/components/admin/SocialNotificationsClient.tsx
git commit -m "feat(social): notifications dashboard view components"
```

---

### Task 3: Register the view + importMap wiring (left uncommitted)

**Files:**
- Modify: `src/payload.config.ts` (admin.components.views) — **leave uncommitted**
- Modify: `src/app/(payload)/admin/importMap.js` — **leave uncommitted**

**Interfaces:**
- Consumes: the `/components/admin/SocialNotifications` default export (Task 2).

This task wires the view in. Both files are on the house "leave uncommitted — the user commits from their own terminal" list, so this task makes the edits and **does not commit**. It ends by confirming the wiring is internally consistent; the view only renders live after the user's `npm run build && pm2 restart excelent-site` from a clean tree.

- [ ] **Step 1: Add the view to payload.config.ts**

In `src/payload.config.ts`, inside `admin.components.views`, add a `socialNotifications` entry next to the existing `socialCalendar`:

```ts
    components: {
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
        socialNotifications: {
          Component: '/components/admin/SocialNotifications',
          path: '/social-notifications',
        },
      },
    },
```

- [ ] **Step 2: Add the import line to importMap.js**

In `src/app/(payload)/admin/importMap.js`, after the existing
`import { default as default_socialCalendar_aa11bb22 } from '../../../components/admin/SocialCalendar'`
line, add:

```js
import { default as default_socialNotifications_bb22cc33 } from '../../../components/admin/SocialNotifications'
```

- [ ] **Step 3: Add the map entry to importMap.js**

In the same file, inside the `export const importMap = { ... }` object, after the
`"/components/admin/SocialCalendar#default": default_socialCalendar_aa11bb22,` line, add:

```js
  "/components/admin/SocialNotifications#default": default_socialNotifications_bb22cc33,
```

- [ ] **Step 4: Verify the wiring is internally consistent**

Run:
```bash
grep -c "default_socialNotifications_bb22cc33" "src/app/(payload)/admin/importMap.js"
grep -c "/components/admin/SocialNotifications" src/payload.config.ts
```
Expected: first prints `2` (the import line + the map entry), second prints `1` (the registered view). If either differs, fix before finishing.

- [ ] **Step 5: Do NOT commit — report uncommitted files to the user**

Do NOT run git add/commit. These two files are intentionally left modified for the user to commit and deploy. Report exactly:
> Task 3 complete. Left uncommitted for you: `src/payload.config.ts` and `src/app/(payload)/admin/importMap.js`. The view goes live after `npm run build && pm2 restart excelent-site` from a clean tree; then confirm `/admin/social-notifications` loads.

---

## Post-implementation (user-run, not a task)

1. From a clean tree: `npm run build && pm2 restart excelent-site`.
2. Confirm `default_socialNotifications` still appears in `importMap.js` after build (the codegen CLI no-ops here, so the hand-edit must survive — see `project_social_agent_gotchas`).
3. Open `/admin/social-notifications`, verify buckets render and rows link to the post editor.

## Self-Review

- **Spec coverage:** purpose/alert-first (Task 2 sections); four buckets + priority (Task 1 `classify`); reviewer emails per row (Task 2 `reviewersOf`); read-only links to editor (Task 2 `Row` href); client-side fetch matching calendar (Task 2 `load`); hardcoded cadence constants (Task 2 `CFG`); registration + importMap (Task 3); no DDL / no dep (Global Constraints); deploy via the shared rebuild (Post-implementation). All covered.
- **Placeholder scan:** none — every code step shows full code; commands have expected output.
- **Type consistency:** `classify`/`bucketize`/`Bucket`/`BucketCfg`/`BucketPost`/`Bucketized` defined in Task 1 and consumed verbatim in Task 2. Component path `/components/admin/SocialNotifications` consistent across Task 2 (file) and Task 3 (config + importMap). `reviewSendAt` signature matches `businessDays.ts`.
