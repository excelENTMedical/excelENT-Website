// src/lib/social/calendar/slots.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { materializeSlots } from './slots'

test('materializeSlots: one weekly Monday 09:00 ET slot lands at 13:00 UTC in summer (EDT)', () => {
  // 2026-07-06 is a Monday. Window covers that week.
  const out = materializeSlots(
    [{ platform: 'linkedin', dayOfWeek: 1, time: '09:00' }],
    '2026-07-05T00:00:00.000Z',
    '2026-07-08T00:00:00.000Z',
  )
  assert.equal(out.length, 1)
  assert.equal(out[0].platform, 'linkedin')
  assert.equal(out[0].scheduledTime, '2026-07-06T13:00:00.000Z') // EDT = UTC-4
})

test('materializeSlots: same wall-time is UTC-5 in winter (EST)', () => {
  // 2026-01-05 is a Monday.
  const out = materializeSlots(
    [{ platform: 'linkedin', dayOfWeek: 1, time: '09:00' }],
    '2026-01-04T00:00:00.000Z',
    '2026-01-07T00:00:00.000Z',
  )
  assert.equal(out[0].scheduledTime, '2026-01-05T14:00:00.000Z') // EST = UTC-5
})

test('materializeSlots: multiple rules over 2 weeks, sorted ascending', () => {
  const out = materializeSlots(
    [
      { platform: 'linkedin', dayOfWeek: 1, time: '09:00' },
      { platform: 'linkedin', dayOfWeek: 3, time: '12:00' },
    ],
    '2026-07-05T00:00:00.000Z',
    '2026-07-19T00:00:00.000Z',
  )
  assert.equal(out.length, 4) // 2 Mondays + 2 Wednesdays
  for (let i = 1; i < out.length; i++) assert.ok(out[i - 1].scheduledTime <= out[i].scheduledTime)
})
