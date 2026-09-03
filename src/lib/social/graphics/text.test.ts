import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clamp, parseArtefact, parseItems, parsePercent, splitHeadline, splitHook } from './text'

test('clamp trims to length with an ellipsis', () => {
  assert.equal(clamp('hello world', 5), 'hello…')
  assert.equal(clamp('short', 20), 'short')
  assert.equal(clamp('  spaced  ', 20), 'spaced')
})

test('parsePercent reads a leading number', () => {
  assert.equal(parsePercent('11.8%'), 11.8)
  assert.equal(parsePercent('2.5'), 2.5)
  assert.equal(parsePercent('n/a'), null)
})

test('splitHook splits on the final sentence', () => {
  assert.deepEqual(
    splitHook("Your denial rate isn't a billing metric. It's a cash-flow leak."),
    { lead: "Your denial rate isn't a billing metric.", accent: "It's a cash-flow leak." },
  )
})

test('splitHook with one sentence puts everything in lead', () => {
  assert.deepEqual(splitHook('One strong line'), { lead: 'One strong line', accent: '' })
})

test('parseItems reads label, description and icon', () => {
  const items = parseItems('Coding accuracy | Catches coding errors | code\nPayer insights | Blind spots')
  assert.equal(items.length, 2)
  assert.deepEqual(items[0], { label: 'Coding accuracy', desc: 'Catches coding errors', icon: 'code' })
  assert.deepEqual(items[1], { label: 'Payer insights', desc: 'Blind spots', icon: null })
})

test('parseItems drops blank rows and caps the count', () => {
  const raw = ['a', '', '   ', 'b', 'c', 'd'].join('\n')
  assert.deepEqual(parseItems(raw, 2).map((i) => i.label), ['a', 'b'])
  assert.equal(parseItems(null).length, 0)
})

test('parseItems keeps a band separator as its own row', () => {
  const items = parseItems('a\n--\nb', 12)
  assert.deepEqual(items.map((i) => i.label), ['a', '--', 'b'])
})

test('parseItems keeps pipes inside a description', () => {
  const items = parseItems('Label | PS | RCM handles it | shield')
  assert.equal(items[0].label, 'Label')
  assert.equal(items[0].desc, 'PS')
  assert.equal(items[0].icon, 'RCM handles it')
})

test('splitHeadline prefers a sentence break', () => {
  const { lead, accent } = splitHeadline('Built for ENT. Only ENT.')
  assert.equal(lead, 'Built for ENT.')
  assert.equal(accent, 'Only ENT.')
})

test('splitHeadline falls back to the last comma', () => {
  const { lead, accent } = splitHeadline('One platform, every part of your practice')
  assert.equal(lead, 'One platform,')
  assert.equal(accent, 'every part of your practice')
})

test('splitHeadline balances a single clause at a word boundary', () => {
  // Without this the line renders entirely navy and loses the two-tone
  // treatment that every approved graphic has.
  const { lead, accent } = splitHeadline('Your denial rate is one number')
  assert.equal(lead, 'Your denial rate')
  assert.equal(accent, 'is one number')
})

test('splitHeadline leaves a short line whole', () => {
  // Under four words there is nothing to balance.
  const { lead, accent } = splitHeadline('Built for ENT')
  assert.equal(lead, 'Built for ENT')
  assert.equal(accent, '')
})

test('splitHeadline never drops or duplicates words', () => {
  for (const h of [
    'Their decision happens fast.',
    'One platform, every part of your practice',
    'Built for ENT. Only ENT.',
    'Your front desk has better things to do',
  ]) {
    const { lead, accent } = splitHeadline(h)
    assert.equal([lead, accent].filter(Boolean).join(' '), h.trim())
  }
})

test('parseArtefact splits the label from the stamp', () => {
  assert.deepEqual(parseArtefact('Claim / Denied'), { label: 'Claim', stamp: 'Denied' })
  assert.deepEqual(parseArtefact('Claim'), { label: 'Claim', stamp: '' })
  assert.deepEqual(parseArtefact(null), { label: '', stamp: '' })
})
