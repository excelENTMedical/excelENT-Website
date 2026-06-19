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
