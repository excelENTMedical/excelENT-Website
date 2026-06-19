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
  const postUrn = res.headers.get('x-restli-id')
  if (!postUrn) throw new Error('LinkedIn createPost: missing x-restli-id header')
  return { postUrn }
}
