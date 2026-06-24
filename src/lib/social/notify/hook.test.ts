// src/lib/social/notify/hook.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { socialPostsAfterChange } from './hook'

function fakeReq() {
  const calls: { emails: any[]; updates: any[]; finds: any[]; errors: any[] } = { emails: [], updates: [], finds: [], errors: [] }
  const payload = {
    sendEmail: async (m: any) => { calls.emails.push(m) },
    update: async (a: any) => { calls.updates.push(a) },
    findByID: async (a: any) => { calls.finds.push(a); return { name: 'RCM', reviewers: [{ email: 'zack@x.com' }] } },
    logger: { error: (...a: any[]) => { calls.errors.push(a) } },
  }
  return { req: { payload }, calls }
}

const env = { SOCIAL_TEAM_EMAILS: 'team@x.com', NEXT_PUBLIC_SERVER_URL: 'https://a.x' }

test('create sends generated to owners (loading brand by id)', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: {}, env })
  assert.equal(calls.finds[0].id, 3)
  assert.deepEqual(calls.emails[0].to, ['zack@x.com'])
  assert.equal(calls.updates[0].data.notify.generatedAt !== undefined, true)
})

test('publish transition sends published to team', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'approved', brand: 3, publish: { state: 'sent' } }
  const previousDoc = { ...doc, publish: { state: 'publishing' } }
  await socialPostsAfterChange({ doc, previousDoc, operation: 'update', req, context: {}, env })
  assert.deepEqual(calls.emails[0].to, ['team@x.com'])
})

test('skipNotify context short-circuits (no recursion)', async () => {
  const { req, calls } = fakeReq()
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: { skipNotify: true }, env })
  assert.equal(calls.emails.length, 0)
})

test('a send failure is swallowed and logged, never thrown', async () => {
  const { req, calls } = fakeReq()
  req.payload.sendEmail = async () => { throw new Error('SES down') }
  const doc = { id: 7, copy: 'x', platform: 'linkedin', status: 'draft', brand: 3 }
  await socialPostsAfterChange({ doc, previousDoc: null, operation: 'create', req, context: {}, env })
  assert.equal(calls.errors.length, 1)
})
