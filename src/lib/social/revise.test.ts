import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRevisePrompt, parseRevision, buildRevisionMeta } from './revise'
import type { BrandConfigForPrompt } from './types'

const BRAND: BrandConfigForPrompt = {
  name: 'PS | RCM', voice: 'operator voice', audience: 'ENT owners',
  themes: [], defaultCtas: ['Request a Demo'], bannedTerms: ['guaranteed'],
  requiredDisclaimers: [], seedExamples: [],
}

test('revisions inherit the anti-slop writing rules', () => {
  // Rules applied only at generation would be undone by the first reviewer revision, so the
  // revise path must keep sharing buildSystemPrompt rather than growing its own.
  const { system } = buildRevisePrompt(BRAND, { copy: 'old copy' }, 'punch it up', 'copy')
  assert.match(system, /WRITING RULES/)
  assert.match(system, /\bdelve\b/)
  assert.match(system, /Binary contrasts/i)
})

test('buildRevisePrompt(copy) carries the note, current copy, and a copy-only JSON contract', () => {
  const { system, user } = buildRevisePrompt(BRAND, { copy: 'old copy', cta: 'Book' }, 'make it punchier', 'copy')
  assert.match(user, /make it punchier/)
  assert.match(user, /old copy/)
  assert.match(user, /"copy"/)
  assert.doesNotMatch(user, /graphicStyle/)
  assert.match(system, /BRAND VOICE/)
  assert.match(system, /guaranteed/)
})

test('buildRevisePrompt(graphic) asks for graphic JSON only', () => {
  const { user } = buildRevisePrompt(
    BRAND, { copy: 'c', graphicStyle: 'hook', graphic: { headline: 'h' } }, 'use the stat card', 'graphic')
  assert.match(user, /use the stat card/)
  assert.match(user, /graphicStyle/)
  assert.doesNotMatch(user, /"copy"/)
})

test('buildRevisePrompt(both) asks for copy and graphic', () => {
  const { user } = buildRevisePrompt(BRAND, { copy: 'c' }, 'tighten everything', 'both')
  assert.match(user, /"copy"/)
  assert.match(user, /graphicStyle/)
})

test('parseRevision(copy) returns only copy/cta', () => {
  const out = parseRevision('{"copy":"new","cta":"Book","graphicStyle":"stat"}', 'copy')
  assert.deepEqual(out, { copy: 'new', cta: 'Book' })
})

test('parseRevision(graphic) returns only graphic fields and coerces unknown style', () => {
  const out = parseRevision('{"graphicStyle":"banana","graphic":{"statFrom":"9%","headline":""}}', 'graphic')
  assert.equal(out.graphicStyle, 'statement')
  assert.deepEqual(out.graphic, { statFrom: '9%' })
  assert.equal(out.copy, undefined)
})

test('parseRevision(both) returns copy and graphic, tolerating fences/prose', () => {
  const out = parseRevision('Sure:\n```json\n{"copy":"c","cta":"Book","graphicStyle":"stat","graphic":{"statTo":"2%"}}\n```', 'both')
  assert.equal(out.copy, 'c')
  assert.equal(out.graphicStyle, 'object')
  assert.deepEqual(out.graphic, { statTo: '2%' })
})

test('parseRevision throws when there is no object', () => {
  assert.throws(() => parseRevision('the model refused', 'copy'))
})

test('a revision stamps originalCopy with the REVISED copy, not the generated one', () => {
  // buildCorpus reads originalCopy !== copy as a human edit and promotes the pair into the
  // highest-priority exemplar tier. Leaving the generated text behind would launder every
  // Revise click into the corpus as a reviewer correction and teach the loop from itself.
  const meta = buildRevisionMeta(
    { promptVersion: 'v3-bullets', originalCopy: 'the generated copy' },
    'the revised copy',
    BRAND,
  )
  assert.equal(meta.originalCopy, 'the revised copy')
  assert.equal(meta.promptVersion, 'v3-bullets', 'unrelated meta keys survive')
})

test('a revision carries its slop flags instead of clearing the review queue', () => {
  const meta = buildRevisionMeta(null, 'Denials are preventable — the drivers are coding errors. Book a demo.', BRAND)
  assert.match(meta.guardrailFlags, /slop: .*emDash/)
})

test('a clean revision produces an empty flag string, not stray labels', () => {
  // The old inline string emitted "banned: ; missing disclaimers: " even when both were empty.
  const meta = buildRevisionMeta(null, 'Denials are preventable when coding is ENT specific. Book a demo.', BRAND)
  assert.equal(meta.guardrailFlags, '')
})
