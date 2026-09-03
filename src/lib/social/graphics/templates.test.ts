import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareHook } from './templates/hook'
import { prepareStat } from './templates/stat'
import { prepareDataViz } from './templates/dataviz'
import { hasStatPair, prepareLayout } from './templates/shared'

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

test('prepareLayout fills the lockup from the brand slug', () => {
  const d = prepareLayout({ fields: { headline: 'A. B.' }, brandSlug: 'ps-rcm' })
  assert.equal(d.product, 'RCM')
  assert.equal(d.descriptor, 'REVENUE CYCLE MANAGEMENT')
  assert.equal(d.lead, 'A.')
  assert.equal(d.accent, 'B.')
})

test('prepareLayout lets the post override the brand descriptor', () => {
  const d = prepareLayout({ fields: { descriptor: 'CUSTOM LINE' }, brandSlug: 'ps-rcm' })
  assert.equal(d.descriptor, 'CUSTOM LINE')
})

test('prepareLayout prefers the graphic caption over the post cta', () => {
  const withCaption = prepareLayout({ fields: { caption: 'Caption wins' }, cta: 'Post cta' })
  assert.equal(withCaption.cta, 'Caption wins')
  const withoutCaption = prepareLayout({ fields: {}, cta: 'Post cta' })
  assert.equal(withoutCaption.cta, 'Post cta')
})

test('prepareLayout leaves absent content empty rather than inventing it', () => {
  const d = prepareLayout({ fields: {}, brandSlug: 'does-not-exist' })
  assert.equal(d.lead, '')
  assert.equal(d.accent, '')
  assert.equal(d.sub, '')
  assert.equal(d.cta, null)
  assert.equal(d.descriptor, null)
  assert.deepEqual(d.items, [])
})

test('prepareLayout keeps enough items for both bands of a twoband', () => {
  const raw = Array.from({ length: 11 }, (_, i) => `row ${i}`).join('\n')
  assert.equal(prepareLayout({ fields: { items: raw } }).items.length, 11)
})

test('hasStatPair needs both ends', () => {
  assert.equal(hasStatPair(prepareLayout({ fields: { statFrom: '11.8%', statTo: '2.5%' } })), true)
  assert.equal(hasStatPair(prepareLayout({ fields: { statFrom: '11.8%' } })), false)
  assert.equal(hasStatPair(prepareLayout({ fields: {} })), false)
})
