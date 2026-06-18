# LinkedIn Direct Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an approved Social Post — its copy plus the generated graphic — to ExcelENT's LinkedIn Company Page, either immediately or at a scheduled time, with OAuth connected in the admin.

**Architecture:** A swappable `Publisher` interface (`src/lib/social/publish/`) with one implementation, `LinkedInPublisher`, over LinkedIn's Community Management API. OAuth tokens for a single org page live in a `linkedin-connection` Payload global and auto-refresh. An orchestrator `publishPost(postId)` is driven both by a "Publish to LinkedIn" admin button (publish-now) and by a dedicated pm2 worker that polls for due scheduled posts. All network code takes an injectable `fetch` and all orchestration takes injectable deps, so the logic unit-tests with `node:test` and zero new dependencies.

**Tech Stack:** Next.js 15, Payload CMS 3, PostgreSQL (`push:true` is dev-only — prod schema synced manually, see Task 13), Node `fetch`, `node:crypto` (HMAC), `node:test` via `tsx`, pm2.

## Global Constraints

- **No new npm dependencies.** Only `fetch`, `node:fs/promises`, `node:crypto`, `node:test`, pm2.
- **Secrets** (`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, tokens) live only in `.env` (gitignored) and the DB global. Never log them, never return them to the client, never paste them into chat or commit them.
- **Target:** a single LinkedIn **organization** page. Post author is `urn:li:organization:{id}`. One token, stored globally (not per brand).
- **Only `approved` posts publish.**
- **LinkedIn REST host** `https://api.linkedin.com/rest`; every REST call sends headers `LinkedIn-Version: 202401`, `X-Restli-Protocol-Version: 2.0.0`, `Authorization: Bearer <token>`.
- **OAuth scopes:** `w_organization_social rw_organization_admin`.
- **TDD:** write the failing test first, watch it fail, implement minimally, watch it pass, commit. Tests run with `node --import tsx --test <file>`.
- **Commit hygiene:** `git add` only the explicit paths listed in each task. NEVER `git add -A`/`.`/`-u`. `src/payload.config.ts` and `src/payload-types.ts` carry the user's unrelated uncommitted work — modify them where the plan says, but DO NOT commit them (the user commits those, as in Phase A).
- **importMap:** new admin components are registered by hand in `src/app/(payload)/admin/importMap.js` (two lines each — an `import { default as … }` and a `"/components/admin/<Name>#default": …` entry). The `generate:importmap` CLI is unreliable here.

---

## File Structure

**Create:**
- `src/lib/social/publish/types.ts` — `Publisher`, `PublishRequest`, `PublishMedia`, `PublishResult`.
- `src/lib/social/publish/linkedin/oauth.ts` — pure OAuth helpers (authorize URL, token exchange/refresh, `needsRefresh`, signed `state`).
- `src/lib/social/publish/linkedin/oauth.test.ts`
- `src/lib/social/publish/linkedin/client.ts` — versioned LinkedIn REST client (orgs, image upload, create post).
- `src/lib/social/publish/linkedin/client.test.ts`
- `src/lib/social/publish/connection.ts` — read/write the `linkedin-connection` global.
- `src/lib/social/publish/linkedin/linkedinPublisher.ts` — `createLinkedInPublisher()` implementing `Publisher`.
- `src/lib/social/publish/linkedinPublisher.test.ts`
- `src/lib/social/publish/publish.ts` — `publishPost()` orchestrator.
- `src/lib/social/publish/publish.test.ts`
- `src/lib/social/publish/scheduler.ts` — pure due-selection + claim/transition helpers.
- `src/lib/social/publish/scheduler.test.ts`
- `src/collections/globals/LinkedInConnection.ts` — the global config.
- `src/app/api/social/linkedin/connect/route.ts` — start OAuth (auth-gated).
- `src/app/api/social/linkedin/callback/route.ts` — OAuth callback.
- `src/app/api/social/publish/route.ts` — publish action (auth-gated).
- `src/components/admin/ConnectLinkedInButton.tsx` — button + status on the global.
- `src/components/admin/PublishToLinkedInButton.tsx` — button on a Social Post.
- `scripts/social-scheduler.mts` — the pm2 worker loop.

**Modify:**
- `src/collections/SocialPosts.ts` — add `scheduledTime`, `publish` group, `publishToLinkedIn` ui field.
- `src/app/(payload)/admin/importMap.js` — register the two new admin components.
- `src/payload.config.ts` — register the `LinkedInConnection` global (DO NOT COMMIT — user's file).
- `.env` — add `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI` (values user-supplied; not committed).
- `docs/social-agent-phase-a.md` — append a LinkedIn publishing section.

**Prerequisites (user-side):** an approved LinkedIn app with the **Community Management API** product, the redirect URL registered, and the client id/secret. Unit tests run without these; end-to-end publishing waits on them.

---

### Task 1: Publish types + OAuth pure helpers (authorize URL, needsRefresh, signed state)

**Files:**
- Create: `src/lib/social/publish/types.ts`
- Create: `src/lib/social/publish/linkedin/oauth.ts` (pure helpers only in this task)
- Test: `src/lib/social/publish/linkedin/oauth.test.ts`

**Interfaces:**
- Produces: `PublishMedia { filename: string; contentType: string; data: Uint8Array; altText?: string }`, `PublishRequest { text: string; media: PublishMedia[] }`, `PublishResult { postUrn: string }`, `Publisher { publish(req: PublishRequest): Promise<PublishResult> }`. `buildAuthorizeUrl({ clientId, redirectUri, scope, state }): string`, `needsRefresh(accessExpiresAt: string | null, now: number, bufferMs?: number): boolean`, `signState(nonce: string, issuedAtMs: number, secret: string): string`, `verifyState(state: string, secret: string, now: number, maxAgeMs?: number): boolean`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/social/publish/linkedin/oauth.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthorizeUrl, needsRefresh, signState, verifyState } from './oauth'

test('buildAuthorizeUrl includes client_id, redirect, scope, state, response_type', () => {
  const url = new URL(
    buildAuthorizeUrl({
      clientId: 'cid',
      redirectUri: 'https://x.test/cb',
      scope: 'w_organization_social rw_organization_admin',
      state: 'st123',
    }),
  )
  assert.equal(url.origin + url.pathname, 'https://www.linkedin.com/oauth/v2/authorization')
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(url.searchParams.get('client_id'), 'cid')
  assert.equal(url.searchParams.get('redirect_uri'), 'https://x.test/cb')
  assert.equal(url.searchParams.get('scope'), 'w_organization_social rw_organization_admin')
  assert.equal(url.searchParams.get('state'), 'st123')
})

test('needsRefresh is true when expiry is null, past, or within the buffer', () => {
  const now = 1_000_000
  assert.equal(needsRefresh(null, now), true)
  assert.equal(needsRefresh(new Date(now - 1).toISOString(), now), true)
  assert.equal(needsRefresh(new Date(now + 60_000).toISOString(), now, 120_000), true) // inside buffer
  assert.equal(needsRefresh(new Date(now + 600_000).toISOString(), now, 120_000), false) // outside buffer
})

test('signState/verifyState round-trips and rejects tampering and staleness', () => {
  const secret = 'shh'
  const now = 5_000_000
  const state = signState('nonce-1', now, secret)
  assert.equal(verifyState(state, secret, now + 1000), true)
  assert.equal(verifyState(state + 'x', secret, now + 1000), false) // tampered
  assert.equal(verifyState(state, 'other', now + 1000), false) // wrong secret
  assert.equal(verifyState(state, secret, now + 11 * 60_000, 10 * 60_000), false) // expired
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/linkedin/oauth.test.ts`
Expected: FAIL — `Cannot find module './oauth'`.

- [ ] **Step 3: Write the types**

```typescript
// src/lib/social/publish/types.ts
/** A media item to upload to the destination before publishing. */
export interface PublishMedia {
  filename: string
  contentType: string
  data: Uint8Array
  altText?: string
}

export interface PublishRequest {
  text: string
  media: PublishMedia[]
}

export interface PublishResult {
  postUrn: string
}

/** Swappable destination. LinkedIn today; Facebook/Instagram/Blotato later. */
export interface Publisher {
  publish(req: PublishRequest): Promise<PublishResult>
}
```

- [ ] **Step 4: Write the pure OAuth helpers**

```typescript
// src/lib/social/publish/linkedin/oauth.ts
import { createHmac } from 'node:crypto'

export const LINKEDIN_AUTHORIZE_URL = 'https://www.linkedin.com/oauth/v2/authorization'
export const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const DEFAULT_REFRESH_BUFFER_MS = 5 * 60_000
const DEFAULT_STATE_MAX_AGE_MS = 10 * 60_000

export function buildAuthorizeUrl(input: {
  clientId: string
  redirectUri: string
  scope: string
  state: string
}): string {
  const u = new URL(LINKEDIN_AUTHORIZE_URL)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', input.clientId)
  u.searchParams.set('redirect_uri', input.redirectUri)
  u.searchParams.set('scope', input.scope)
  u.searchParams.set('state', input.state)
  return u.toString()
}

export function needsRefresh(
  accessExpiresAt: string | null,
  now: number,
  bufferMs: number = DEFAULT_REFRESH_BUFFER_MS,
): boolean {
  if (!accessExpiresAt) return true
  const expiry = new Date(accessExpiresAt).getTime()
  if (Number.isNaN(expiry)) return true
  return expiry - bufferMs <= now
}

export function signState(nonce: string, issuedAtMs: number, secret: string): string {
  const payload = `${nonce}.${issuedAtMs}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyState(
  state: string,
  secret: string,
  now: number,
  maxAgeMs: number = DEFAULT_STATE_MAX_AGE_MS,
): boolean {
  const dot = state.lastIndexOf('.')
  if (dot === -1) return false
  const payloadB64 = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  let payload: string
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return false
  }
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  if (sig !== expected) return false
  const issuedAt = Number(payload.split('.')[1])
  if (!Number.isFinite(issuedAt)) return false
  return now - issuedAt <= maxAgeMs && now >= issuedAt
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/linkedin/oauth.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/publish/types.ts src/lib/social/publish/linkedin/oauth.ts src/lib/social/publish/linkedin/oauth.test.ts
git commit -m "feat(social): Publisher types + LinkedIn OAuth pure helpers (authorize url, needsRefresh, signed state)"
```

---

### Task 2: OAuth token exchange + refresh (injectable fetch)

**Files:**
- Modify: `src/lib/social/publish/linkedin/oauth.ts` (append)
- Test: `src/lib/social/publish/linkedin/oauth.test.ts` (append)

**Interfaces:**
- Consumes: `LINKEDIN_TOKEN_URL` from Task 1.
- Produces: `TokenSet { accessToken: string; refreshToken: string; accessExpiresAt: string; refreshExpiresAt: string }`; `exchangeCode(input: { code: string; redirectUri: string; clientId: string; clientSecret: string }, fetchImpl?, now?): Promise<TokenSet>`; `refreshTokens(input: { refreshToken: string; clientId: string; clientSecret: string }, fetchImpl?, now?): Promise<TokenSet>`. Both POST form-encoded bodies to `LINKEDIN_TOKEN_URL` and map `expires_in`/`refresh_token_expires_in` (seconds) to absolute ISO timestamps using `now`.

- [ ] **Step 1: Write the failing test (append)**

```typescript
// append to src/lib/social/publish/linkedin/oauth.test.ts
import { exchangeCode, refreshTokens } from './oauth'

function fakeFetch(handler: (url: string, init: any) => { status?: number; json?: any; text?: string }) {
  const calls: Array<{ url: string; init: any }> = []
  const fn = async (url: string, init: any) => {
    calls.push({ url, init })
    const r = handler(url, init)
    return {
      ok: (r.status ?? 200) >= 200 && (r.status ?? 200) < 300,
      status: r.status ?? 200,
      json: async () => r.json,
      text: async () => r.text ?? '',
    } as any
  }
  return { fn, calls }
}

test('exchangeCode posts the auth-code grant and maps expiries to absolute ISO', async () => {
  const now = 1_000_000_000_000
  const { fn, calls } = fakeFetch(() => ({
    json: { access_token: 'at', refresh_token: 'rt', expires_in: 5_184_000, refresh_token_expires_in: 31_536_000 },
  }))
  const tokens = await exchangeCode(
    { code: 'c', redirectUri: 'https://x.test/cb', clientId: 'cid', clientSecret: 'sec' },
    fn as any,
    now,
  )
  assert.equal(calls[0].url, 'https://www.linkedin.com/oauth/v2/accessToken')
  assert.equal(calls[0].init.method, 'POST')
  assert.match(calls[0].init.headers['Content-Type'], /x-www-form-urlencoded/)
  assert.match(calls[0].init.body, /grant_type=authorization_code/)
  assert.match(calls[0].init.body, /code=c/)
  assert.equal(tokens.accessToken, 'at')
  assert.equal(tokens.refreshToken, 'rt')
  assert.equal(tokens.accessExpiresAt, new Date(now + 5_184_000_000).toISOString())
  assert.equal(tokens.refreshExpiresAt, new Date(now + 31_536_000_000).toISOString())
})

test('refreshTokens posts the refresh grant', async () => {
  const { fn, calls } = fakeFetch(() => ({
    json: { access_token: 'at2', refresh_token: 'rt2', expires_in: 100, refresh_token_expires_in: 200 },
  }))
  const tokens = await refreshTokens({ refreshToken: 'rt', clientId: 'cid', clientSecret: 'sec' }, fn as any, 0)
  assert.match(calls[0].init.body, /grant_type=refresh_token/)
  assert.match(calls[0].init.body, /refresh_token=rt/)
  assert.equal(tokens.accessToken, 'at2')
})

test('a non-2xx token response throws with status and body', async () => {
  const { fn } = fakeFetch(() => ({ status: 400, text: 'invalid_grant' }))
  await assert.rejects(
    () => exchangeCode({ code: 'c', redirectUri: 'r', clientId: 'i', clientSecret: 's' }, fn as any, 0),
    /400.*invalid_grant/,
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/linkedin/oauth.test.ts`
Expected: FAIL — `exchangeCode`/`refreshTokens` not exported.

- [ ] **Step 3: Append the implementation**

```typescript
// append to src/lib/social/publish/linkedin/oauth.ts
type Fetch = typeof fetch

export interface TokenSet {
  accessToken: string
  refreshToken: string
  accessExpiresAt: string
  refreshExpiresAt: string
}

function mapTokens(json: any, now: number): TokenSet {
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    accessExpiresAt: new Date(now + Number(json.expires_in) * 1000).toISOString(),
    refreshExpiresAt: new Date(now + Number(json.refresh_token_expires_in) * 1000).toISOString(),
  }
}

async function postToken(body: URLSearchParams, fetchImpl: Fetch, now: number): Promise<TokenSet> {
  const res = await fetchImpl(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '(unreadable body)')
    throw new Error(`LinkedIn token request failed: ${res.status} ${t}`)
  }
  return mapTokens(await res.json(), now)
}

export async function exchangeCode(
  input: { code: string; redirectUri: string; clientId: string; clientSecret: string },
  fetchImpl: Fetch = fetch,
  now: number = Date.now(),
): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  })
  return postToken(body, fetchImpl, now)
}

export async function refreshTokens(
  input: { refreshToken: string; clientId: string; clientSecret: string },
  fetchImpl: Fetch = fetch,
  now: number = Date.now(),
): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: input.refreshToken,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  })
  return postToken(body, fetchImpl, now)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/linkedin/oauth.test.ts`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/publish/linkedin/oauth.ts src/lib/social/publish/linkedin/oauth.test.ts
git commit -m "feat(social): LinkedIn OAuth token exchange + refresh"
```

---

### Task 3: LinkedIn REST client (orgs, image upload, create post)

**Files:**
- Create: `src/lib/social/publish/linkedin/client.ts`
- Test: `src/lib/social/publish/linkedin/client.test.ts`

**Interfaces:**
- Produces: `LINKEDIN_REST_BASE = 'https://api.linkedin.com/rest'`; `listAdminedOrgs(token: string, fetchImpl?): Promise<string[]>` (organization URNs); `initImageUpload(orgUrn: string, token: string, fetchImpl?): Promise<{ uploadUrl: string; imageUrn: string }>`; `uploadImageBinary(uploadUrl: string, bytes: Uint8Array, token: string, fetchImpl?): Promise<void>`; `createPost(body: CreatePostBody, token: string, fetchImpl?): Promise<{ postUrn: string }>` (reads the `x-restli-id` response header); `CreatePostBody` and `buildPostBody({ orgUrn, text, imageUrn?, altText? }): CreatePostBody`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/social/publish/linkedin/client.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPostBody, listAdminedOrgs, initImageUpload, uploadImageBinary, createPost } from './client'

function fakeFetch(handler: (url: string, init: any) => { status?: number; json?: any; text?: string; headers?: Record<string, string> }) {
  const calls: Array<{ url: string; init: any }> = []
  const fn = async (url: string, init: any) => {
    calls.push({ url, init })
    const r = handler(url, init)
    const headers = r.headers || {}
    return {
      ok: (r.status ?? 200) >= 200 && (r.status ?? 200) < 300,
      status: r.status ?? 200,
      json: async () => r.json,
      text: async () => r.text ?? '',
      headers: { get: (k: string) => headers[k.toLowerCase()] ?? headers[k] ?? null },
    } as any
  }
  return { fn, calls }
}

test('buildPostBody builds a text+image org post, omitting content when no image', () => {
  const noImg = buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'hi' })
  assert.equal(noImg.author, 'urn:li:organization:9')
  assert.equal(noImg.commentary, 'hi')
  assert.equal(noImg.visibility, 'PUBLIC')
  assert.equal(noImg.lifecycleState, 'PUBLISHED')
  assert.equal(noImg.content, undefined)

  const withImg = buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'hi', imageUrn: 'urn:li:image:abc', altText: 'a' })
  assert.deepEqual(withImg.content, { media: { id: 'urn:li:image:abc', altText: 'a' } })
})

test('listAdminedOrgs sends versioned headers and returns organization urns', async () => {
  const { fn, calls } = fakeFetch(() => ({ json: { elements: [{ organization: 'urn:li:organization:9' }] } }))
  const orgs = await listAdminedOrgs('tok', fn as any)
  assert.deepEqual(orgs, ['urn:li:organization:9'])
  assert.match(calls[0].url, /\/organizationAcls\?q=roleAssignee&role=ADMINISTRATOR/)
  assert.equal(calls[0].init.headers['Authorization'], 'Bearer tok')
  assert.equal(calls[0].init.headers['LinkedIn-Version'], '202401')
  assert.equal(calls[0].init.headers['X-Restli-Protocol-Version'], '2.0.0')
})

test('initImageUpload returns the uploadUrl and image urn', async () => {
  const { fn, calls } = fakeFetch(() => ({ json: { value: { uploadUrl: 'https://up', image: 'urn:li:image:abc' } } }))
  const out = await initImageUpload('urn:li:organization:9', 'tok', fn as any)
  assert.deepEqual(out, { uploadUrl: 'https://up', imageUrn: 'urn:li:image:abc' })
  assert.match(calls[0].url, /\/images\?action=initializeUpload/)
  assert.match(calls[0].init.body, /urn:li:organization:9/)
})

test('uploadImageBinary PUTs the bytes with the bearer token', async () => {
  const { fn, calls } = fakeFetch(() => ({}))
  await uploadImageBinary('https://up', new Uint8Array([1, 2, 3]), 'tok', fn as any)
  assert.equal(calls[0].url, 'https://up')
  assert.equal(calls[0].init.method, 'PUT')
  assert.equal(calls[0].init.headers['Authorization'], 'Bearer tok')
})

test('createPost posts the body and reads the post urn from x-restli-id', async () => {
  const { fn, calls } = fakeFetch(() => ({ status: 201, headers: { 'x-restli-id': 'urn:li:share:777' } }))
  const res = await createPost(buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'hi' }), 'tok', fn as any)
  assert.equal(res.postUrn, 'urn:li:share:777')
  assert.equal(calls[0].url, 'https://api.linkedin.com/rest/posts')
})

test('a non-2xx REST response throws with status and body', async () => {
  const { fn } = fakeFetch(() => ({ status: 422, text: 'bad' }))
  await assert.rejects(() => createPost(buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'x' }), 'tok', fn as any), /422.*bad/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/linkedin/client.test.ts`
Expected: FAIL — `Cannot find module './client'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/social/publish/linkedin/client.ts
type Fetch = typeof fetch

export const LINKEDIN_REST_BASE = 'https://api.linkedin.com/rest'
const LINKEDIN_VERSION = '202401'

function restHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': LINKEDIN_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  }
}

async function ensureOk(res: any, label: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable body)')
    throw new Error(`LinkedIn ${label} failed: ${res.status} ${body}`)
  }
}

export interface CreatePostBody {
  author: string
  commentary: string
  visibility: 'PUBLIC'
  distribution: { feedDistribution: 'MAIN_FEED'; targetEntities: unknown[]; thirdPartyDistributionChannels: unknown[] }
  content?: { media: { id: string; altText?: string } }
  lifecycleState: 'PUBLISHED'
  isReshareDisabledByAuthor: boolean
}

export function buildPostBody(input: { orgUrn: string; text: string; imageUrn?: string; altText?: string }): CreatePostBody {
  const body: CreatePostBody = {
    author: input.orgUrn,
    commentary: input.text,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }
  if (input.imageUrn) body.content = { media: { id: input.imageUrn, altText: input.altText } }
  return body
}

export async function listAdminedOrgs(token: string, fetchImpl: Fetch = fetch): Promise<string[]> {
  const url = `${LINKEDIN_REST_BASE}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`
  const res = await fetchImpl(url, { method: 'GET', headers: restHeaders(token), signal: AbortSignal.timeout(30_000) })
  await ensureOk(res, 'listAdminedOrgs')
  const json = await res.json()
  return (json.elements || []).map((e: any) => e.organization).filter(Boolean)
}

export async function initImageUpload(
  orgUrn: string,
  token: string,
  fetchImpl: Fetch = fetch,
): Promise<{ uploadUrl: string; imageUrn: string }> {
  const res = await fetchImpl(`${LINKEDIN_REST_BASE}/images?action=initializeUpload`, {
    method: 'POST',
    headers: restHeaders(token),
    body: JSON.stringify({ initializeUploadRequest: { owner: orgUrn } }),
    signal: AbortSignal.timeout(30_000),
  })
  await ensureOk(res, 'initImageUpload')
  const json = await res.json()
  return { uploadUrl: json.value.uploadUrl, imageUrn: json.value.image }
}

export async function uploadImageBinary(
  uploadUrl: string,
  bytes: Uint8Array,
  token: string,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  const res = await fetchImpl(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: bytes,
    signal: AbortSignal.timeout(60_000),
  })
  await ensureOk(res, 'uploadImageBinary')
}

export async function createPost(
  body: CreatePostBody,
  token: string,
  fetchImpl: Fetch = fetch,
): Promise<{ postUrn: string }> {
  const res = await fetchImpl(`${LINKEDIN_REST_BASE}/posts`, {
    method: 'POST',
    headers: restHeaders(token),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })
  await ensureOk(res, 'createPost')
  const postUrn = res.headers.get('x-restli-id') || ''
  return { postUrn }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/linkedin/client.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/publish/linkedin/client.ts src/lib/social/publish/linkedin/client.test.ts
git commit -m "feat(social): versioned LinkedIn REST client (orgs, image upload, create post)"
```

---

### Task 4: linkedin-connection global + connection helpers

**Files:**
- Create: `src/collections/globals/LinkedInConnection.ts`
- Create: `src/lib/social/publish/connection.ts`
- Modify: `src/payload.config.ts` (register the global — DO NOT COMMIT this file)

**Interfaces:**
- Produces: `LinkedInConnection` (Payload `GlobalConfig`, slug `linkedin-connection`); `ConnectionData { orgUrn?: string; accessToken?: string; refreshToken?: string; accessExpiresAt?: string; refreshExpiresAt?: string }`; `getConnection(payload): Promise<ConnectionData>`; `saveConnection(payload, data: Partial<ConnectionData> & { connectedBy?: string | number }): Promise<void>`.
- Consumes: `getPayloadClient` from `@/lib/payload` is the default caller in later tasks (this task takes `payload` injected).

- [ ] **Step 1: Write the global config**

```typescript
// src/collections/globals/LinkedInConnection.ts
import type { GlobalConfig } from 'payload'

export const LinkedInConnection: GlobalConfig = {
  slug: 'linkedin-connection',
  label: 'LinkedIn Connection',
  admin: { group: 'Social', description: 'Connect the ExcelENT LinkedIn Company Page for publishing.' },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'connect',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ConnectLinkedInButton' } },
    },
    { name: 'orgUrn', type: 'text', admin: { readOnly: true, description: 'Connected organization URN.' } },
    { name: 'accessToken', type: 'text', admin: { hidden: true } },
    { name: 'refreshToken', type: 'text', admin: { hidden: true } },
    { name: 'accessExpiresAt', type: 'date', admin: { readOnly: true } },
    { name: 'refreshExpiresAt', type: 'date', admin: { readOnly: true } },
    { name: 'connectedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'connectedAt', type: 'date', admin: { readOnly: true } },
  ],
}
```

- [ ] **Step 2: Write the connection helpers**

```typescript
// src/lib/social/publish/connection.ts
export interface ConnectionData {
  orgUrn?: string
  accessToken?: string
  refreshToken?: string
  accessExpiresAt?: string
  refreshExpiresAt?: string
}

interface PayloadLike {
  findGlobal: (args: { slug: string }) => Promise<any>
  updateGlobal: (args: { slug: string; data: any }) => Promise<any>
}

export async function getConnection(payload: PayloadLike): Promise<ConnectionData> {
  const doc = await payload.findGlobal({ slug: 'linkedin-connection' })
  return (doc || {}) as ConnectionData
}

export async function saveConnection(
  payload: PayloadLike,
  data: Partial<ConnectionData> & { connectedBy?: string | number; connectedAt?: string },
): Promise<void> {
  await payload.updateGlobal({ slug: 'linkedin-connection', data })
}
```

- [ ] **Step 3: Register the global in payload.config.ts (DO NOT COMMIT)**

In `src/payload.config.ts`, import and add `LinkedInConnection` to the `globals` array (create the array if it does not exist):

```typescript
import { LinkedInConnection } from './collections/globals/LinkedInConnection'
// ...inside buildConfig({ ... }):
//   globals: [LinkedInConnection],
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean. (The `Field` path resolves via importMap at build; tsc does not check it.)

- [ ] **Step 5: Commit (config file excluded)**

```bash
git add src/collections/globals/LinkedInConnection.ts src/lib/social/publish/connection.ts
git commit -m "feat(social): linkedin-connection global + connection helpers"
```

Note: `src/payload.config.ts` is intentionally left uncommitted (carries the user's unrelated edits; the user commits it, as in Phase A).

---

### Task 5: LinkedInPublisher (resolve+refresh token, upload media, create post)

**Files:**
- Create: `src/lib/social/publish/linkedin/linkedinPublisher.ts`
- Test: `src/lib/social/publish/linkedinPublisher.test.ts`

**Interfaces:**
- Consumes: `Publisher`, `PublishRequest` (Task 1); `needsRefresh`, `refreshTokens`, `TokenSet` (Tasks 1–2); `initImageUpload`, `uploadImageBinary`, `createPost`, `buildPostBody` (Task 3); `ConnectionData`, `getConnection`, `saveConnection` (Task 4).
- Produces: `createLinkedInPublisher(deps: LinkedInPublisherDeps): Publisher`; `LinkedInPublisherDeps { payload; clientId; clientSecret; client?: LinkedInClient; oauth?: OAuthFns; now?: () => number }` where `client` and `oauth` are injectable seams that default to the real Task 2/3 functions.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/social/publish/linkedinPublisher.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLinkedInPublisher } from './linkedin/linkedinPublisher'

function basePayload(conn: any) {
  const saved: any[] = []
  return {
    saved,
    payload: {
      findGlobal: async () => conn,
      updateGlobal: async ({ data }: any) => (saved.push(data), { ...conn, ...data }),
    },
  }
}

const freshConn = {
  orgUrn: 'urn:li:organization:9',
  accessToken: 'good',
  refreshToken: 'rt',
  accessExpiresAt: new Date(10_000_000_000_000).toISOString(), // far future
  refreshExpiresAt: new Date(10_000_000_000_000).toISOString(),
}

function fakeClient() {
  const calls: any = { init: 0, put: 0, post: null }
  return {
    calls,
    client: {
      initImageUpload: async () => (calls.init++, { uploadUrl: 'https://up', imageUrn: 'urn:li:image:abc' }),
      uploadImageBinary: async () => { calls.put++ },
      createPost: async (body: any) => ((calls.post = body), { postUrn: 'urn:li:share:1' }),
    },
  }
}

test('publishes text+image without refreshing when token is fresh', async () => {
  const { payload, saved } = basePayload(freshConn)
  const { client, calls } = fakeClient()
  const pub = createLinkedInPublisher({ payload: payload as any, clientId: 'c', clientSecret: 's', client, now: () => 0 })

  const res = await pub.publish({
    text: 'hello',
    media: [{ filename: 'g.png', contentType: 'image/png', data: new Uint8Array([1]), altText: 'alt' }],
  })

  assert.equal(res.postUrn, 'urn:li:share:1')
  assert.equal(calls.init, 1)
  assert.equal(calls.put, 1)
  assert.equal(calls.post.content.media.id, 'urn:li:image:abc')
  assert.equal(calls.post.author, 'urn:li:organization:9')
  assert.equal(saved.length, 0) // no refresh persisted
})

test('refreshes and persists when the access token is stale', async () => {
  const stale = { ...freshConn, accessExpiresAt: new Date(0).toISOString() }
  const { payload, saved } = basePayload(stale)
  const { client } = fakeClient()
  const oauth = {
    refreshTokens: async () => ({
      accessToken: 'new',
      refreshToken: 'rt2',
      accessExpiresAt: new Date(10_000_000_000_000).toISOString(),
      refreshExpiresAt: new Date(10_000_000_000_000).toISOString(),
    }),
  }
  const pub = createLinkedInPublisher({ payload: payload as any, clientId: 'c', clientSecret: 's', client, oauth, now: () => 1 })
  await pub.publish({ text: 'hi', media: [] })
  assert.equal(saved[0].accessToken, 'new') // refreshed tokens persisted
})

test('throws a clear error when not connected', async () => {
  const { payload } = basePayload({})
  const { client } = fakeClient()
  const pub = createLinkedInPublisher({ payload: payload as any, clientId: 'c', clientSecret: 's', client, now: () => 0 })
  await assert.rejects(() => pub.publish({ text: 'hi', media: [] }), /Connect LinkedIn/)
})

test('throws reconnect error when the refresh token is also expired', async () => {
  const dead = { ...freshConn, accessExpiresAt: new Date(0).toISOString(), refreshExpiresAt: new Date(0).toISOString() }
  const { payload } = basePayload(dead)
  const { client } = fakeClient()
  const pub = createLinkedInPublisher({ payload: payload as any, clientId: 'c', clientSecret: 's', client, now: () => 1 })
  await assert.rejects(() => pub.publish({ text: 'hi', media: [] }), /Reconnect LinkedIn/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/linkedinPublisher.test.ts`
Expected: FAIL — `Cannot find module './linkedin/linkedinPublisher'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/social/publish/linkedin/linkedinPublisher.ts
import type { Publisher } from '../types'
import { getConnection, saveConnection, type ConnectionData } from '../connection'
import { needsRefresh, refreshTokens as defaultRefreshTokens } from './oauth'
import {
  buildPostBody,
  createPost as defaultCreatePost,
  initImageUpload as defaultInitImageUpload,
  uploadImageBinary as defaultUploadImageBinary,
} from './client'

export interface LinkedInClient {
  initImageUpload: (orgUrn: string, token: string) => Promise<{ uploadUrl: string; imageUrn: string }>
  uploadImageBinary: (uploadUrl: string, bytes: Uint8Array, token: string) => Promise<void>
  createPost: (body: ReturnType<typeof buildPostBody>, token: string) => Promise<{ postUrn: string }>
}

export interface OAuthFns {
  refreshTokens: (
    input: { refreshToken: string; clientId: string; clientSecret: string },
    fetchImpl?: typeof fetch,
    now?: number,
  ) => Promise<{ accessToken: string; refreshToken: string; accessExpiresAt: string; refreshExpiresAt: string }>
}

export interface LinkedInPublisherDeps {
  payload: Parameters<typeof getConnection>[0]
  clientId: string
  clientSecret: string
  client?: LinkedInClient
  oauth?: OAuthFns
  now?: () => number
}

const defaultClient: LinkedInClient = {
  initImageUpload: defaultInitImageUpload,
  uploadImageBinary: defaultUploadImageBinary,
  createPost: defaultCreatePost,
}

export function createLinkedInPublisher(deps: LinkedInPublisherDeps): Publisher {
  const client = deps.client || defaultClient
  const oauth = deps.oauth || { refreshTokens: defaultRefreshTokens }
  const now = deps.now || (() => Date.now())

  async function validToken(): Promise<{ token: string; orgUrn: string }> {
    const conn: ConnectionData = await getConnection(deps.payload)
    if (!conn.orgUrn || !conn.accessToken || !conn.refreshToken) {
      throw new Error('Connect LinkedIn first (no stored connection).')
    }
    if (!needsRefresh(conn.accessExpiresAt || null, now())) {
      return { token: conn.accessToken, orgUrn: conn.orgUrn }
    }
    if (conn.refreshExpiresAt && new Date(conn.refreshExpiresAt).getTime() <= now()) {
      throw new Error('Reconnect LinkedIn: the refresh token has expired.')
    }
    const tokens = await oauth.refreshTokens(
      { refreshToken: conn.refreshToken, clientId: deps.clientId, clientSecret: deps.clientSecret },
      fetch,
      now(),
    )
    await saveConnection(deps.payload, tokens)
    return { token: tokens.accessToken, orgUrn: conn.orgUrn }
  }

  return {
    async publish(req) {
      const { token, orgUrn } = await validToken()
      let imageUrn: string | undefined
      let altText: string | undefined
      if (req.media.length > 0) {
        const m = req.media[0]
        const { uploadUrl, imageUrn: urn } = await client.initImageUpload(orgUrn, token)
        await client.uploadImageBinary(uploadUrl, m.data, token)
        imageUrn = urn
        altText = m.altText
      }
      const body = buildPostBody({ orgUrn, text: req.text, imageUrn, altText })
      return client.createPost(body, token)
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/linkedinPublisher.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/publish/linkedin/linkedinPublisher.ts src/lib/social/publish/linkedinPublisher.test.ts
git commit -m "feat(social): LinkedInPublisher (token refresh + media upload + org post)"
```

---

### Task 6: SocialPosts publish fields (scheduledTime, publish group, button)

**Files:**
- Modify: `src/collections/SocialPosts.ts`

- [ ] **Step 1: Add the fields after `reviewerFeedback`**

In `src/collections/SocialPosts.ts`, insert these three field objects immediately after the `reviewerFeedback` field object and before `generationMeta`:

```typescript
    {
      name: 'scheduledTime',
      type: 'date',
      admin: {
        description: 'Optional. Empty = publish immediately when you click Publish. Set = the scheduler posts it at this time.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'publish',
      type: 'group',
      admin: { readOnly: true, description: 'Set automatically when the post is sent to LinkedIn.' },
      fields: [
        {
          name: 'state',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Publishing', value: 'publishing' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        { name: 'postUrn', type: 'text' },
        { name: 'sentAt', type: 'date' },
        { name: 'error', type: 'textarea' },
        { name: 'attempts', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'publishToLinkedIn',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PublishToLinkedInButton' } },
    },
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/collections/SocialPosts.ts
git commit -m "feat(social): social post scheduledTime + publish status fields"
```

---

### Task 7: publishPost orchestrator (status guard, media read, state writes)

**Files:**
- Create: `src/lib/social/publish/publish.ts`
- Test: `src/lib/social/publish/publish.test.ts`

**Interfaces:**
- Consumes: `Publisher`, `PublishMedia` (Task 1); `createLinkedInPublisher` (Task 5); `getPayloadClient` from `@/lib/payload`.
- Produces: `publishPost(postId: string | number, opts?: PublishPostOptions): Promise<string>` returning the post URN; `PublishPostOptions { publisher?: Publisher; payload?: PayloadLike; readFileImpl?: (p: string) => Promise<Buffer>; now?: () => number }`. Reads the post `depth:1`, requires `status==='approved'`, builds `text = [copy, cta].filter(Boolean).join('\n\n')`, attaches the linked asset's file from `public/social-assets/<filename>` if present, calls the publisher, and writes the `publish` group.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/social/publish/publish.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publishPost } from './publish'

function fakePayload(post: any) {
  const updates: any[] = []
  return {
    updates,
    payload: {
      findByID: async () => post,
      update: async (args: any) => (updates.push(args), { ...post, ...args.data }),
    },
  }
}

const approved = {
  id: 'p1',
  status: 'approved',
  copy: 'body copy',
  cta: 'Learn more',
  asset: { filename: 'g.png', mimeType: 'image/png' },
  graphic: { headline: 'Denials down' },
  publish: { attempts: 0 },
}

test('publishPost sends an approved post and records the post urn', async () => {
  const { payload, updates } = fakePayload(approved)
  let sent: any = null
  const publisher = { publish: async (req: any) => ((sent = req), { postUrn: 'urn:li:share:5' }) }
  const urn = await publishPost('p1', { payload: payload as any, publisher, readFileImpl: async () => Buffer.from([1]), now: () => 0 })

  assert.equal(urn, 'urn:li:share:5')
  assert.equal(sent.text, 'body copy\n\nLearn more')
  assert.equal(sent.media.length, 1)
  assert.equal(sent.media[0].altText, 'Denials down')
  assert.equal(updates[0].data.publish.state, 'sent')
  assert.equal(updates[0].data.publish.postUrn, 'urn:li:share:5')
})

test('publishPost refuses a post that is not approved', async () => {
  const { payload } = fakePayload({ ...approved, status: 'draft' })
  const publisher = { publish: async () => ({ postUrn: 'x' }) }
  await assert.rejects(
    () => publishPost('p1', { payload: payload as any, publisher, readFileImpl: async () => Buffer.from([]) }),
    /approved/,
  )
})

test('publishPost works with no asset (text-only)', async () => {
  const { payload } = fakePayload({ ...approved, asset: null })
  let sent: any = null
  const publisher = { publish: async (req: any) => ((sent = req), { postUrn: 'u' }) }
  await publishPost('p1', { payload: payload as any, publisher, readFileImpl: async () => Buffer.from([]) })
  assert.equal(sent.media.length, 0)
})

test('publishPost records failed + increments attempts and rethrows on publisher error', async () => {
  const { payload, updates } = fakePayload(approved)
  const publisher = { publish: async () => { throw new Error('LinkedIn 500') } }
  await assert.rejects(
    () => publishPost('p1', { payload: payload as any, publisher, readFileImpl: async () => Buffer.from([1]) }),
    /LinkedIn 500/,
  )
  assert.equal(updates[0].data.publish.state, 'failed')
  assert.equal(updates[0].data.publish.attempts, 1)
  assert.match(updates[0].data.publish.error, /LinkedIn 500/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/publish.test.ts`
Expected: FAIL — `Cannot find module './publish'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/social/publish/publish.ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayloadClient } from '@/lib/payload'
import { createLinkedInPublisher } from './linkedin/linkedinPublisher'
import type { Publisher, PublishMedia } from './types'

const ASSET_DIR = path.resolve(process.cwd(), 'public/social-assets')

interface PayloadLike {
  findByID: (a: any) => Promise<any>
  update: (a: any) => Promise<any>
}

export interface PublishPostOptions {
  publisher?: Publisher
  payload?: PayloadLike
  readFileImpl?: (p: string) => Promise<Buffer>
  now?: () => number
}

function defaultPublisher(payload: PayloadLike): Publisher {
  return createLinkedInPublisher({
    payload: payload as any,
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  })
}

export async function publishPost(postId: string | number, opts: PublishPostOptions = {}): Promise<string> {
  const payload = opts.payload || ((await getPayloadClient()) as unknown as PayloadLike)
  const publisher = opts.publisher || defaultPublisher(payload)
  const readFileImpl = opts.readFileImpl || readFile
  const now = opts.now || (() => Date.now())

  const post = await payload.findByID({ collection: 'social-posts', id: postId, depth: 1 })
  if (!post) throw new Error(`Post ${postId} not found`)
  if (post.status !== 'approved') throw new Error('Only approved posts can be published')

  const media: PublishMedia[] = []
  const asset = typeof post.asset === 'object' && post.asset ? post.asset : null
  if (asset?.filename) {
    const data = await readFileImpl(path.join(ASSET_DIR, asset.filename))
    media.push({
      filename: asset.filename,
      contentType: asset.mimeType || 'application/octet-stream',
      data,
      altText: post.graphic?.headline || post.title || undefined,
    })
  }

  const text = [post.copy, post.cta].filter(Boolean).join('\n\n')

  try {
    const { postUrn } = await publisher.publish({ text, media })
    await payload.update({
      collection: 'social-posts',
      id: postId,
      data: { publish: { state: 'sent', postUrn, sentAt: new Date(now()).toISOString(), error: '' } },
    })
    return postUrn
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const attempts = (post.publish?.attempts || 0) + 1
    await payload.update({
      collection: 'social-posts',
      id: postId,
      data: { publish: { state: 'failed', error: message, attempts } },
    })
    throw err
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/publish.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the whole social suite + typecheck**

Run: `node --import tsx --test src/lib/social/**/*.test.ts && npx tsc --noEmit`
Expected: all PASS, `tsc` clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/publish/publish.ts src/lib/social/publish/publish.test.ts
git commit -m "feat(social): publishPost orchestrator with approved-guard + state writes"
```

---

### Task 8: Scheduler pure helpers (due query, claim guard)

**Files:**
- Create: `src/lib/social/publish/scheduler.ts`
- Test: `src/lib/social/publish/scheduler.test.ts`

**Interfaces:**
- Produces: `dueWhere(nowIso: string): Where` (a Payload `Where` selecting approved, due, not-terminal, under-attempt-cap posts); `MAX_ATTEMPTS = 3`; `isClaimable(post: { publish?: { state?: string; attempts?: number } }): boolean` (true when state is pending/scheduled/failed and attempts < MAX_ATTEMPTS).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/social/publish/scheduler.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dueWhere, isClaimable, MAX_ATTEMPTS } from './scheduler'

test('dueWhere selects approved posts due at or before now', () => {
  const w: any = dueWhere('2026-06-18T12:00:00.000Z')
  const and = w.and
  assert.ok(and.some((c: any) => c.status?.equals === 'approved'))
  assert.ok(and.some((c: any) => c.scheduledTime?.less_than_equal === '2026-06-18T12:00:00.000Z'))
  assert.ok(and.some((c: any) => Array.isArray(c['publish.state']?.in)))
})

test('isClaimable respects state and the attempts cap', () => {
  assert.equal(isClaimable({ publish: { state: 'pending', attempts: 0 } }), true)
  assert.equal(isClaimable({ publish: { state: 'scheduled', attempts: 2 } }), true)
  assert.equal(isClaimable({ publish: { state: 'failed', attempts: MAX_ATTEMPTS } }), false)
  assert.equal(isClaimable({ publish: { state: 'sent', attempts: 0 } }), false)
  assert.equal(isClaimable({ publish: { state: 'publishing', attempts: 0 } }), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/publish/scheduler.test.ts`
Expected: FAIL — `Cannot find module './scheduler'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/social/publish/scheduler.ts
import type { Where } from 'payload'

export const MAX_ATTEMPTS = 3
const CLAIMABLE_STATES = ['pending', 'scheduled', 'failed']

export function dueWhere(nowIso: string): Where {
  return {
    and: [
      { status: { equals: 'approved' } },
      { scheduledTime: { less_than_equal: nowIso } },
      { 'publish.state': { in: CLAIMABLE_STATES } },
      { 'publish.attempts': { less_than: MAX_ATTEMPTS } },
    ],
  }
}

export function isClaimable(post: { publish?: { state?: string; attempts?: number } }): boolean {
  const state = post.publish?.state ?? 'pending'
  const attempts = post.publish?.attempts ?? 0
  return CLAIMABLE_STATES.includes(state) && attempts < MAX_ATTEMPTS
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/publish/scheduler.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/publish/scheduler.ts src/lib/social/publish/scheduler.test.ts
git commit -m "feat(social): scheduler due-query + claim guard helpers"
```

---

### Task 9: Scheduler worker script (pm2 process)

**Files:**
- Create: `scripts/social-scheduler.mts`

This is the thin runtime shell over the tested helpers; it is not unit-tested (it is an I/O loop). It loads env like the other `scripts/*.mts`, polls every 60s, claims each due post (`publish.state='publishing'`), then calls `publishPost`. The claim is the idempotency guard: only a post still in a claimable state is moved to `publishing`, so a post already in flight is skipped.

- [ ] **Step 1: Write the worker**

```typescript
// scripts/social-scheduler.mts
/**
 * Polls for approved posts whose scheduledTime is due and publishes them via
 * publishPost. Claims each post (publish.state='publishing') before sending so a
 * post is never double-published. Run under pm2 (see Task 13).
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { publishPost } = await import('../src/lib/social/publish/publish')
const { dueWhere, isClaimable } = await import('../src/lib/social/publish/scheduler')

const POLL_MS = 60_000
const payload = await getPayloadClient()

async function tick(): Promise<void> {
  const nowIso = new Date().toISOString()
  const due = await payload.find({ collection: 'social-posts', where: dueWhere(nowIso), depth: 0, limit: 20 })
  for (const post of due.docs as any[]) {
    if (!isClaimable(post)) continue
    try {
      // Claim: flip to 'publishing' so a concurrent/next tick won't re-send it.
      await payload.update({ collection: 'social-posts', id: post.id, data: { publish: { ...(post.publish || {}), state: 'publishing' } } })
      await publishPost(post.id)
      payload.logger.info(`social-scheduler: published post ${post.id}`)
    } catch (err) {
      payload.logger.error({ err }, `social-scheduler: failed to publish post ${post.id}`)
    }
  }
}

payload.logger.info('social-scheduler: started')
// eslint-disable-next-line no-constant-condition
while (true) {
  try {
    await tick()
  } catch (err) {
    payload.logger.error({ err }, 'social-scheduler: tick error')
  }
  await new Promise((r) => setTimeout(r, POLL_MS))
}
```

- [ ] **Step 2: Smoke-run locally (no due posts expected)**

Run: `timeout 8 node --import tsx scripts/social-scheduler.mts; echo "exit=$?"`
Expected: logs `social-scheduler: started`, no crash, exits on the timeout (`exit=124`).

- [ ] **Step 3: Commit**

```bash
git add scripts/social-scheduler.mts
git commit -m "feat(social): pm2 scheduler worker that publishes due posts"
```

---

### Task 10: API routes — connect, callback, publish

**Files:**
- Create: `src/app/api/social/linkedin/connect/route.ts`
- Create: `src/app/api/social/linkedin/callback/route.ts`
- Create: `src/app/api/social/publish/route.ts`

**Interfaces:**
- Consumes: `getPayloadClient` (`@/lib/payload`); `buildAuthorizeUrl`, `signState`, `verifyState`, `exchangeCode` (Tasks 1–2); `listAdminedOrgs` (Task 3); `saveConnection` (Task 4); `publishPost` (Task 7).

- [ ] **Step 1: Write the connect route**

```typescript
// src/app/api/social/linkedin/connect/route.ts
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildAuthorizeUrl, signState } from '@/lib/social/publish/linkedin/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  const secret = process.env.PAYLOAD_SECRET
  if (!clientId || !redirectUri || !secret) {
    return NextResponse.json({ error: 'LinkedIn env not configured' }, { status: 500 })
  }

  const now = Date.now()
  const state = signState(`${user.id}-${now}`, now, secret)
  const url = buildAuthorizeUrl({
    clientId,
    redirectUri,
    scope: 'w_organization_social rw_organization_admin',
    state,
  })
  return NextResponse.redirect(url)
}
```

- [ ] **Step 2: Write the callback route**

```typescript
// src/app/api/social/linkedin/callback/route.ts
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { exchangeCode, verifyState } from '@/lib/social/publish/linkedin/oauth'
import { listAdminedOrgs } from '@/lib/social/publish/linkedin/client'
import { saveConnection } from '@/lib/social/publish/connection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const secret = process.env.PAYLOAD_SECRET || ''
  const clientId = process.env.LINKEDIN_CLIENT_ID || ''
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || ''
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || ''

  if (!code || !state || !verifyState(state, secret, Date.now())) {
    return NextResponse.json({ error: 'invalid state or code' }, { status: 400 })
  }

  try {
    const tokens = await exchangeCode({ code, redirectUri, clientId, clientSecret })
    const orgs = await listAdminedOrgs(tokens.accessToken)
    if (orgs.length === 0) throw new Error('No admined LinkedIn organization found for this account')
    await saveConnection(payload as any, {
      ...tokens,
      orgUrn: orgs[0],
      connectedBy: user.id,
      connectedAt: new Date().toISOString(),
    })
    const base = process.env.NEXT_PUBLIC_SERVER_URL || url.origin
    return NextResponse.redirect(`${base}/admin/globals/linkedin-connection?connected=1`)
  } catch (err) {
    payload.logger.error({ err }, 'linkedin callback failed')
    return NextResponse.json({ error: 'linkedin connect failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Write the publish route**

```typescript
// src/app/api/social/publish/route.ts
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { publishPost } from '@/lib/social/publish/publish'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  // If a scheduledTime is set and in the future, mark it scheduled for the worker.
  const post = await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 0, disableErrors: true })
  if (post?.scheduledTime && new Date(post.scheduledTime).getTime() > Date.now()) {
    await payload.update({
      collection: 'social-posts',
      id: body.postId,
      data: { publish: { ...(post.publish || {}), state: 'scheduled' } },
    })
    return NextResponse.json({ ok: true, scheduled: true })
  }

  try {
    const postUrn = await publishPost(body.postId)
    return NextResponse.json({ ok: true, postUrn })
  } catch (err) {
    payload.logger.error({ err }, 'social publish failed')
    return NextResponse.json({ error: 'publish failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/social/linkedin/connect/route.ts src/app/api/social/linkedin/callback/route.ts src/app/api/social/publish/route.ts
git commit -m "feat(social): connect/callback/publish API routes (auth-gated)"
```

---

### Task 11: Admin buttons + importMap registration

**Files:**
- Create: `src/components/admin/ConnectLinkedInButton.tsx`
- Create: `src/components/admin/PublishToLinkedInButton.tsx`
- Modify: `src/app/(payload)/admin/importMap.js`

Mirror the existing `PostPreview.tsx` / `GenerateDraftsButton.tsx` conventions (`'use client'`, `useDocumentInfo`, `credentials: 'include'`).

- [ ] **Step 1: Write ConnectLinkedInButton**

```tsx
// src/components/admin/ConnectLinkedInButton.tsx
'use client'
import React, { useEffect, useState } from 'react'

export default function ConnectLinkedInButton() {
  const [justConnected, setJustConnected] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('connected') === '1') {
      setJustConnected(true)
    }
  }, [])
  return (
    <div style={{ margin: '12px 0 20px' }}>
      <a href="/api/social/linkedin/connect" className="btn btn--style-primary" style={{ textDecoration: 'none' }}>
        Connect LinkedIn
      </a>
      <p style={{ marginTop: 8, fontSize: 12, color: '#52525b' }}>
        Authorizes the ExcelENT Company Page for publishing. Re-run this if posting starts failing with a token error.
      </p>
      {justConnected && <p style={{ marginTop: 6, fontSize: 13, color: '#15803d' }}>LinkedIn connected.</p>}
    </div>
  )
}
```

- [ ] **Step 2: Write PublishToLinkedInButton**

```tsx
// src/components/admin/PublishToLinkedInButton.tsx
'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function PublishToLinkedInButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save and approve the post before publishing.</p>

  const publish = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(data.scheduled ? 'Scheduled — the worker will publish it at the set time.' : `Published to LinkedIn (${data.postUrn || 'ok'}).`)
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <button type="button" onClick={publish} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish to LinkedIn'}
      </button>
      <p style={{ marginTop: 6, fontSize: 12, color: '#52525b' }}>
        Only approved posts publish. Empty Scheduled Time = now; a future time queues it for the scheduler.
      </p>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Register both in importMap.js**

In `src/app/(payload)/admin/importMap.js`, add two import lines next to the existing admin-component imports:

```javascript
import { default as default_connectLinkedIn_a1b2c3d4 } from '../../../components/admin/ConnectLinkedInButton'
import { default as default_publishLinkedIn_e5f6a7b8 } from '../../../components/admin/PublishToLinkedInButton'
```

and two entries inside the `importMap` object (next to the other `/components/admin/...` entries):

```javascript
  "/components/admin/ConnectLinkedInButton#default": default_connectLinkedIn_a1b2c3d4,
  "/components/admin/PublishToLinkedInButton#default": default_publishLinkedIn_e5f6a7b8,
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ConnectLinkedInButton.tsx src/components/admin/PublishToLinkedInButton.tsx "src/app/(payload)/admin/importMap.js"
git commit -m "feat(social): admin Connect LinkedIn + Publish to LinkedIn buttons"
```

---

### Task 12: Operator docs

**Files:**
- Modify: `docs/social-agent-phase-a.md`

- [ ] **Step 1: Append a LinkedIn publishing section**

Add to the end of `docs/social-agent-phase-a.md`:

```markdown
## LinkedIn publishing (built 2026-06-18)

Approved posts publish straight to ExcelENT's LinkedIn Company Page — text + the
generated graphic — now or on a schedule. Built behind a swappable `Publisher`
interface (`src/lib/social/publish/`) so Facebook/Instagram/Blotato can be added
later without touching the orchestrator.

### One-time setup
1. In the LinkedIn developer app (Community Management API product enabled), register
   the redirect URL and copy the client id/secret.
2. Add to `.env`: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`,
   `LINKEDIN_REDIRECT_URI` (must exactly match the registered URL), then
   `npm run build && pm2 restart excelent-site --update-env`.
3. Sync the new DB columns/table (see Phase A schema-sync flow) for `social_posts`
   (`scheduled_time`, `publish_*`) and the `linkedin_connection` global table.
4. Start the scheduler: `pm2 start scripts/social-scheduler.mts --name social-scheduler --interpreter ... ` (see deployment task), `pm2 save`.
5. In the admin → Social → **LinkedIn Connection**, click **Connect LinkedIn** and
   authorize. The connected page URN + tokens are stored; tokens auto-refresh.

### Publishing
1. Generate → review → set a post to **Approved**.
2. Optionally set **Scheduled Time** (leave empty to publish immediately).
3. Click **Publish to LinkedIn**. The **Publish** group shows state (sent/failed),
   the post URN, and any error. Scheduled posts are published by the `social-scheduler`
   worker when due (retries up to 3 times).

### Not included
Facebook/Instagram, analytics, comment replies, and editing/deleting a live post.
```

- [ ] **Step 2: Commit**

```bash
git add docs/social-agent-phase-a.md
git commit -m "docs(social): LinkedIn publishing operator guide"
```

---

### Task 13: Deployment — env, schema sync, build, scheduler, verify

This runs against the **production** box and is the deliberate go-live step. Not unit-testable. Do these in order; stop on any unexpected output. Build/restart is authorized for the social-agent work.

- [ ] **Step 1: Confirm env vars present (no echo of values)**

Run: `cd /home/bitnami/stack/excelent-site && for k in LINKEDIN_CLIENT_ID LINKEDIN_CLIENT_SECRET LINKEDIN_REDIRECT_URI; do grep -q "^$k=.\+" .env && echo "$k present" || echo "$k MISSING"; done`
Expected: all three `present`. (User supplies values; never paste them into chat.)

- [ ] **Step 2: Confirm the global is registered in payload.config.ts**

Run: `grep -n "LinkedInConnection" src/payload.config.ts`
Expected: an import line and a reference in a `globals: [...]` array. If missing, add per Task 4 Step 3 (do not commit the file).

- [ ] **Step 3: Sync the additive schema (production)**

`push:true` is dev-only. Generate the DDL, drop unrelated `ALTER COLUMN ... SET` drift, apply in a transaction:

```bash
cd /home/bitnami/stack/excelent-site
node --import tsx scripts/schema-preview.mts   # writes scripts/schema-push.full.sql, applies nothing
{ echo "BEGIN;"; grep -vE '^ALTER TABLE "(faqs|users|testimonials|demo_requests)" ALTER COLUMN' scripts/schema-push.full.sql; echo "COMMIT;"; } > scripts/schema-push.apply.sql
```
Review `scripts/schema-push.apply.sql` — only the new `linkedin_connection` global table, `social_posts` `scheduled_time`/`publish_*` columns, and the `_social_posts_v` version mirrors should be new. Then apply:
```bash
PGPASSWORD=ExcelENT2024Secure psql -h localhost -U excelent -d excelent_cms -v ON_ERROR_STOP=1 -f scripts/schema-push.apply.sql
```
Expected: ends with `COMMIT`.

- [ ] **Step 4: Build and restart the site**

Run: `cd /home/bitnami/stack/excelent-site && npm run build && pm2 restart excelent-site --update-env`
Expected: build completes; pm2 shows `excelent-site` `online`.

- [ ] **Step 5: Start the scheduler worker under pm2**

Run:
```bash
cd /home/bitnami/stack/excelent-site
pm2 start "node --import tsx scripts/social-scheduler.mts" --name social-scheduler
pm2 save
pm2 status
```
Expected: `social-scheduler` shows `online`; `pm2 logs social-scheduler --lines 5` shows `social-scheduler: started`.

- [ ] **Step 6: Verify routes resolve (auth-guarded, not 500)**

Run:
```bash
curl -s -o /dev/null -w "connect:%{http_code}\n" "http://localhost:3000/api/social/linkedin/connect"
curl -s -o /dev/null -w "publish:%{http_code}\n" -X POST "http://localhost:3000/api/social/publish" -H 'content-type: application/json' -d '{"postId":1}'
```
Expected: both `401` (resolve + guarded, not 500).

- [ ] **Step 7: End-to-end smoke (manual, in the admin)**

In the admin: Social → LinkedIn Connection → **Connect LinkedIn** → authorize → confirm `orgUrn` populated. Then approve a post with a graphic → **Publish to LinkedIn** (no scheduled time) → confirm `publish.state = sent` and the post appears on the LinkedIn page. Then set a near-future Scheduled Time on another approved post, Publish (→ `scheduled`), and confirm the worker flips it to `sent` within ~1 minute of the time.

---

## Self-Review Notes

- **Spec coverage:** Publisher seam (Task 1), OAuth connect + refresh + signed-state CSRF (Tasks 1–2, 10), versioned REST client incl. image upload + org post (Task 3), connection global + helpers (Task 4), publisher (Task 5), post fields + scheduling (Task 6), orchestrator with approved-guard + state writes (Task 7), scheduler predicates (Task 8) + worker (Task 9), routes (Task 10), admin buttons (Task 11), docs (Task 12), deployment incl. schema sync + pm2 worker + verify (Task 13). Covered.
- **Swappability:** only `publish.ts`'s `defaultPublisher` names LinkedIn; the orchestrator depends on the `Publisher` interface. FB/IG/Blotato drop in as new implementations.
- **Type consistency:** `PublishRequest { text, media }` (no scheduledTime — timing is the worker's job) is used identically in Tasks 1, 5, 7. `PublishResult { postUrn }` flows client→publisher→orchestrator→route. `publish` group field names (`state`/`postUrn`/`sentAt`/`error`/`attempts`) match the writes in Task 7 and the claim in Task 9 and the collection in Task 6. `dueWhere`/`isClaimable`/`MAX_ATTEMPTS` (Task 8) are consumed in Task 9.
- **Secrets:** client id/secret and tokens only in `.env` + the DB global; never logged or returned. State is HMAC-signed with `PAYLOAD_SECRET`.
- **No new dependencies:** `fetch`, `node:fs/promises`, `node:crypto`, `node:test`, pm2 only.
- **Commit hygiene:** `payload.config.ts` and `payload-types.ts` are modified but never committed (user's files), consistent with Phase A.
```
