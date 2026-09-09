import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldReplaceAsset } from './attach'

test('shouldReplaceAsset replaces a machine render', () => {
  // Post #24: revised twoband -> orbit, but the twoband PNG stayed attached
  // because nothing re-rendered it.
  assert.equal(shouldReplaceAsset({ source: 'ai-generated' }), true)
})

test('shouldReplaceAsset never clobbers a human upload', () => {
  assert.equal(shouldReplaceAsset({ source: 'uploaded' }), false)
})

test('shouldReplaceAsset leaves an unattached post alone', () => {
  // With no asset the preview renders live, so the revision is already visible.
  assert.equal(shouldReplaceAsset(null), false)
  assert.equal(shouldReplaceAsset(undefined), false)
  assert.equal(shouldReplaceAsset({}), false)
})
