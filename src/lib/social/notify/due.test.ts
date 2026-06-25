// src/lib/social/notify/due.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewDue, reminderDue, immediateEvents, missedDue } from './due'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: [], serverUrl: '' }
const base: NotifyPost = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-06-24T15:00:00Z' }
// review for this post fires at 2026-06-22T13:00:00Z

test('reviewDue true once now passes the send instant', () => {
  assert.equal(reviewDue(base, new Date('2026-06-22T13:00:00Z'), cfg), true)
  assert.equal(reviewDue(base, new Date('2026-06-22T12:59:00Z'), cfg), false)
})

test('reviewDue false when already sent, rejected, or unscheduled', () => {
  const now = new Date('2026-06-23T00:00:00Z')
  assert.equal(reviewDue({ ...base, notify: { reviewSentAt: '2026-06-22T13:00:00Z' } }, now, cfg), false)
  assert.equal(reviewDue({ ...base, status: 'rejected' }, now, cfg), false)
  assert.equal(reviewDue({ ...base, scheduledTime: null }, now, cfg), false)
})

test('reminderDue true within 24h when not approved/rejected', () => {
  // go-live 2026-06-24T15:00:00Z -> deadline 2026-06-23T15:00:00Z
  assert.equal(reminderDue(base, new Date('2026-06-23T15:00:00Z')), true)
  assert.equal(reminderDue(base, new Date('2026-06-23T14:59:00Z')), false)
})

test('reminderDue false when approved, rejected, already sent, or already reminded', () => {
  const now = new Date('2026-06-24T00:00:00Z')
  assert.equal(reminderDue({ ...base, status: 'approved' }, now), false)
  assert.equal(reminderDue({ ...base, status: 'rejected' }, now), false)
  assert.equal(reminderDue({ ...base, publish: { state: 'sent' } }, now), false)
  assert.equal(reminderDue({ ...base, notify: { reminderSentAt: '2026-06-23T16:00:00Z' } }, now), false)
})

test('immediateEvents flags generated on create', () => {
  assert.deepEqual(immediateEvents({ operation: 'create', doc: base }), ['generated'])
  assert.deepEqual(immediateEvents({ operation: 'create', doc: { ...base, notify: { generatedAt: 'x' } } }), [])
  assert.deepEqual(immediateEvents({ operation: 'update', doc: base }), [])
})

test('missedDue: true when go-live passed and still unapproved', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T13:01:00.000Z')), true)
})

test('missedDue: false before go-live', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T12:00:00.000Z')), false)
})

test('missedDue: false when approved (it will publish, not miss)', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'approved', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'scheduled' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T14:00:00.000Z')), false)
})

test('missedDue: false once alert already sent (idempotent)', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: { missedAlertSentAt: '2026-07-06T13:05:00.000Z' } }
  assert.equal(missedDue(post, new Date('2026-07-06T14:00:00.000Z')), false)
})

test('immediateEvents flags published on transition into sent', () => {
  const sent = { ...base, publish: { state: 'sent' } }
  assert.deepEqual(
    immediateEvents({ operation: 'update', doc: sent, previousDoc: { ...base, publish: { state: 'publishing' } } }),
    ['published'],
  )
  // no transition: was already sent
  assert.deepEqual(immediateEvents({ operation: 'update', doc: sent, previousDoc: sent }), [])
  // already notified
  assert.deepEqual(
    immediateEvents({ operation: 'update', doc: { ...sent, notify: { publishedNotifiedAt: 'x' } }, previousDoc: base }),
    [],
  )
})
