import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildImagePrompt } from './prompt'

test('buildImagePrompt includes theme, copy intent, and brand style guidance', () => {
  const out = buildImagePrompt(
    { copy: 'Denials are draining your clinic. Here is how to fix them.', theme: 'Denials', cta: 'Book a demo' },
    { name: 'PS | RCM', imageStyleGuidance: 'clean clinical, navy and purple accents' },
    true,
  )
  assert.match(out, /Denials/)
  assert.match(out, /draining your clinic/)
  assert.match(out, /navy and purple accents/)
  assert.match(out, /reference images/i)
})

test('buildImagePrompt omits reference images line when hasReferences is false', () => {
  const out = buildImagePrompt(
    { copy: 'Denials are draining your clinic. Here is how to fix them.', theme: 'Denials' },
    { name: 'PS | RCM', imageStyleGuidance: 'clean clinical, navy and purple accents' },
    false,
  )
  assert.doesNotMatch(out, /reference images/i)
})

test('buildImagePrompt tolerates missing optional fields', () => {
  const out = buildImagePrompt({}, {})
  assert.equal(typeof out, 'string')
  assert.ok(out.length > 0)
})
