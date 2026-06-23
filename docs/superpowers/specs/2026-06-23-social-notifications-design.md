# Social Post Notifications — Design Spec

**Date:** 2026-06-23
**Status:** Approved (design), pending implementation plan
**Branch:** `feat/social-agent-phase-a` (continues the social agent work)
**Scope:** Notifications only — this feature does **not** create or schedule posts. It watches existing posts and emails the right people at four lifecycle moments.

## Problem

The team needs to know, by email, when social posts move through their lifecycle: when a draft is **generated**, when it **needs review** (ahead of go-live), a **deadline reminder** if it still isn't approved, and when it is **published**. Today nothing notifies anyone — drafts are created by scripts/admin and sit silently.

## Cadence context (the why, not built here)

The team runs ~4 posts/week, one per avenue, published Mon–Thu. Each avenue has an owner who must review/edit/approve before go-live:

| Avenue | Brand profile | Go-live (typical) | Owner(s) |
|---|---|---|---|
| Overall company | **Company** (new, 5th profile) | Monday | Eric, Zack |
| PS \| RCM | `ps-rcm` | Tuesday | Zack |
| PS \| Lexi | `ps-lexi` | Wednesday | Eric |
| PS \| Connect | `ps-connect` | Thursday | Samir |

(`patient-facing` exists as a brand but is not on the weekly cadence; it simply uses the same notification rules when it has scheduled posts.)

The review email should land 2 business days before go-live, which produces the team's stated send-days (Thu / Fri / Mon / Tue). The team described this as "3 business days" counting inclusively; the implementation uses a configurable lead-time tuned so emails land on exactly those days. Everyone must approve by 24h before go-live.

## The four notification events

| Event | Trigger | Timing | Recipients | Sent once via |
|---|---|---|---|---|
| **Generated** | a `social-posts` doc is created | immediate | brand owner(s) | `notify.generatedAt` |
| **Review window** | time-based poll | go-live − lead-time, at ~09:00 ET on that business day | brand owner(s) | `notify.reviewSentAt` |
| **Approval reminder** | time-based poll, only if status not `approved`/`rejected` | go-live − 24h | brand owner(s) | `notify.reminderSentAt` |
| **Published** | `publish.state` transitions to `sent` | immediate | whole team | `notify.publishedNotifiedAt` |

### Rules & edge cases
- A post with **no `scheduledTime`** gets only the *generated* ping. Review and reminder require a go-live time; document that owners must set `scheduledTime` to get the cadence emails.
- **Rejected** posts get no review/reminder nags. A post already `sent`/`publishing` gets no reminder.
- Idempotency: every time-based email checks its `notify.*` stamp first, so the 60s poller never double-sends.
- **Timezone:** all business-day math and the 09:00 send hour use `America/New_York`.
- Re-running the **Revise** flow updates the existing post (no new `create`), so it does not re-fire the generated ping. This is acceptable.

## Architecture

Mirrors the existing social-agent patterns (pure logic + node:test, thin worker, Payload hooks, SES adapter).

### 1. Pure logic — `src/lib/social/notify/`
Unit-tested with `node:test` (matching the existing 23-test suite). No I/O in these modules.
- `businessDays.ts` — ET-aware "N business days before date X", and "is `now` past the computed send time?" helpers. Skips Sat/Sun. (Public-holiday handling is **out of scope** for v1 — noted as a known limitation.)
- `due.ts` — given a post + now, decide whether the review email or the reminder email is due (combines `scheduledTime`, `status`, `publish.state`, and the `notify.*` stamps).
- `recipients.ts` — resolve recipients for an event: brand owner(s) from `brandProfile.reviewers` for generated/review/reminder; `SOCIAL_TEAM_EMAILS` for published.
- `email.ts` — render subject + HTML body for each event. Body includes: title, avenue/brand, platform, language, go-live time (ET), the draft copy, any `generationMeta.guardrailFlags`, and a deep link to the admin edit page (`${NEXT_PUBLIC_SERVER_URL}/admin/collections/social-posts/<id>`).

### 2. Immediate events — Payload `afterChange` hooks on `SocialPosts`
- `operation === 'create'` → send *generated* email to brand owner(s), stamp `notify.generatedAt`.
- `publish.state` changed to `sent` (compare `previousDoc`) and `notify.publishedNotifiedAt` empty → send *published* email to team, stamp `notify.publishedNotifiedAt`.
- Hooks run under both the REST admin and the local API (scripts), so script-generated drafts and the scheduler's publish both trigger automatically.
- Sending uses `req.payload.sendEmail(...)`. Email failures are caught and logged — they must **never** block the save.

### 3. Time-based events — `scripts/social-notifications.mts` (pm2 worker)
A dedicated worker that mirrors `scripts/social-scheduler.mts`: loads `.env`, forces `NODE_ENV=production`, gets the payload client, and runs a 60s `while(true)` tick. Each tick:
1. Finds candidate posts (have `scheduledTime`, not rejected, relevant `notify.*` stamp empty).
2. For each, uses `due.ts` to decide if review and/or reminder is due now.
3. Sends via `payload.sendEmail` and stamps the matching `notify.*` field (stamp written before/after send is idempotent because the stamp is the guard).

Runs as its own pm2 process so notifications work independently of the Phase B publish scheduler (which is not yet running in prod). It could later be folded into a single "social worker" loop.

### 4. Email transport
The SES adapter is already registered (`src/payload.config.ts:38`, `sesAdapter`). `payload.sendEmail({ to, subject, html })` works today. From-address/name come from `EMAIL_FROM_ADDRESS` / `EMAIL_FROM_NAME`.

## Data model changes

### `BrandProfiles` (add)
- `reviewers` — email list (array of `{ email: text }` or `text` with `hasMany`), the owner(s) notified for generated/review/reminder. Editable in admin.

### New: **Company** brand profile
A 5th brand profile (slug `company`) for the Monday overall-company post, with `reviewers` = Eric + Zack. Created via the existing seed approach (`scripts/seed-brand-profiles.sql` pattern) or admin.

### `SocialPosts` (add)
- `notify` — a read-only `group`: `generatedAt` (date), `reviewSentAt` (date), `reminderSentAt` (date), `publishedNotifiedAt` (date). Idempotency stamps.

### Settings (env, `.env`)
- `SOCIAL_TEAM_EMAILS` — comma-separated "whole team" list for published broadcasts.
- `SOCIAL_REVIEW_LEAD_DAYS` — business-days lead for the review email (default tuned so emails land on the team's stated days, i.e. 2).
- `SOCIAL_NOTIFY_HOUR_ET` — hour (ET) at which the review email fires on its business day (default 9).

(Lead-days and team list could later move to an admin-editable Payload global; env keeps v1 lean.)

## Deployment / env gotchas
- **Payload type codegen is broken in this env** (MEMORY.md, confirmed 2026-06-23). Adding `reviewers` to `BrandProfiles` and the `notify` group to `SocialPosts` requires **hand-patching `src/payload-types.ts`** (both the main interface and the `*Select` interface for each collection) — the build will fail on missing fields otherwise.
- **`push:true` does not create tables in production.** The new columns (`reviewers` join/array table, `notify_*` columns on `social_posts` + `_social_posts_v`) must be applied via the manual schema-sync flow: `scripts/schema-preview.mts` to derive the additive DDL, filter out unrelated pre-existing drift, apply in a `BEGIN/COMMIT` txn with `psql -v ON_ERROR_STOP=1`. (Same flow used for the publish columns.)
- Register the notifications worker under pm2 (it is a **new** process; today only `excelent-site` runs).
- Verify SES is out of sandbox / all recipient addresses are verified, or sends will be rejected.

## Testing
- `node:test` unit tests for `businessDays.ts` (each avenue's go-live → correct send day, weekend skips), `due.ts` (review/reminder/neither across status + stamp combinations), `recipients.ts`, and `email.ts` (link + required fields present).
- Manual smoke: create a draft with a near-future `scheduledTime`, confirm the generated email arrives; temporarily shrink lead-time/now to force review + reminder; publish a post and confirm the team email. Reuse `scripts/test-email.ts` to confirm SES first.

## Out of scope (v1)
- Public-holiday awareness in business-day math.
- Slack/SMS/in-app channels (email only).
- Auto-generating or auto-scheduling the weekly cadence (notifications only, per decision).
- Admin-editable global for team list / lead-time (env for now).

## Decisions captured (with user, 2026-06-23)
1. Scope = **notifications only**; scheduling/creation stays manual.
2. Recipient routing = **owner fields on Brand Profile**; add a 5th **Company** profile.
3. **Generated** and **review** are **two separate emails**.
4. **Yes** to a 24h-before approval reminder when not yet approved.
5. Audience: **generated → brand owner(s); published → whole team**; review + reminder → brand owner(s).
6. Lead-time tuned so review emails land on the stated days (Thu/Fri/Mon/Tue).
