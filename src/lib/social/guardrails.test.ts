import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkGuardrails } from './guardrails'

test('clean copy with no rules passes', () => {
  const r = checkGuardrails('Helping ENTs run a better practice.', [], [])
  assert.deepEqual(r, { ok: true, bannedHits: [], missingDisclaimers: [] })
})

test('flags a banned term case-insensitively', () => {
  const r = checkGuardrails('Guaranteed CURE for sinusitis!', ['cure', 'guarantee'], [])
  assert.equal(r.ok, false)
  assert.deepEqual(r.bannedHits.sort(), ['cure', 'guarantee'])
})

test('flags a missing required disclaimer', () => {
  const r = checkGuardrails('Book your visit today.', [], ['Not medical advice.'])
  assert.equal(r.ok, false)
  assert.deepEqual(r.missingDisclaimers, ['Not medical advice.'])
})

test('passes when the required disclaimer is present (whitespace/case tolerant)', () => {
  const r = checkGuardrails('Book today.   not   MEDICAL   advice.', [], ['Not medical advice.'])
  assert.equal(r.ok, true)
  assert.deepEqual(r.missingDisclaimers, [])
})

test('ignores empty/whitespace rule entries', () => {
  const r = checkGuardrails('Anything goes.', ['', '   '], ['', '  '])
  assert.equal(r.ok, true)
})
