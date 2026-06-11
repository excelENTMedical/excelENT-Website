import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDrafts } from './generate'

test('parses a clean JSON array', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'hi', cta: 'Book' }])
})

test('tolerates fences and surrounding prose', () => {
  const out = parseDrafts('Here you go:\n```json\n[{"copy":"a"}]\n```\nThanks!')
  assert.deepEqual(out, [{ copy: 'a', cta: undefined }])
})

test('drops malformed elements', () => {
  const out = parseDrafts('[{"copy":"ok"},{"nope":1},42]')
  assert.deepEqual(out, [{ copy: 'ok', cta: undefined }])
})

test('throws when there is no array', () => {
  assert.throws(() => parseDrafts('the model refused'))
})

test('ignores trailing prose that contains a bracket', () => {
  const out = parseDrafts('[{"copy":"hi"}]\nSee [note] above.')
  assert.deepEqual(out, [{ copy: 'hi', cta: undefined }])
})
