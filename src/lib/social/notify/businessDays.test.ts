import { test } from 'node:test'
import assert from 'node:assert/strict'
import { zonedYMD, reviewSendAt } from './businessDays'

const TZ = 'America/New_York'

test('zonedYMD reports the ET calendar date across a UTC midnight boundary', () => {
  // 02:00Z is still the previous evening (22:00 EDT) in New York
  assert.deepEqual(zonedYMD(new Date('2026-06-25T02:00:00Z'), TZ), { y: 2026, m: 6, d: 24 })
})

test('review lands 2 business days before each weekday go-live, 09:00 ET', () => {
  // Company: Monday go-live -> Thursday prior week
  assert.equal(reviewSendAt('2026-06-22T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-18T13:00:00.000Z')
  // RCM: Tuesday -> Friday prior week
  assert.equal(reviewSendAt('2026-06-23T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-19T13:00:00.000Z')
  // Lexi: Wednesday -> Monday
  assert.equal(reviewSendAt('2026-06-24T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-22T13:00:00.000Z')
  // Connect: Thursday -> Tuesday
  assert.equal(reviewSendAt('2026-06-25T15:00:00Z', 2, 9, TZ).toISOString(), '2026-06-23T13:00:00.000Z')
})

test('handles EST (winter) offset', () => {
  // 2026-01-07 is a Wednesday; 2 business days before = Monday 2026-01-05, 09:00 EST = 14:00Z
  assert.equal(reviewSendAt('2026-01-07T15:00:00Z', 2, 9, TZ).toISOString(), '2026-01-05T14:00:00.000Z')
})
