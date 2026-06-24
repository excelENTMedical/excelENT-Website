# Social Content Calendar — Design

**Date:** 2026-06-24
**Branch:** `feat/social-agent-phase-a`
**Status:** Approved (design); spec under review

## Summary

A content calendar for the ExcelENT social media agent. It turns each brand's
editorial strategy (an evergreen **theme pool** + time-boxed **campaigns** +
machine-readable **cadence**) into auto-generated, human-approved, scheduled
LinkedIn posts — visualized and managed in an interactive admin calendar.

It builds entirely on the existing generate → approve → publish infrastructure;
no part of the live pipeline is replaced.

## Context: what already exists (verified 2026-06-24)

- **`social-scheduler` pm2 worker** (`scripts/social-scheduler.mts`) polls every
  60s, finds `approved` posts whose `scheduledTime` is due, and publishes them to
  LinkedIn via `publishPost` (idempotent, claim-before-send, 3-attempt retry).
  **Scheduled LinkedIn publishing already works end-to-end.**
- **`SocialPosts`** already has `scheduledTime` and a `publish` state machine
  (`pending → scheduled → publishing → sent | failed`).
- **`BrandProfiles`** already has `themes[]` (evergreen pool), `platforms[]`,
  `reviewers[]`, and a free-text `cadence` field.
- **`notify` module** (`src/lib/social/notify/*`) exists — review-reminder emails,
  lead-days config — though not yet wired into a running loop.
- **LinkedIn OAuth** connection global + `Publisher` interface
  (`src/lib/social/publish/*`). LinkedIn is the only live publisher.

The calendar is therefore four gaps on top of solid infra.

## Scope & boundaries

**In scope:** structured cadence, theme pool + campaign overlays, cron auto-fill
(14-day rolling window), interactive calendar view, overdue/unapproved alerts.

**Publishing:** LinkedIn only (the one working `Publisher`). The calendar may
*display* Facebook/Instagram, but auto-fill and auto-publish target only platforms
with a live publisher. FB/IG remain future work behind the same `Publisher`
interface.

**Out of scope:** new publishers (FB/IG), analytics (Phase C), AI image
generation, Blotato integration (superseded for LinkedIn by the direct connection).

## Decisions

1. **Calendar tech:** custom Payload admin View + **react-big-calendar** (MIT) with
   the drag-and-drop addon. FullCalendar's per-brand "resource lanes" are a paid
   feature; brand separation is handled with color + filters instead.
2. **Auto-publish v1:** LinkedIn only.
3. **Campaigns:** a separate first-class collection (queryable, renderable on the
   calendar), not a nested array on the brand.
4. **Automation level:** cron auto-fill on cadence (not one-click / manual).
5. **Horizon:** 2-week (14-day) rolling window.
6. **Safety:** never auto-publish unapproved content; skip + alert.

## Data model changes

### `BrandProfiles` (modify)
- Add `postingSlots[]` — structured cadence. Each rule:
  `{ platform, dayOfWeek (Mon–Sun), time (HH:mm, interpreted in ET) }`.
- Keep `themes[]` as the evergreen **pool**.
- Keep free-text `cadence` but mark it deprecated (superseded by `postingSlots`).

### `SocialCampaigns` (new collection)
`{ name, brand (relationship), startDate, endDate, platforms[] (optional override),
themes[] (theme text + guidance), priority }`. While "today" is inside a campaign
window for a brand, the planner draws themes from the campaign instead of the pool.
Higher `priority` wins when windows overlap.

### `SocialPosts` (modify)
- Add `slotSource` (`auto` | `manual`).
- Add optional `campaign` relationship (calendar display + provenance).

## Auto-fill planner (the editorial engine)

A pure, unit-tested function `planSlots(brand, window, existingPosts, now)`:

1. Materialize each brand's `postingSlots` rules into concrete datetimes across
   `[now, now + 14d]` (ET-correct, DST-aware).
2. For each slot, skip if a post (auto **or** manual) already exists for that
   brand/platform/time — **idempotent; fills only empty slots**.
3. Pick the theme: campaign overlay if the slot date falls in an active campaign
   window for that brand/platform, else the next pool theme via **least-recently-used
   rotation**.
4. Emit a draft spec → `generate.ts` produces copy → create a `social-posts` row
   with `status=draft`, `scheduledTime` set, `slotSource=auto`,
   `publish.state=pending`, and `campaign` set when applicable.

The planner only creates drafts. It never approves, edits, or publishes.

## Scheduling & where it runs

Extend the **existing `social-scheduler` pm2 worker** (do not add a new process)
with three loops:

- **publish tick** — every 60s (unchanged, already live).
- **planner tick** — hourly: top up the 14-day window for every active brand.
- **notify tick** — daily at `SOCIAL_NOTIFY_HOUR_ET`: review reminders (lead-days,
  via the existing `notify` module) + overdue-unapproved alerts.

## Skip + alert safety

- Unapproved posts are never published — `dueWhere` only matches `status=approved`,
  so skipping is automatic and needs no new code.
- As a slot's `scheduledTime` approaches while still unapproved → review reminder.
- When `scheduledTime` passes still unapproved → overdue alert email; the slot
  renders as "missed" on the calendar.

## Interactive calendar view

Custom Payload admin View at `/admin/social-calendar`:

- Month/week views via react-big-calendar + drag-and-drop addon.
- Events colored by `publish.state` / `status`; label shows brand · platform ·
  title. Campaign windows render as background bands.
- Brand filter + platform filter (substitute for paid resource lanes).
- Click an event → open the post's edit document.
- Drag an event → `PATCH scheduledTime` (blocked once `publish.state = sent`).

## Testing

`node:test` units for:
- slot materialization (incl. DST / ET correctness),
- dedupe / idempotency (no duplicate slot fills),
- campaign-vs-pool theme selection and overlap priority,
- LRU theme rotation,
- overdue-alert detection.

Light end-to-end smoke for the planner, reusing the `generate-smoke.mts` pattern.

## Known gotchas folded in (per project memory)

- **Payload 3 CLI codegen is broken in this env** — hand-patch `payload-types.ts`
  for the new `SocialCampaigns` collection and the new fields (main interface +
  `*Select` interface).
- **`push:true` does not create tables in production** — use the manual schema-sync
  flow: `scripts/schema-preview.mts` → filter out pre-existing drift statements →
  apply the additive DDL inside a `BEGIN/COMMIT` txn with `psql -v ON_ERROR_STOP=1`.
- `payload.config.ts`, `package.json`, and `payload-types.ts` stay **uncommitted**
  (they carry unrelated `b2b-rebuild` edits) — the user commits them.

## Build order (for the implementation plan)

1. Data model: `BrandProfiles.postingSlots`, `SocialCampaigns` collection,
   `SocialPosts.slotSource` + `campaign`; hand-patch types; schema sync.
2. `planSlots` pure function + unit tests.
3. Wire planner tick + notify tick into `social-scheduler.mts`.
4. Overdue-unapproved alert in the notify module.
5. Calendar admin View (react-big-calendar) + drag-to-reschedule endpoint.
6. End-to-end smoke + operator-guide update.
