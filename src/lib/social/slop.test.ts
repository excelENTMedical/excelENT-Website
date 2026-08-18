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

test('a colon introducing a comma-separated inline list is not a colonReveal', () => {
  const copy = 'The drivers of denials are usually preventable with proper processes and analytics: procedure-level coding errors, payer-pattern blind spots, and generalist billers who don\'t know ENT coding specifics.'
  assert.ok(!rules(copy).includes('colonReveal'))
})

test('a colon reveal with exactly one comma is still flagged', () => {
  assert.ok(rules('The best part: it learns your payer mix, fast.').includes('colonReveal'))
})

// --- dash variants -----------------------------------------------------------------
// The em dash was only the most common spelling of the tic. Matching it alone let the
// repair pass "succeed" by substituting an en dash or a spaced hyphen: flag count drops,
// the accept rule takes it, the corpus gate reads it as clean, and it gets amplified as a
// top exemplar. Every spelling has to be the same rule, or the tic just migrates.

test('flags an en dash as emDash', () => {
  const flags = detectSlop('The claim goes out – and comes back denied.').flags
  assert.deepEqual(flags.map((f) => f.rule), ['emDash'])
  assert.match(flags[0].excerpt, /claim goes out/)
})

test('flags a horizontal bar as emDash', () => {
  assert.ok(rules('The phones ring all day ― nobody answers them.').includes('emDash'))
})

test('flags a double hyphen as emDash, spaced or unspaced', () => {
  assert.ok(rules('The claim goes out -- and comes back denied.').includes('emDash'))
  assert.ok(rules('The claim goes out--and comes back denied.').includes('emDash'))
})

test('flags a spaced hyphen used as a sentence-level dash', () => {
  assert.ok(rules('The claim goes out - and comes back denied.').includes('emDash'))
})

test('a compound modifier is not a dash', () => {
  // All 82 hyphens in the live corpus on 2026-08-18 were of this shape. Flagging them
  // would drown the review queue in noise and teach reviewers to ignore the column.
  const copy = 'ENT-specific coders handle every follow-up, in-office post-op and HIPAA-compliant hand-off.'
  assert.deepEqual(rules(copy), [])
})

test('a numeric range is not a dash, hyphen or en dash', () => {
  assert.deepEqual(rules('Front desk hours run 9-5 and the trend held from 2022-2026.'), [])
  assert.deepEqual(rules('Front desk hours run 9–5 and the trend held from 2022–2026.'), [])
})

test('a hyphen bullet line is not a dash', () => {
  const copy = 'Three things drive denials here:\n\n- Coding errors caught late\n- Payer patterns nobody tracks\n- Eligibility checked after the visit\n\nRequest a Demo.'
  assert.ok(!rules(copy).includes('emDash'))
})

test('a separator rule of dashes is not a dash', () => {
  assert.ok(!rules('Denials cost real money.\n\n---\n\nRequest a Demo.').includes('emDash'))
})

test('dash variants count together toward multiEmDash', () => {
  // A post that swapped one em dash for an en dash used to read as a successful repair.
  assert.deepEqual(
    rules('One thing — then another – then a third.').sort(),
    ['emDash', 'multiEmDash'],
  )
  assert.deepEqual(
    rules('One thing -- then another - then a third.').sort(),
    ['emDash', 'multiEmDash'],
  )
})

test('a disclaimer carrying an en dash is still excluded', () => {
  const disclaimer = 'This content is for general information only – it is not medical advice.'
  assert.deepEqual(rules(`Book a visit today.\n\n${disclaimer}`, [disclaimer]), [])
})
