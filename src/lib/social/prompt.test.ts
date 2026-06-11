import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from './prompt'
import type { BrandConfigForPrompt, FewShotCorpus, GenerateOptions } from './types'

const brand: BrandConfigForPrompt = {
  name: 'PS | RCM',
  voice: 'Confident, plain-spoken, never hypey.',
  audience: 'ENT practice administrators.',
  themes: [{ theme: 'Denials', description: 'Reducing claim denials' }],
  defaultCtas: ['Book a demo'],
  bannedTerms: ['guarantee'],
  requiredDisclaimers: ['Results vary by practice.'],
  seedExamples: ['Denials quietly drain revenue. Here is how to stop them.'],
}

const emptyCorpus: FewShotCorpus = { approved: [], edited: [], rejections: [] }
const opts: GenerateOptions = { theme: 'Denials', platform: 'linkedin', language: 'en', count: 2 }

test('system prompt includes voice, banned terms, and disclaimers', () => {
  const s = buildSystemPrompt(brand)
  assert.match(s, /Confident, plain-spoken/)
  assert.match(s, /guarantee/)
  assert.match(s, /Results vary by practice\./)
  assert.match(s, /healthcare/i)
})

test('user prompt renders count, language, theme description, and platform rules', () => {
  const u = buildUserPrompt(brand, emptyCorpus, opts)
  assert.match(u, /2 distinct social media post/)
  assert.match(u, /English/)
  assert.match(u, /Reducing claim denials/)
  assert.match(u, /LinkedIn/)
  assert.match(u, /JSON array/)
})

test('user prompt omits corpus sections when empty', () => {
  const u = buildUserPrompt(brand, emptyCorpus, opts)
  assert.doesNotMatch(u, /APPROVED/)
  assert.doesNotMatch(u, /REJECTED/)
  assert.doesNotMatch(u, /HUMAN EDITS/)
})

test('user prompt includes corpus sections when present', () => {
  const corpus: FewShotCorpus = {
    approved: ['nice post'],
    edited: [{ before: 'raw', after: 'polished' }],
    rejections: [{ copy: 'bad', reason: 'too salesy' }],
  }
  const u = buildUserPrompt(brand, corpus, opts)
  assert.match(u, /nice post/)
  assert.match(u, /raw/)
  assert.match(u, /polished/)
  assert.match(u, /too salesy/)
})

test('exposes a prompt version string', () => {
  assert.equal(PROMPT_VERSION, 'v1')
})
