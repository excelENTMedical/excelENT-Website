import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canReschedule } from './guard'

test('canReschedule: blocks sent/publishing', () => {
  assert.equal(canReschedule('sent'), false)
  assert.equal(canReschedule('publishing'), false)
})
test('canReschedule: allows pending/scheduled/failed/undefined', () => {
  for (const s of ['pending', 'scheduled', 'failed', undefined]) assert.equal(canReschedule(s), true)
})
