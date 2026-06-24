// src/lib/social/notify/send.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notify, withBrand } from './send'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: ['team@x.com'], serverUrl: 'https://a.x' }

function fakePayload() {
  const calls: { emails: any[]; updates: any[]; finds: any[] } = { emails: [], updates: [], finds: [] }
  return {
    calls,
    sendEmail: async (m: any) => { calls.emails.push(m) },
    update: async (a: any) => { calls.updates.push(a) },
    findByID: async (a: any) => { calls.finds.push(a); return { name: 'Loaded', reviewers: [{ email: 'eric@x.com' }] } },
  }
}

const owned: NotifyPost = {
  id: 7, copy: 'hi', platform: 'linkedin', status: 'draft',
  brand: { name: 'PS | RCM', reviewers: [{ email: 'zack@x.com' }] },
  notify: { generatedAt: '2026-01-01T00:00:00Z' },
}

test('notify sends to owners then stamps the matching field', async () => {
  const p = fakePayload()
  const res = await notify('review', owned, cfg, p, '2026-06-22T13:00:00Z')
  assert.deepEqual(res, { sent: true })
  assert.equal(p.calls.emails.length, 1)
  assert.deepEqual(p.calls.emails[0].to, ['zack@x.com'])
  assert.equal(p.calls.updates.length, 1)
  // stamp preserves existing notify fields and sets reviewSentAt
  assert.equal(p.calls.updates[0].data.notify.generatedAt, '2026-01-01T00:00:00Z')
  assert.equal(p.calls.updates[0].data.notify.reviewSentAt, '2026-06-22T13:00:00Z')
  assert.equal(p.calls.updates[0].context.skipNotify, true)
})

test('notify skips and does not send when there are no recipients', async () => {
  const p = fakePayload()
  const res = await notify('review', { ...owned, brand: 5 }, cfg, p, '2026-06-22T13:00:00Z')
  assert.deepEqual(res, { sent: false, reason: 'no-recipients' })
  assert.equal(p.calls.emails.length, 0)
  assert.equal(p.calls.updates.length, 0)
})

test('notify published uses the team list', async () => {
  const p = fakePayload()
  await notify('published', owned, cfg, p, '2026-06-25T15:00:00Z')
  assert.deepEqual(p.calls.emails[0].to, ['team@x.com'])
  assert.equal(p.calls.updates[0].data.notify.publishedNotifiedAt, '2026-06-25T15:00:00Z')
})

test('withBrand loads the brand when it is an id, leaves populated brand alone', async () => {
  const p = fakePayload()
  const loaded = await withBrand(p, { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', brand: 99 })
  assert.equal((loaded.brand as any).name, 'Loaded')
  assert.equal(p.calls.finds[0].id, 99)

  const p2 = fakePayload()
  const already = await withBrand(p2, owned)
  assert.equal((already.brand as any).name, 'PS | RCM')
  assert.equal(p2.calls.finds.length, 0)
})
