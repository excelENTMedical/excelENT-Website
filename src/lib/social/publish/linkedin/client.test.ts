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
