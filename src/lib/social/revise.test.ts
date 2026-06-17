import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRevisePrompt } from './revise'
import type { BrandConfigForPrompt } from './types'

const BRAND: BrandConfigForPrompt = {
  name: 'PS | RCM', voice: 'operator voice', audience: 'ENT owners',
  themes: [], defaultCtas: ['Request a Demo'], bannedTerms: ['guaranteed'],
  requiredDisclaimers: [], seedExamples: [],
}

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
