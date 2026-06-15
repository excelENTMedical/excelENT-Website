import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clamp, parsePercent, splitHook } from './text'

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
