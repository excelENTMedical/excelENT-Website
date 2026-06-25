# Social Notifications — Deploy Status & Resume Notes

**Date:** 2026-06-25
**Branch:** `feat/social-agent-phase-a`
**Feature commits:** `32eed10..2b7d003` (logic + schema + hook + worker) and `809158c` (pm2 ecosystem)
**Design:** `docs/superpowers/specs/2026-06-23-social-notifications-design.md`
**Plan:** `docs/superpowers/plans/2026-06-23-social-notifications.md`

## What this feature does

Emails the team at four social-post lifecycle moments:

| Event | Trigger | Timing | Recipients |
|---|---|---|---|
| **Generated** | post created | immediate (afterChange hook) | brand owner(s) |
| **Review** | time-based worker | 2 business days before go-live, 09:00 ET | brand owner(s) |
| **Reminder** | time-based worker | 24h before go-live, if not yet approved/rejected | brand owner(s) |
| **Published** | `publish.state` → `sent` | immediate (afterChange hook) | whole team (`SOCIAL_TEAM_EMAILS`) |

Idempotent via read-only `notify.*` stamps on each post. Pure logic in
`src/lib/social/notify/` (26 `node:test` tests, all green). Hook:
`src/lib/social/notify/hook.ts` (registered in `SocialPosts.ts`). Worker:
`scripts/social-notifications.mts` (60s poll).

## ✅ Done & verified (2026-06-25)

- **Code:** all 9 SDD tasks implemented, each reviewed, plus a final senior
  whole-branch integration review = SHIP. Full suite 26/26.
- **DDL applied to prod** (`scripts/apply-social-notify-columns.sql`):
  `brand_profiles_reviewers` table + `notify_*` cols on `social_posts` +
  `version_notify_*` on `_social_posts_v`. Verified present.
- **Company brand profile** created (slug `company`, id 5 — the Monday
  overall-company post).
- **Reviewers seeded** on `brand_profiles_reviewers`:
  - `company` → ehonsberger@excelentmedical.com (Eric), zcasazza@excelentmedical.com (Zack)
  - `ps-rcm` → Zack
  - `ps-lexi` → Eric
  - `ps-connect` → spatel@excelentmedical.com (Samir)
- **Env** (`.env`): `SOCIAL_TEAM_EMAILS` = the three owners; `SOCIAL_REVIEW_LEAD_DAYS=2`;
  `SOCIAL_NOTIFY_HOUR_ET=9`.
- **Worker live:** registered in `ecosystem.config.js`, `pm2 start` + `pm2 save`;
  boots clean, idles between ticks (no scheduled posts yet).
- **Scheduler restarted** so its in-process Payload instance now carries the
  afterChange hook → published emails fire on scheduler-driven publishes.
- **SES verified:** `scripts/test-email.ts` + a real `notify()` end-to-end send.
- **Live owner test fired:** one real "review" email per cadence brand to each
  brand's actual reviewers (DB-stamps stubbed, no posts created). All returned
  `{ sent: true }`. Awaiting owner confirmation of receipt (check spam too).

## ⏳ Remaining — to finish tomorrow

1. **Confirm owner receipt** of the live test emails (Eric ×2, Zack ×2, Samir ×1).
   If any missing, check SES sandbox / verified identities for that address.
2. **Admin-UI hook path** — NOT yet live. Drafts created/edited *in the Payload
   admin* won't fire the generated email until `excelent-site` is rebuilt and
   restarted: `npm run build && pm2 restart excelent-site`.
   - **Blocker:** the working tree currently holds a parallel
     `social-content-calendar` SDD run's uncommitted `payload.config.ts` /
     `payload-types.ts`. Do the rebuild **only from a clean tree** (after that
     run is committed) so half-finished work isn't baked into `.next`.
   - Script-driven paths (generation script, scheduled publish, review/reminder
     worker) are already fully live and do NOT need this rebuild.
3. **finishing-a-development-branch** skill once the above is settled.

## Known limitations (v1, by design)

- No public-holiday awareness in business-day math.
- Worker query is `limit: 50`, no pagination (fine at ~4 posts/week).
- Email only (no Slack/SMS/in-app).
- `src/payload-types.ts` was committed whole in `b969802` per user decision
  (carries unrelated b2b-rebuild type churn) — a deliberate one-time exception
  to the long-standing "leave it uncommitted" rule.

## Note for the project CHANGELOG

A CHANGELOG entry for this feature is **not** yet added — `CHANGELOG.md` was
mid-edit by the parallel `social-content-calendar` run (duplicated sections in
the working tree). Fold a notifications entry in once that run's CHANGELOG
changes are committed/clean.
