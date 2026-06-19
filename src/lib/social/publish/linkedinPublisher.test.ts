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
