import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareHook } from './templates/hook'
import { prepareStat } from './templates/stat'
import { prepareDataViz } from './templates/dataviz'

const brand = 'PS | RCM'

test('prepareHook splits the headline and carries the brand', () => {
  const d = prepareHook({ headline: 'A. B.' }, brand)
  assert.equal(d.lead, 'A.')
  assert.equal(d.accent, 'B.')
  assert.equal(d.brand, brand)
})

test('prepareStat passes stat fields through and clamps the sub', () => {
  const long = 'x'.repeat(200)
  const d = prepareStat({ statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate', subtext: long }, brand)
  assert.equal(d.from, '11.8%')
  assert.equal(d.to, '2.5%')
  assert.equal(d.label, 'Denial Rate')
  assert.ok(d.sub.length <= 121) // 120 + ellipsis
})

test('prepareDataViz computes relative bar heights from percentages', () => {
  const d = prepareDataViz({ statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial rate', caption: 'note' }, brand)
  assert.equal(d.hiPct, 11.8)
  assert.equal(d.loPct, 2.5)
  assert.equal(d.hiHeight, 100) // taller bar is the reference
  assert.ok(d.loHeight > 18 && d.loHeight < 26) // ~21%
})
