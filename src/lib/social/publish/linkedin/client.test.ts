// src/lib/social/publish/linkedin/client.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPostBody,
  listAdminedOrgs,
  initImageUpload,
  uploadImageBinary,
  createPost,
  DEFAULT_LINKEDIN_VERSION,
  listOrgAcls,
  selectPostingOrgs,
  describeAcls,
  hasAdminScope,
  explainNoPostableOrg,
  chooseOrg,
  fetchOrgName,
  escapeLittleText,
  listOrgPosts,
  normalizeCommentary,
  matchPostByCopy,
} from './client'

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
  const { fn, calls } = fakeFetch(() => ({
    json: { elements: [{ organization: 'urn:li:organization:9', role: 'ADMINISTRATOR', state: 'APPROVED' }] },
  }))
  const orgs = await listAdminedOrgs('tok', fn as any)
  assert.deepEqual(orgs, ['urn:li:organization:9'])
  assert.match(calls[0].url, /\/organizationAcls\?q=roleAssignee/)
  assert.equal(calls[0].init.headers['Authorization'], 'Bearer tok')
  assert.equal(calls[0].init.headers['LinkedIn-Version'], DEFAULT_LINKEDIN_VERSION)
  assert.equal(calls[0].init.headers['X-Restli-Protocol-Version'], '2.0.0')
})

test('escapeLittleText escapes every character reserved by little text format', () => {
  // LinkedIn parses `commentary` as "little" text. Unescaped reserved characters are not
  // just rendered oddly - they silently TRUNCATE the post at that point. This bit us on
  // 2026-07-30: "PS | Connect ..." published as "PS" and everything after the pipe was lost.
  assert.equal(escapeLittleText('PS | Connect'), 'PS \\| Connect')
  assert.equal(escapeLittleText('Revenue Cycle Management (RCM)'), 'Revenue Cycle Management \\(RCM\\)')
  assert.equal(escapeLittleText('a{b}c@d[e]f<g>h*i_j~k'), 'a\\{b\\}c\\@d\\[e\\]f\\<g\\>h\\*i\\_j\\~k')
  // Backslash must be escaped first, or escaping would double-process its own output.
  assert.equal(escapeLittleText('a\\b'), 'a\\\\b')
  // Ordinary punctuation and non-ASCII must pass through untouched.
  assert.equal(escapeLittleText("They searched — that's it."), "They searched — that's it.")
})

test('escapeLittleText keeps real hashtags clickable but escapes a bare #', () => {
  // '#word' is a supported HashtagElement, so escaping it would turn a working hashtag into
  // dead text. A '#' that starts no valid tag is just a reserved char and must be escaped.
  assert.equal(escapeLittleText('Tips #SinusHealth #ChronicSinus'), 'Tips #SinusHealth #ChronicSinus')
  assert.equal(escapeLittleText('grade # 3'), 'grade \\# 3')
  assert.equal(escapeLittleText('ends with #'), 'ends with \\#')
})

test('buildPostBody escapes the commentary it sends to LinkedIn', () => {
  const body = buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'PS | Connect finds patients (fast)' })
  assert.equal(body.commentary, 'PS \\| Connect finds patients \\(fast\\)')
})

test('selectPostingOrgs keeps only approved roles that can publish', () => {
  const acls = [
    { organization: 'urn:li:organization:1', role: 'ANALYST', state: 'APPROVED' },
    { organization: 'urn:li:organization:2', role: 'ADMINISTRATOR', state: 'PENDING' },
    { organization: 'urn:li:organization:3', role: 'ADMINISTRATOR', state: 'APPROVED' },
    { organization: 'urn:li:organization:4', role: 'CONTENT_ADMIN', state: 'APPROVED' },
  ]
  assert.deepEqual(selectPostingOrgs(acls), ['urn:li:organization:3', 'urn:li:organization:4'])
  assert.deepEqual(selectPostingOrgs([]), [])
})

test('describeAcls renders roles for diagnostics', () => {
  assert.equal(describeAcls([]), 'none')
  assert.equal(
    describeAcls([{ organization: 'urn:li:organization:1', role: 'CURATOR', state: 'APPROVED' }]),
    'urn:li:organization:1 (CURATOR/APPROVED)',
  )
})

test('listOrgAcls returns every acl unfiltered so empty results can be explained', async () => {
  const { fn, calls } = fakeFetch(() => ({
    json: { elements: [{ organization: 'urn:li:organization:7', role: 'CURATOR', state: 'APPROVED' }] },
  }))
  const acls = await listOrgAcls('tok', fn as any)
  assert.deepEqual(acls, [{ organization: 'urn:li:organization:7', role: 'CURATOR', state: 'APPROVED' }])
  // no server-side role filter - that is what made the empty case undebuggable
  assert.doesNotMatch(calls[0].url, /role=/)
  assert.deepEqual(selectPostingOrgs(acls), [])
})

test('hasAdminScope reads the granted scope string, staying silent when none is reported', () => {
  assert.equal(hasAdminScope('w_organization_social,rw_organization_admin'), true)
  assert.equal(hasAdminScope('w_organization_social rw_organization_admin'), true)
  assert.equal(hasAdminScope('w_organization_social'), false)
  // A scope named as a prefix of another must not count as a match.
  assert.equal(hasAdminScope('rw_organization_admin_readonly'), false)
  assert.equal(hasAdminScope(''), true)
  assert.equal(hasAdminScope(undefined), true)
})

test('explainNoPostableOrg separates a missing scope from a missing Page role', () => {
  // An unmatched scope makes the org list empty no matter what roles the member holds,
  // so it has to be ruled out before blaming the account.
  assert.match(
    explainNoPostableOrg({ acls: [], grantedScope: 'w_organization_social' }),
    /rw_organization_admin/,
  )
  assert.match(
    explainNoPostableOrg({ acls: [], grantedScope: 'w_organization_social rw_organization_admin' }),
    /no Company Page roles/,
  )
  assert.match(
    explainNoPostableOrg({
      acls: [{ organization: 'urn:li:organization:1', role: 'CURATOR', state: 'APPROVED' }],
      grantedScope: 'w_organization_social rw_organization_admin',
    }),
    /not with a role that can publish/,
  )
})

test('chooseOrg never guesses between multiple admined pages', () => {
  const two = ['urn:li:organization:112943925', 'urn:li:organization:89950401']
  // The real failure: two admined pages, and the first one was the wrong brand.
  assert.equal(chooseOrg(two), null)
  assert.equal(chooseOrg(two, 'urn:li:organization:89950401'), 'urn:li:organization:89950401')
  // A configured org that is not admined must fail loudly, not fall back to a sibling.
  assert.equal(chooseOrg(two, 'urn:li:organization:999'), null)
  assert.equal(chooseOrg(['urn:li:organization:5']), 'urn:li:organization:5')
  assert.equal(chooseOrg([]), null)
})

test('fetchOrgName returns the page name and degrades to the urn', async () => {
  const { fn, calls } = fakeFetch(() => ({ json: { localizedName: 'excelENT Medical' } }))
  assert.equal(await fetchOrgName('urn:li:organization:89950401', 'tok', fn as any), 'excelENT Medical')
  assert.match(calls[0].url, /\/organizations\/89950401$/)

  // A label is a nicety - it must never turn a good connection into a failed one.
  const { fn: bad } = fakeFetch(() => ({ status: 403, text: 'nope' }))
  assert.equal(await fetchOrgName('urn:li:organization:7', 'tok', bad as any), 'urn:li:organization:7')
})

test('LinkedIn version is a supported YYYYMM value, overridable via env', async () => {
  // A sunset version fails EVERY REST call with 426 NONEXISTENT_VERSION, so guard the
  // shape and keep the escape hatch working when LinkedIn retires the current default.
  assert.match(DEFAULT_LINKEDIN_VERSION, /^20\d{4}$/)

  const prev = process.env.LINKEDIN_API_VERSION
  process.env.LINKEDIN_API_VERSION = '202601'
  try {
    const { fn, calls } = fakeFetch(() => ({ json: { elements: [] } }))
    await listAdminedOrgs('tok', fn as any)
    assert.equal(calls[0].init.headers['LinkedIn-Version'], '202601')
  } finally {
    if (prev === undefined) delete process.env.LINKEDIN_API_VERSION
    else process.env.LINKEDIN_API_VERSION = prev
  }
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

test('createPost throws when the x-restli-id header is missing', async () => {
  const { fn } = fakeFetch(() => ({ status: 201 }))
  await assert.rejects(
    () => createPost(buildPostBody({ orgUrn: 'urn:li:organization:9', text: 'x' }), 'tok', fn as any),
    /missing x-restli-id/,
  )
})

// --- Reading the org's own posts back (parked-claim reconciliation) ---

function jsonRes(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body, text: async () => JSON.stringify(body), headers: new Map() } as any
}

test('listOrgPosts asks for the author feed with the urn encoded', async () => {
  let seen = ''
  const fetchImpl = (async (url: string, init: any) => {
    seen = url
    assert.equal(init.headers['LinkedIn-Version'], DEFAULT_LINKEDIN_VERSION)
    return jsonRes({ elements: [] })
  }) as any
  await listOrgPosts('urn:li:organization:89950401', 't', fetchImpl)
  assert.ok(seen.includes('q=author'), seen)
  assert.ok(seen.includes('urn%3Ali%3Aorganization%3A89950401'), seen)
})

test('listOrgPosts maps elements and follows pages until one comes back short', async () => {
  const page = (n: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `urn:li:share:${n}${i}`,
      commentary: `post ${n}${i}`,
      createdAt: 1,
      lifecycleState: 'PUBLISHED',
    }))
  let calls = 0
  const fetchImpl = (async () => {
    calls++
    return jsonRes({ elements: calls === 1 ? page(1, 50) : page(2, 3) })
  }) as any
  const out = await listOrgPosts('urn:li:organization:1', 't', fetchImpl, { pageSize: 50 })
  assert.equal(calls, 2)
  assert.equal(out.length, 53)
  assert.equal(out[0].urn, 'urn:li:share:10')
  assert.equal(out[0].commentary, 'post 10')
})

test('listOrgPosts surfaces a scope failure rather than reporting an empty feed', async () => {
  const fetchImpl = (async () => ({
    ok: false,
    status: 403,
    text: async () => 'ACCESS_DENIED: r_organization_social',
    headers: new Map(),
  })) as any
  await assert.rejects(
    () => listOrgPosts('urn:li:organization:1', 't', fetchImpl),
    /listOrgPosts failed: 403/,
  )
})

test('normalizeCommentary undoes little-text escaping so stored copy can be compared', () => {
  const original = 'PS | Connect (beta) — 40% faster'
  const roundTripped = normalizeCommentary(escapeLittleText(original))
  assert.equal(roundTripped, normalizeCommentary(original))
})

test('normalizeCommentary collapses whitespace and case', () => {
  assert.equal(normalizeCommentary('  A   B\n\nC  '), normalizeCommentary('a b c'))
})

test('matchPostByCopy finds the live post whose commentary starts with the stored copy', () => {
  const posts = [
    { urn: 'urn:li:share:1', commentary: 'Something else entirely.', createdAt: 1, lifecycleState: 'PUBLISHED' },
    { urn: 'urn:li:share:2', commentary: escapeLittleText('Your denial rate | the real cost.\n\nMore body.'), createdAt: 2, lifecycleState: 'PUBLISHED' },
  ]
  const hit = matchPostByCopy('Your denial rate | the real cost.\n\nMore body.', posts)
  assert.equal(hit?.urn, 'urn:li:share:2')
})

test('matchPostByCopy returns null when nothing resembles the stored copy', () => {
  const posts = [{ urn: 'urn:li:share:1', commentary: 'Unrelated.', createdAt: 1, lifecycleState: 'PUBLISHED' }]
  assert.equal(matchPostByCopy('Your denial rate is a cash-flow leak.', posts), null)
})

test('matchPostByCopy ignores a post that merely shares a few opening words', () => {
  // "This is" prefixes are common; a match must cover enough of the copy to be real.
  const posts = [{ urn: 'urn:li:share:1', commentary: 'This is a completely different post about scheduling software.', createdAt: 1, lifecycleState: 'PUBLISHED' }]
  assert.equal(matchPostByCopy('This is a post about ENT denial rates and claim rework.', posts), null)
})
