import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dueWhere, isClaimable, MAX_ATTEMPTS } from './scheduler'

test('dueWhere selects approved posts due at or before now', () => {
  const w: any = dueWhere('2026-06-18T12:00:00.000Z')
  const and = w.and
  assert.ok(and.some((c: any) => c.status?.equals === 'approved'))
  assert.ok(and.some((c: any) => c.scheduledTime?.less_than_equal === '2026-06-18T12:00:00.000Z'))
  assert.ok(and.some((c: any) => Array.isArray(c['publish.state']?.in)))
})

test('isClaimable respects state and the attempts cap', () => {
  assert.equal(isClaimable({ publish: { state: 'pending', attempts: 0 } }), true)
  assert.equal(isClaimable({ publish: { state: 'scheduled', attempts: 2 } }), true)
  assert.equal(isClaimable({ publish: { state: 'failed', attempts: MAX_ATTEMPTS } }), false)
  assert.equal(isClaimable({ publish: { state: 'sent', attempts: 0 } }), false)
  assert.equal(isClaimable({ publish: { state: 'publishing', attempts: 0 } }), false)
})
