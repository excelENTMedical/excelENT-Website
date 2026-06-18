# LinkedIn Direct Publishing — Design

Status: **approved, ready for implementation plan.**
Date: 2026-06-18
Builds on: the Phase A generator + review loop (`src/lib/social/`), the preview +
graphics work (`graphicStyle` / `graphic` + the saved graphic asset), and the
revise-with-feedback action. Supersedes the parked Blotato Phase B plan
(`docs/superpowers/plans/2026-06-12-social-agent-phase-b-blotato.md`) for LinkedIn:
ExcelENT now has its own approved LinkedIn app (Community Management API enabled), so
we publish to LinkedIn **directly** instead of through Blotato. Blotato/FB/IG remain
possible future implementers of the same `Publisher` interface.

## Problem

Approved posts currently never leave the CMS. This adds the first real distribution
channel: publish an approved post — text plus its generated graphic — to ExcelENT's
LinkedIn Company Page, either immediately or at a scheduled time.

## Decisions (settled in brainstorming)

- **Target:** a single ExcelENT LinkedIn **Company Page** (organization). Author URN is
  `urn:li:organization:{id}`. One page for all brands (one org URN, one token), stored
  globally — not per brand.
- **Auth:** full OAuth 2.0 authorization-code flow **in the admin** ("Connect LinkedIn"
  button → authorize → callback → store access + refresh tokens). Auto-refresh before
  expiry. Requires the **Community Management API** product + scope `w_organization_social`.
- **Scheduling is in scope:** posts may publish now or at a `scheduledTime`. A dedicated
  pm2 worker polls for due posts and publishes them via the same orchestrator as the
  "Publish now" button.
- **Keep the `Publisher` seam:** the orchestrator depends only on a `Publisher` interface;
  `LinkedInPublisher` is the one implementation today. FB/IG/Blotato can be added later
  without touching the orchestrator, collections, or admin.
- **No new dependencies.** `fetch`, `node:fs/promises`, `node:test`, pm2 (already present).

## Architecture

New package `src/lib/social/publish/`, structured like the rest of the engine — pure,
injectable core; admin buttons + auth-gated routes on top.

### Module layout

- **`types.ts`** — `Publisher` (`publish(req: PublishRequest): Promise<PublishResult>`,
  where `PublishResult = { postUrn: string }`), `PublishRequest`
  (`{ text, media: PublishMedia[] }` — org URN/token live in the connection, and timing is
  the worker's concern, so neither appears in the request), `PublishMedia`
  (`{ filename, contentType, data: Uint8Array, altText? }`).
- **`linkedin/oauth.ts`** — pure token logic, injectable `fetch`:
  - `buildAuthorizeUrl({ clientId, redirectUri, scope, state })`.
  - `exchangeCode({ code, redirectUri, clientId, clientSecret }, fetchImpl)` → tokens.
  - `refreshTokens({ refreshToken, clientId, clientSecret }, fetchImpl)` → tokens.
  - `needsRefresh(accessExpiresAt, now, bufferMs)` → boolean.
  - `signState(nonce, issuedAtMs, secret)` / `verifyState(state, secret, now, maxAgeMs)`
    — HMAC(`PAYLOAD_SECRET`) CSRF token; no DB needed.
- **`linkedin/client.ts`** — thin versioned REST client, injectable `fetch`. Sets
  `LinkedIn-Version: 202401`, `X-Restli-Protocol-Version: 2.0.0`, `Authorization: Bearer`.
  Functions: `listAdminedOrgs(token)`, `initImageUpload(orgUrn, token)` →
  `{ uploadUrl, imageUrn }`, `uploadImageBinary(uploadUrl, bytes, token)`,
  `createPost(body, token)` → `{ postUrn }` (read from the `x-restli-id` response header).
  Non-2xx → throw `Error` with status + truncated body.
- **`linkedin/linkedinPublisher.ts`** — `createLinkedInPublisher(deps)` implementing
  `Publisher`: resolve a valid token (refresh + persist via `connection.ts` if
  `needsRefresh`), upload each media item, then `createPost` with `author = orgUrn`.
- **`connection.ts`** — `getConnection(payload)` / `saveTokens(payload, tokens)` over the
  `linkedin-connection` global; throws a clear "Connect LinkedIn first" if unset.
- **`publish.ts`** — `publishPost(postId, deps)` orchestrator (injectable
  `payload`/`publisher`/`readFileImpl`).
- **`scheduler.ts`** — pure predicates: `dueQuery(now)` (the `where` clause) and the
  claim/terminal state transitions; the worker loop is a thin shell that calls these.

### LinkedIn connection (OAuth)

- **Global** `linkedin-connection` (single doc): `orgUrn`, `accessToken`, `refreshToken`,
  `accessExpiresAt`, `refreshExpiresAt`, `connectedBy` (relationship→users), `connectedAt`.
  Admin-only read/write access. Tokens stored in DB because refresh rewrites them.
- **Env:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
  (e.g. `https://excelentmedical.com/api/social/linkedin/callback`, registered on the app).
- **Connect:** `GET /api/social/linkedin/connect` (auth-gated) → 302 to LinkedIn authorize
  with scope `w_organization_social rw_organization_admin` and a signed `state`.
- **Callback:** `GET /api/social/linkedin/callback` (auth-gated; same admin browser
  session) → verify `state`, `exchangeCode`, `listAdminedOrgs` (auto-select when exactly
  one; otherwise the first admined org for v1, page selection UI deferred), `saveTokens` +
  `orgUrn`, redirect to the admin with a success flash.
- **Auto-refresh:** the publisher refreshes within a buffer of `accessExpiresAt` and
  persists. If the **refresh** token is expired, publish fails with "Reconnect LinkedIn"
  surfaced in `publish.error`.
- Tokens are never logged or sent to the client; routes return only status/booleans.

### Data model — SocialPosts additions

After `reviewerFeedback` (mirrors where revise sits):

- `scheduledTime` — `date` (dayAndTime). Empty → publish-now path; set → worker path.
- `publish` group, read-only: `state` (`pending`|`scheduled`|`publishing`|`sent`|`failed`,
  default `pending`), `postUrn` (text), `sentAt` (date), `error` (textarea), `attempts` (number).
- `publishToLinkedIn` — `ui` field rendering the action button.

### Orchestrator — `publishPost(postId, deps)`

1. Load post `depth: 1`; throw unless `status === 'approved'` (only approved posts publish).
2. `text = [copy, cta].filter(Boolean).join('\n\n')`.
3. If a saved graphic **asset** is linked, `readFileImpl` its PNG from the asset dir →
   one `PublishMedia` (`altText` from `graphic.headline`/title when present).
4. `publisher.publish({ text, media })`.
5. Success → update `publish: { state:'sent', postUrn, sentAt: now, error:'' }`.
   Failure → update `publish: { state:'failed', error: message, attempts: attempts+1 }`
   and rethrow.

### LinkedIn API calls

Host `https://api.linkedin.com/rest`; headers `LinkedIn-Version: 202401`,
`X-Restli-Protocol-Version: 2.0.0`, `Authorization: Bearer <token>`.

- **Image:** `POST /images?action=initializeUpload` body
  `{ initializeUploadRequest: { owner: orgUrn } }` → `value.uploadUrl`, `value.image`
  (URN). Then **PUT** the PNG bytes to `uploadUrl`.
- **Post:** `POST /posts` body: `author: orgUrn`, `commentary: text`,
  `visibility: "PUBLIC"`,
  `distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }`,
  `content: { media: { id: imageUrn, altText } }` (omit `content` entirely when no image),
  `lifecycleState: "PUBLISHED"`, `isReshareDisabledByAuthor: false`. The created post URN
  is returned in the `x-restli-id` response header.

### Scheduling — pm2 worker

- `scripts/social-scheduler.mts` — standalone process. Every 60s: find `social-posts`
  where `status = approved`, `scheduledTime <= now`, `publish.state ∈ {pending, scheduled,
  failed}`, `attempts < 3`.
- **Idempotency:** before publishing, claim the post with a conditional update to
  `publish.state = 'publishing'` (guarded so an already-`publishing`/`sent` post is
  skipped), then call the same `publishPost`. The orchestrator writes the terminal state.
- Runs as a second pm2 app (`social-scheduler`). The "Publish now" button calls the same
  `publishPost`, so both paths share one tested code path.
- `dueQuery` and the claim/transition logic are pure and unit-tested; the loop is a shell.

### Admin UX

- `linkedin-connection` global: **Connect LinkedIn** button + a read-only status line
  (connected page, access-token expiry, "reconnect" prompt when stale).
- Each post: **Publish to LinkedIn** button — publishes immediately when `scheduledTime`
  is empty; otherwise sets `publish.state='scheduled'` and lets the worker handle it.
  Shows resulting `state` / `postUrn` / `error` inline.
- Both components registered by hand in `src/app/(payload)/admin/importMap.js` (the
  generate:importmap CLI is unreliable here — see the Phase A gotcha).

### Routes

All `runtime='nodejs'`, `dynamic='force-dynamic'`:
- `GET /api/social/linkedin/connect` — auth-gated; redirects to LinkedIn.
- `GET /api/social/linkedin/callback` — verifies signed `state` (and admin session);
  stores tokens.
- `POST /api/social/publish` — auth-gated; `{ postId }`; publishes now or marks scheduled.

## Testing

`node:test` via tsx, no live LinkedIn calls:
- `oauth`: `needsRefresh` boundaries; `buildAuthorizeUrl` shape; `signState`/`verifyState`
  round-trip + tamper/expiry rejection; `exchangeCode`/`refreshTokens` request
  construction + token mapping (fake fetch).
- `client`: header/URL/body construction for `initImageUpload`, `createPost`,
  `listAdminedOrgs`; `postUrn` read from `x-restli-id`; non-2xx throws with status+body.
- `linkedinPublisher`: refresh-when-stale path persists tokens; upload→post sequencing;
  media URN threaded into the post body.
- `publish`: approved-guard; not-connected failure; success and failure state writes.
- `scheduler`: `dueQuery` selection; claim idempotency (no double-send); attempts cap.

## Security / ops

- Secrets only in `.env` (gitignored) and the DB global; never logged, never returned to
  the client, never pasted into chat or git.
- Callback requires both a valid signed `state` and an authenticated admin session.
- Schema sync is the proven additive flow (`schema-preview` → filter `ALTER COLUMN … SET`
  drift → `psql BEGIN/COMMIT -v ON_ERROR_STOP=1`) for the new `social_posts` columns and
  the global's table. `push:true` is dev-only.
- Deploy: add env vars; register the redirect URL; build; `pm2 start scripts/social-scheduler.mts`
  (or ecosystem entry) + `pm2 restart excelent-site`; verify routes 401 unauthenticated;
  manual end-to-end: Connect → approve → Publish now → confirm on the page.

## Scope guards (YAGNI)

- One company page; multi-page selection UI deferred (auto-select the single admined org).
- LinkedIn only; FB/IG/Blotato are future `Publisher` implementations, not built now.
- No analytics/engagement read-back (that's a later phase).
- No comment replies, no reshare, no document/video media — single image + text only.
- Retry cap is a simple `attempts < 3`; no exponential backoff/queue.

## Out of scope / deferred

- Per-brand or multi-page LinkedIn targets and a page-picker UI.
- Facebook / Instagram / Blotato publishers.
- Post performance analytics and comment management.
- Editing/deleting a post on LinkedIn after publish.
