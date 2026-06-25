# Social Notifications Dashboard — Design

**Date:** 2026-06-25
**Branch:** `feat/social-agent-phase-a`
**Related:** notifications system (`docs/superpowers/specs/2026-06-23-social-notifications-design.md`,
`docs/social-notifications-deploy-status.md`); existing calendar view
(`src/components/admin/SocialCalendar.tsx`).

## Purpose

A read-only Payload admin view, **alert-first**, that surfaces only the social
posts that need a human's attention right now: posts awaiting approval, posts
whose approval is overdue, posts that blew past go-live unapproved, and posts the
review-email worker should have emailed but didn't. It is a monitoring surface,
not an editing surface — every flagged row links to that post's existing Payload
edit page, where approve/edit/reject already happen.

Non-goals (v1, YAGNI): no inline approve/reject, no "resend review email" action,
no full-pipeline audit table, no historical/published log. Those were explicitly
declined during brainstorming.

## Where it lives

A custom admin view registered exactly like the existing calendar view:

```ts
// src/payload.config.ts — admin.components.views
socialNotifications: {
  Component: '/components/admin/SocialNotifications',
  path: '/social-notifications',
},
```

Reachable at `/admin/social-notifications`. Registering the view requires a
hand-edit to `src/app/(payload)/admin/importMap.js` (the codegen CLI no-ops in
this env — see `project_social_agent_gotchas`) and a `npm run build && pm2
restart excelent-site` to go live. This is the **same rebuild** the generated-email
admin hook already awaits, so the dashboard adds **no new deploy dependency**; it
ships when that rebuild happens (gated on a clean working tree).

## Architecture

Three units, matching the calendar view's server-wrapper → client-component shape
and the `src/lib/social/notify/` pure-logic-plus-tests convention.

### 1. `src/lib/social/notify/buckets.ts` (pure, unit-tested)

The real logic unit. No React, no fetch, no Node-only APIs (client-safe).

```ts
export type Bucket = 'missed' | 'overdue' | 'review-overdue' | 'awaiting'

export interface BucketCfg { leadDays: number; hourEt: number; tz: string }

// Assigns a post to exactly ONE bucket by severity priority, or null if it
// needs no attention. Reuses reviewSendAt() from ./businessDays.
export function classify(post: PostLike, now: Date, cfg: BucketCfg): Bucket | null
```

`PostLike` is the minimal shape the dashboard reads: `{ status, scheduledTime?,
publish?: { state? }, notify?: { reviewSentAt? } }`.

**Priority order (first match wins → single assignment, nothing shown twice):**

| # | Bucket | Predicate (`undecided` = status ∈ {draft, needs-changes}) |
|---|---|---|
| 1 | `missed` | `scheduledTime` < now AND status ∉ {approved, rejected} AND `publish.state` ≠ `sent` |
| 2 | `overdue` | undecided AND now < `scheduledTime` AND (`scheduledTime` − now) ≤ 24h |
| 3 | `review-overdue` | `scheduledTime` exists AND status ≠ rejected AND `notify.reviewSentAt` empty AND `reviewSendAt(scheduledTime, leadDays, hourEt, tz)` < now < `scheduledTime` |
| 4 | `awaiting` | undecided AND `notify.reviewSentAt` set AND now < `scheduledTime` |

Posts matching none → `null` (not shown). Priority resolves the one real overlap
(a post < 24h out with no review email yet matches both 2 and 3 → shown once as
`overdue`, the higher severity).

A thin helper groups a list: `bucketize(posts, now, cfg)` → `{ missed[],
overdue[], reviewOverdue[], awaiting[] }`, with `awaiting` sorted soonest-go-live
first.

### 2. `src/components/admin/SocialNotifications.tsx` (server wrapper)

Mirrors `SocialCalendar.tsx` — a default-export server component that renders the
client component. Holds the registration seam.

### 3. `src/components/admin/SocialNotificationsClient.tsx` (`'use client'`)

- Fetches `/api/social-posts?limit=500&depth=1&where[scheduledTime][exists]=true`
  with `credentials:'include'` (Payload's built-in collection REST endpoint — the
  exact pattern the calendar client uses; no custom read endpoint).
- `depth=1` populates `brand`, including its `reviewers[]` array → used for the
  per-row "who's pending" emails.
- Runs `bucketize(docs, new Date(), CFG)` and renders four sections.
- `CFG = { leadDays: 2, hourEt: 9, tz: 'America/New_York' }` — hardcoded with a
  comment mirroring `SOCIAL_REVIEW_LEAD_DAYS` / `SOCIAL_NOTIFY_HOUR_ET` in `.env`
  (the brainstorming-chosen client-side approach; these constants change rarely).
- Loads via `useEffect` on mount, same as the calendar; a manual "Refresh" button.

## UI

- **Header summary line:** counts, e.g. `2 awaiting · 1 overdue · 0 missed · 0 review-late`.
- **Sections in severity order:** Missed (red) → Approval overdue <24h (red) →
  Review email overdue (amber) → Awaiting approval (neutral). Empty sections are
  hidden.
- **Empty state** (all four empty): "✓ Nothing needs attention."
- **Each row:** `brand · platform · title` · go-live formatted in ET · status
  badge · reviewer emails (comma-joined from `brand.reviewers`) · the relevant
  notify timestamp rendered relative ("review sent 2d ago", "reminder sent",
  "never sent"). The whole row links to
  `/admin/collections/social-posts/{id}`.
- Colors reuse the calendar client's palette (red `#b00020`, amber `#9a6700`,
  green for the empty state). Plain inline styles, minimal chrome.

## Error handling

- Fetch failure → an inline error banner with a Retry button (calendar uses an
  `alert()`; the dashboard shows an inline message instead, since it's the whole
  screen). Never throws past the component.
- Malformed/partial post docs → `classify` treats missing fields as "no data"
  (e.g. missing `scheduledTime` → not bucketable → `null`); never throws.
- Brand not populated (depth fell short) / no reviewers → row shows "—" for
  reviewers rather than failing.

## Testing

- `src/lib/social/notify/buckets.test.ts` (node:test) covers `classify` for every
  bucket, the priority-overlap case (overdue vs review-overdue), boundary at the
  24h edge, rejected/approved/sent exclusions, and the `null` (no-attention) path;
  plus `bucketize` grouping + `awaiting` sort order. This is where correctness is
  proven — the React components stay thin and are verified by eye after the
  rebuild.
- Run with the project's runner:
  `node --import tsx --test src/lib/social/notify/buckets.test.ts`.

## Branch / commit hygiene (unchanged house rules)

- NO worktree. Add ONLY the task's exact files; never `git add -A`/`-am`.
- Leave UNCOMMITTED for the user to commit: `src/payload.config.ts`,
  `src/payload-types.ts` (n/a here — no schema change), `package.json` (n/a — no
  new dep), and `src/app/(payload)/admin/importMap.js`.
- No DB schema change: the dashboard reads existing columns only. No DDL.

## Deploy

Activates with `npm run build && pm2 restart excelent-site` from a clean tree —
the same rebuild the generated-email admin hook awaits. After restart, confirm the
component string is present in `importMap.js` and the view loads at
`/admin/social-notifications`.
