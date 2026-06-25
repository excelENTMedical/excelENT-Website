import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify, bucketize, type BucketCfg } from './buckets'

const CFG: BucketCfg = { leadDays: 2, hourEt: 9, tz: 'America/New_York' }
// Fixed "now" for deterministic tests: Wed 2026-06-24 18:00:00 UTC (14:00 ET).
const NOW = new Date('2026-06-24T18:00:00Z')
const hours = (n: number) => new Date(NOW.getTime() + n * 3600_000).toISOString()

test('missed: past go-live, undecided, not published', () => {
  const post = { status: 'draft', scheduledTime: hours(-3), publish: { state: 'pending' } }
  assert.equal(classify(post, NOW, CFG), 'missed')
})

test('missed excludes approved and rejected', () => {
  assert.equal(classify({ status: 'approved', scheduledTime: hours(-3) }, NOW, CFG), null)
  assert.equal(classify({ status: 'rejected', scheduledTime: hours(-3) }, NOW, CFG), null)
})

test('missed excludes already-published (publish.state sent)', () => {
  const post = { status: 'draft', scheduledTime: hours(-3), publish: { state: 'sent' } }
  assert.equal(classify(post, NOW, CFG), null)
})

test('overdue: undecided, within 24h before go-live', () => {
  const post = { status: 'needs-changes', scheduledTime: hours(6) }
  assert.equal(classify(post, NOW, CFG), 'overdue')
})

test('overdue takes priority over review-overdue when no review email and <24h out', () => {
  // <24h out AND no review email sent -> single assignment must be 'overdue'.
  const post = { status: 'draft', scheduledTime: hours(6), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), 'overdue')
})

test('awaiting: undecided, review email sent, >24h before go-live', () => {
  const post = { status: 'draft', scheduledTime: hours(72), notify: { reviewSentAt: hours(-24) } }
  assert.equal(classify(post, NOW, CFG), 'awaiting')
})

test('review-overdue: undecided, no review email, past send time, >24h out', () => {
  // +48h go-live → reviewSendAt (2 business days before, 9am ET) = 2026-06-24T13:00Z,
  // which is before NOW (18:00Z); and 48h > 24h so it is not the overdue bucket.
  // (Verified against the real reviewSendAt: +48h reviewSendAt<NOW true, +72h false.)
  const post = { status: 'draft', scheduledTime: hours(48), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), 'review-overdue')
})

test('review-overdue excludes approved posts', () => {
  const post = { status: 'approved', scheduledTime: hours(72), notify: { reviewSentAt: null } }
  assert.equal(classify(post, NOW, CFG), null)
})

test('no scheduledTime -> null', () => {
  assert.equal(classify({ status: 'draft' }, NOW, CFG), null)
})

test('invalid scheduledTime -> null (never throws)', () => {
  assert.equal(classify({ status: 'draft', scheduledTime: 'not-a-date' }, NOW, CFG), null)
})

test('bucketize groups and sorts awaiting soonest-first', () => {
  const posts = [
    { id: 1, status: 'draft', scheduledTime: hours(96), notify: { reviewSentAt: hours(-1) } },
    { id: 2, status: 'draft', scheduledTime: hours(48), notify: { reviewSentAt: hours(-1) } },
    { id: 3, status: 'draft', scheduledTime: hours(-3), publish: { state: 'pending' } },
  ]
  const out = bucketize(posts, NOW, CFG)
  assert.deepEqual(out.awaiting.map((p) => (p as any).id), [2, 1])
  assert.deepEqual(out.missed.map((p) => (p as any).id), [3])
})
