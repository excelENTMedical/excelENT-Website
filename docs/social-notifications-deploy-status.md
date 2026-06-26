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

1. **Owner receipt — SES-confirmed delivered (2026-06-25).** `aws ses
   get-send-statistics` shows the owner burst in the `2026-06-25T01:49Z` window:
   exactly **5 delivery attempts, 0 bounces, 0 complaints, 0 rejects** (Eric ×2,
   Zack ×2, Samir ×1). Across all retained windows: 183 attempts, 0 bounces, 0
   complaints, 0 rejects → all three addresses valid + accepted by the recipient
   mail servers. **Only open sub-item:** inbox-vs-spam placement (SES can't report
   this) — ask an owner to eyeball; check spam if missing.
2. **Admin-UI hook path + the new Notifications Dashboard — both await ONE
   rebuild.** Neither is live yet; `npm run build && pm2 restart excelent-site`
   activates BOTH at once:
   - the generated-email afterChange hook for drafts created/edited *in the
     Payload admin* (script-driven paths — generation, scheduled publish,
     review/reminder worker — are already fully live and do NOT need this), and
   - the read-only **Notifications Dashboard** at `/admin/social-notifications`
     (see the Dashboard section below).
   - **Deploy is HELD by the user pending others** (a coordinated deploy that
     also ships the admin-branding work + the long-standing b2b-rebuild tree —
     `npm run build` bakes the WHOLE working tree, ~80+ uncommitted files, into
     `.next`). After restart: confirm `/admin/social-notifications` loads and
     `importMap.js` still carries the `socialNotifications` entry (codegen no-ops
     here, so the hand-edit must survive the build).
3. **finishing-a-development-branch** — deferred; branch is shared with other
   in-flight work (admin-branding still partly uncommitted), so no merge/PR yet.

## Notifications Dashboard — built + committed + pushed 2026-06-26

Read-only Payload admin view, alert-first, surfacing posts needing attention in 4
severity-ranked buckets (missed go-live > approval overdue <24h > review-email
overdue > awaiting approval); each row links to the post editor. Spec
`docs/superpowers/specs/2026-06-25-social-notifications-dashboard-design.md`,
plan `docs/superpowers/plans/2026-06-25-social-notifications-dashboard.md`,
SDD ledger `.superpowers/sdd/progress-dashboard.md`.

- Pure classifier `src/lib/social/notify/buckets.ts` (+ 11 node:test, green),
  view `src/components/admin/SocialNotifications{,Client}.tsx`, registered in
  `payload.config.ts` + `importMap.js` (mirrors the `socialCalendar` view).
- Built via SDD (3 tasks, each reviewed) + final opus whole-branch review =
  **Ready to merge: Yes**, no Critical/Important. Commits: `3fdc897`
  (buckets+tests), `430c1f2` (components), `9985c84` (note polish), `6d7e778`
  (view registration — surgically committed so co-resident admin-branding edits
  stayed out). importMap entry already landed in `9c143c1`.
- No DDL, no new dependency. **Goes live with the same rebuild as item 2.**

## Git / deploy state (2026-06-26)

- Branch `feat/social-agent-phase-a` **pushed to origin** (`7d77193..6d7e778`,
  in sync). Push works from this box via cached `credential.helper=store` PAT —
  do it ONLY on the user's explicit say-so, token kept masked. See
  `project_git_remote` memory.
- Still uncommitted on the branch (NOT mine — for their owners): admin-branding
  edits in `payload.config.ts` (graphics/beforeLogin/afterNavLinks/meta) + the
  `CalendarNavLink` importMap line; and the large b2b-rebuild working tree.

## ▶ Tomorrow — pickup checklist

1. Confirm whether the coordinated deploy is cleared (the "waiting on others").
2. If cleared: ensure the tree is in the intended deploy state, then
   `npm run build && pm2 restart excelent-site` → verify `/admin/social-notifications`
   loads, the generated-email hook fires on an admin draft create, and
   `importMap.js` still has the `socialNotifications` entry post-build.
3. Optional inbox/spam eyeball of the owner test emails (item 1 sub-item).
4. Once all in-flight branch work is settled: finishing-a-development-branch.

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
