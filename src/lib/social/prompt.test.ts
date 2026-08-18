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
  // Stored per post as generation_meta_prompt_version, so bumping it is how we tell
  // drafts written under the old rules from drafts written under the new ones.
  assert.equal(PROMPT_VERSION, 'v3-bullets')
})

test('system prompt bans the AI-slop vocabulary', () => {
  const s = buildSystemPrompt(brand)
  for (const word of ['delve', 'leverage', 'streamline', 'robust', 'transformative', 'empower']) {
    assert.match(s, new RegExp(`\\b${word}\\b`), `expected the prompt to ban "${word}"`)
  }
})

test('system prompt names the slop patterns it must avoid, with examples', () => {
  const s = buildSystemPrompt(brand)
  // Naming the pattern is not enough - a model follows a concrete counter-example far more
  // reliably than an abstract label, so each rule ships with one.
  assert.match(s, /not a marketing problem/i, 'binary-contrast example missing')
  assert.match(s, /Here's the thing/i, 'throat-clearing example missing')
  assert.match(s, /nobody tells you/i, 'faux-insight example missing')
  assert.match(s, /pivotal moment/i, 'importance-puffery example missing')
  assert.match(s, /studies show|experts agree/i, 'weasel-attribution example missing')
  assert.match(s, /em dash/i, 'em-dash rule missing')
})

test('system prompt keeps brand rules winning over the writing rules', () => {
  // The writing rules are style; banned terms and disclaimers are compliance. If the two
  // ever disagree, compliance has to win, so both must still be present and explicit.
  const s = buildSystemPrompt(brand)
  assert.match(s, /guarantee/)
  assert.match(s, /Results vary by practice\./)
  assert.match(s, /Confident, plain-spoken/)
})

test('the system prompt bans the mid-sentence negation contrast', () => {
  const sys = buildSystemPrompt({
    name: 'B', voice: 'v', themes: [], defaultCtas: [],
    bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
  })
  assert.match(sys, /not the destination/)
})

test('the system prompt explains when bullets are allowed and how to render them', () => {
  const sys = buildSystemPrompt({
    name: 'B', voice: 'v', themes: [], defaultCtas: [],
    bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
  })
  assert.match(sys, /•/)
  assert.match(sys, /strips markdown/i)
})

test('the user prompt asks for a format in the JSON contract', () => {
  const user = buildUserPrompt(
    { name: 'B', voice: 'v', themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [] },
    { approved: [], edited: [], rejections: [] },
    { theme: 'T', platform: 'linkedin', language: 'en', count: 1 },
  )
  assert.match(user, /"format"/)
})
