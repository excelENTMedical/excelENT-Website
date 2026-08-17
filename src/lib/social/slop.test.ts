import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectSlop, prepare } from './slop'

const rules = (copy: string, disclaimers?: string[]) =>
  detectSlop(copy, { requiredDisclaimers: disclaimers }).flags.map((f) => f.rule)

test('clean prose trips nothing', () => {
  const copy = 'Your denial rate is a cash-flow number. Partner practices have pushed their rate toward 2.5% with coders who work only in ENT.\n\nRequest a Demo.'
  assert.deepEqual(detectSlop(copy), { ok: true, flags: [] })
})

test('flags a single em dash and quotes the offending line', () => {
  const flags = detectSlop('The phones ring all day — and nobody answers them.').flags
  assert.deepEqual(flags.map((f) => f.rule), ['emDash'])
  assert.match(flags[0].excerpt, /phones ring all day/)
})

test('flags two em dashes as both emDash and multiEmDash', () => {
  assert.deepEqual(
    rules('One thing — then another — then a third.').sort(),
    ['emDash', 'multiEmDash'],
  )
})

test('a required disclaimer is excluded even though it carries an em dash', () => {
  const disclaimer = 'This content is for general information only — it is not medical advice.'
  assert.deepEqual(rules(`Book a visit today.\n\n${disclaimer}`, [disclaimer]), [])
})

test('disclaimer exclusion survives reflowed whitespace', () => {
  const disclaimer = 'Not medical advice — talk to your doctor.'
  const copy = 'Book a visit.\n\nNot medical advice —\ntalk to your doctor.'
  assert.deepEqual(rules(copy, [disclaimer]), [])
})

test('the trailing hashtag block is excluded', () => {
  const copy = 'Open capacity costs you money.\n\n#ENT #Otolaryngology #PracticeManagement'
  assert.deepEqual(rules(copy), [])
})

test('prepare strips disclaimers and hashtags but keeps the body', () => {
  const out = prepare('Body text here.\n\n#ENT #Sinus', [])
  assert.match(out, /Body text here\./)
  assert.doesNotMatch(out, /#ENT/)
})
