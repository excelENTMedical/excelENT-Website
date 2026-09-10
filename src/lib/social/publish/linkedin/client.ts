type Fetch = typeof fetch

export const LINKEDIN_REST_BASE = 'https://api.linkedin.com/rest'

// LinkedIn sunsets each version ~1 year after release and REJECTS unversioned calls,
// so this needs bumping roughly annually. A retired version fails every REST call with
// 426 NONEXISTENT_VERSION (this bit us on 2026-07-29: '202401' had long since sunset,
// breaking the OAuth callback at listAdminedOrgs even though the token exchange worked).
// Env-overridable so a future sunset is an .env edit + restart, not a rebuild.
// Supported as of 2026-07: 202508-202511, 202601-202607. Format is YYYYMM.
export const DEFAULT_LINKEDIN_VERSION = '202607'

function linkedInVersion(): string {
  return process.env.LINKEDIN_API_VERSION || DEFAULT_LINKEDIN_VERSION
}

function restHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': linkedInVersion(),
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

// Characters reserved by LinkedIn's "little" text format, which is what `commentary` is
// parsed as. Per the spec every one of these must be backslash-escaped "even if those
// characters are not used in one of the supported elements or templates".
// '#' is handled separately below because it can legitimately open a hashtag.
const LITTLE_RESERVED = '|{}@[]()<>*_~'

/**
 * Escapes text for LinkedIn's little text format.
 *
 * This is not cosmetic. An unescaped reserved character makes LinkedIn TRUNCATE the post
 * at that point and silently drop the rest - a 201 Created with half the copy missing.
 * On 2026-07-30 the brand's own "PS | Connect" naming published as just "PS".
 */
export function escapeLittleText(text: string): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\\') {
      out += '\\\\'
    } else if (ch === '#') {
      // A well-formed '#tag' is a HashtagElement and must stay unescaped to remain a real,
      // clickable hashtag; a stray '#' is just a reserved character.
      out += /^[A-Za-z0-9]/.test(text.slice(i + 1)) ? '#' : '\\#'
    } else if (LITTLE_RESERVED.includes(ch)) {
      out += '\\' + ch
    } else {
      out += ch
    }
  }
  return out
}

export function buildPostBody(input: { orgUrn: string; text: string; imageUrn?: string; altText?: string }): CreatePostBody {
  const body: CreatePostBody = {
    author: input.orgUrn,
    commentary: escapeLittleText(input.text),
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }
  if (input.imageUrn) body.content = { media: { id: input.imageUrn, altText: input.altText } }
  return body
}

export interface OrgAcl {
  organization: string
  role: string
  state: string
}

/**
 * Every organization ACL for the authorizing member, unfiltered.
 *
 * Deliberately does NOT filter server-side on role/state: when the member holds no
 * matching role LinkedIn returns an empty list rather than an error, which is
 * indistinguishable from "no access at all" and gives nothing to debug. Fetching the
 * raw list lets callers report which roles the account actually has.
 */
export async function listOrgAcls(token: string, fetchImpl: Fetch = fetch): Promise<OrgAcl[]> {
  const url = `${LINKEDIN_REST_BASE}/organizationAcls?q=roleAssignee`
  const res = await fetchImpl(url, { method: 'GET', headers: restHeaders(token), signal: AbortSignal.timeout(30_000) })
  await ensureOk(res, 'listOrgAcls')
  const json = await res.json()
  return (json.elements || [])
    .map((e: any) => ({ organization: e.organization, role: e.role, state: e.state }))
    .filter((e: OrgAcl) => Boolean(e.organization))
}

// Roles that may publish to an organization's feed. ANALYST/CURATOR and the various
// poster roles cannot, so an account holding only those must not be accepted here.
export const POSTING_ROLES = ['ADMINISTRATOR', 'CONTENT_ADMIN']

export function selectPostingOrgs(acls: OrgAcl[]): string[] {
  return acls
    .filter((a) => POSTING_ROLES.includes(a.role) && a.state === 'APPROVED')
    .map((a) => a.organization)
}

export function describeAcls(acls: OrgAcl[]): string {
  if (acls.length === 0) return 'none'
  return acls.map((a) => `${a.organization} (${a.role}/${a.state})`).join(', ')
}

// organizationAcls requires this scope. Without it LinkedIn answers 200 with zero
// elements instead of 403, so a missing scope and a missing Page role look identical.
export const REQUIRED_ADMIN_SCOPE = 'rw_organization_admin'

export function hasAdminScope(grantedScope: string | undefined): boolean {
  if (!grantedScope) return true // nothing reported - cannot rule the scope out
  return grantedScope.split(/[\s,]+/).filter(Boolean).includes(REQUIRED_ADMIN_SCOPE)
}

/** Turns an unpostable result into the one action that will actually fix it. */
export function explainNoPostableOrg(input: { acls: OrgAcl[]; grantedScope?: string }): string {
  if (!hasAdminScope(input.grantedScope)) {
    return `LinkedIn granted only "${input.grantedScope}". Without ${REQUIRED_ADMIN_SCOPE} the organization list is always empty regardless of Page roles - add that scope to the app's authorized products, then reconnect.`
  }
  if (input.acls.length === 0) {
    return 'The token has the right scope, so LinkedIn is reporting that this member holds no Company Page roles. Authorize with an account that administers the ExcelENT Page, or have a Page super admin grant this account Admin or Content Admin, then reconnect.'
  }
  return 'The account has Page access, but not with a role that can publish. Have a Page super admin grant it Admin or Content Admin, then reconnect.'
}

export async function listAdminedOrgs(token: string, fetchImpl: Fetch = fetch): Promise<string[]> {
  return selectPostingOrgs(await listOrgAcls(token, fetchImpl))
}

/**
 * Which organization to publish as, or null when the answer is not unambiguous.
 *
 * Never falls back to "the first one": a member commonly administers several Pages, and
 * picking silently once posted-as the wrong brand (2026-07-30 - it chose After Line over
 * excelENT Medical). An explicit LINKEDIN_ORG_URN always wins; absent that, only a single
 * candidate is safe to assume. Anything else is the caller's job to resolve.
 */
export function chooseOrg(orgs: string[], preferred?: string): string | null {
  if (preferred) return orgs.includes(preferred) ? preferred : null
  return orgs.length === 1 ? orgs[0] : null
}

/** Human-readable Page name; falls back to the urn since a label must never fail a connect. */
export async function fetchOrgName(orgUrn: string, token: string, fetchImpl: Fetch = fetch): Promise<string> {
  const id = orgUrn.split(':').pop()
  try {
    const res = await fetchImpl(`${LINKEDIN_REST_BASE}/organizations/${id}`, {
      method: 'GET',
      headers: restHeaders(token),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return orgUrn
    const json = await res.json()
    return json.localizedName || json.vanityName || orgUrn
  } catch {
    return orgUrn
  }
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
    // Node's fetch accepts a Uint8Array body at runtime; the DOM BodyInit type is narrower.
    body: bytes as unknown as BodyInit,
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
  const postUrn = res.headers.get('x-restli-id')
  if (!postUrn) throw new Error('LinkedIn createPost: missing x-restli-id header')
  return { postUrn }
}

/** One post already on the organization's feed. */
export interface LinkedInPost {
  urn: string
  commentary: string
  createdAt: number
  lifecycleState: string
}

/**
 * Every post the organization has authored, newest first.
 *
 * Exists to answer the one question the stale-claim sweeper cannot: a claim that was
 * abandoned mid-publish may or may not have reached LinkedIn, and without reading the
 * feed back the only safe move is to park the post and ask a human. Requires the
 * `r_organization_social` scope; without it LinkedIn answers 403, which is why this
 * throws rather than returning an empty list — an empty feed and a missing scope must
 * never look the same (the lesson `hasAdminScope` above records for organizationAcls).
 */
export async function listOrgPosts(
  orgUrn: string,
  token: string,
  fetchImpl: Fetch = fetch,
  opts: { pageSize?: number; maxPages?: number } = {},
): Promise<LinkedInPost[]> {
  const pageSize = opts.pageSize ?? 50
  const maxPages = opts.maxPages ?? 10
  const out: LinkedInPost[] = []

  for (let page = 0; page < maxPages; page++) {
    const url =
      `${LINKEDIN_REST_BASE}/posts?q=author&author=${encodeURIComponent(orgUrn)}` +
      `&count=${pageSize}&start=${page * pageSize}&sortBy=LAST_MODIFIED`
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: restHeaders(token),
      signal: AbortSignal.timeout(30_000),
    })
    await ensureOk(res, 'listOrgPosts')
    const json = await res.json()
    const elements = (json.elements || []) as any[]
    for (const e of elements) {
      if (!e?.id) continue
      out.push({
        urn: String(e.id),
        commentary: String(e.commentary ?? ''),
        createdAt: Number(e.createdAt ?? e.publishedAt ?? 0),
        lifecycleState: String(e.lifecycleState ?? ''),
      })
    }
    // A short page is the last page; LinkedIn's paging totals are unreliable here.
    if (elements.length < pageSize) break
  }
  return out
}

/**
 * Reduce a commentary to something comparable with the `copy` we stored.
 *
 * What we sent was `escapeLittleText(copy)`, and what LinkedIn hands back keeps those
 * backslashes, so the two are never byte-equal. Undo the escaping, then flatten
 * whitespace and case so a stray newline or a trailing space cannot break a match.
 */
export function normalizeCommentary(s: string): string {
  return String(s ?? '')
    .replace(/\\([\\|{}@[\]()<>*_~#])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// A prefix short enough to survive trailing edits, long enough that two different posts
// cannot collide on it. Openers like "This is a" are only a few words.
const MATCH_PREFIX = 60

/**
 * The live post that corresponds to this stored copy, or null.
 *
 * Compares a normalized prefix rather than the whole body: a post may have been edited
 * on LinkedIn after publishing, and the sweeper still needs to recognise it.
 */
export function matchPostByCopy(copy: string, posts: LinkedInPost[]): LinkedInPost | null {
  const want = normalizeCommentary(copy)
  if (want.length === 0) return null
  const probe = want.slice(0, MATCH_PREFIX)
  if (probe.length < MATCH_PREFIX && want.length < MATCH_PREFIX) {
    // Short copy has no prefix to spare, so require the whole thing.
    return posts.find((p) => normalizeCommentary(p.commentary).startsWith(want)) ?? null
  }
  return posts.find((p) => normalizeCommentary(p.commentary).startsWith(probe)) ?? null
}
