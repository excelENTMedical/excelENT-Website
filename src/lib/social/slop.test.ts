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

test('flags a dramatic colon reveal', () => {
  assert.ok(rules('The best part: it learns your payer mix.').includes('colonReveal'))
})

test('a colon introducing a bullet list is correct, not a reveal', () => {
  const copy = 'Most denials trace back to the same four causes:\n\n• Coverage not verified\n• Wrong modifier\n• Missing documentation\n• Filed late'
  assert.ok(!rules(copy).includes('colonReveal'))
})

test('a clock time is not a colon reveal', () => {
  assert.ok(!rules('Your phone stays locked after 5:30 p.m. every weekday.').includes('colonReveal'))
})

test('flags the mid-sentence X-not-Y contrast the v2 rules missed', () => {
  assert.ok(rules('A new sinus patient evaluation is a starting point, not the destination.').includes('notYButX'))
})

test('flags the not-just-but form', () => {
  assert.ok(rules('This is not just billing, but the whole revenue cycle.').includes('notYButX'))
})

test('flags the two-sentence binary contrast', () => {
  assert.ok(rules("That's not a marketing problem. That's a patient journey problem.").includes('binaryContrast'))
})

test('flags a dramatic fragment', () => {
  // The fragment must NOT be on the last line — that line is the CTA and is excluded.
  const copy = 'The claim goes out clean every time. That is it.\n\nRequest a Demo.'
  assert.ok(rules(copy).includes('dramaticFragment'))
})

test('a bullet line is never a dramatic fragment', () => {
  const copy = 'Four causes drive most denials.\n\n• Coverage unverified\n• Wrong modifier\n• Missing notes\n\nPS | RCM catches all four before the claim goes out.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('the final CTA line is never a dramatic fragment', () => {
  const copy = 'Your front desk answers the same three questions all day long.\n\nRequest a Demo.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('a quoted line is never a dramatic fragment', () => {
  // Lives in a real seed example: the phone-tree quote in brand 2.
  const copy = '"Press 1 for scheduling. Press 2 for billing."\n\nPhone trees were designed around the org chart rather than the patient problem.'
  assert.ok(!rules(copy).includes('dramaticFragment'))
})

test('flags the Most-noun formula opener', () => {
  assert.ok(rules('Most practices accept denied claims as a billing reality. They should not.').includes('formulaOpener'))
})

test('only the opening sentence can be a formula opener', () => {
  assert.ok(!rules('Denials cost you real money. Most practices accept them anyway.').includes('formulaOpener'))
})

test('flags weasel attribution', () => {
  assert.ok(rules('Studies show that denial rates keep climbing.').includes('weaselAttribution'))
})
