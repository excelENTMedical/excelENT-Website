import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareHook } from './templates/hook'
import { prepareStat } from './templates/stat'
import { prepareDataViz } from './templates/dataviz'
import { NO_DESCRIPTOR, hasStatPair, prepareLayout } from './templates/shared'
import { TwoBandCard } from './templates/twoband'
import { THEMES } from './theme'

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

test(`prepareLayout drops the descriptor on ${NO_DESCRIPTOR}, without falling back to the brand`, () => {
  // The brands with unconfirmed placeholder descriptors need a way to publish
  // a layout with no descriptor line at all.
  const d = prepareLayout({ fields: { descriptor: NO_DESCRIPTOR }, brandSlug: 'ps-lexi' })
  assert.equal(d.descriptor, null)
  assert.equal(d.product, 'LEXI')
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

/**
 * Walk a template's element tree and collect every string it would draw.
 * The PNG assertions in render.test.ts only prove a template did not throw;
 * they cannot see that it drew a lockup separator with nothing after it.
 */
function drawnText(node: unknown, out: string[] = []): string[] {
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const n of node) drawnText(n, out)
    return out
  }
  const el = node as { type?: unknown; props?: { children?: unknown } }
  if (!el.props) return out
  if (typeof el.type === 'function') {
    return drawnText((el.type as (p: unknown) => unknown)(el.props), out)
  }
  return drawnText(el.props.children, out)
}

test('twoband omits the PS lockup for an umbrella brand with no product', () => {
  // excelent-practice-solutions has product: null. The hand-rolled lockup in
  // twoband drew "PS |" with an empty product — post #24 shipped that way.
  const data = prepareLayout({
    fields: { headline: 'A. B.', items: 'RCM|Claims|doc\nLEXI|Calls|phone', descriptor: NO_DESCRIPTOR },
    brandSlug: 'excelent-practice-solutions',
    cta: 'Go',
  })
  assert.equal(data.product, null)
  assert.equal(data.descriptor, null)
  const drawn = drawnText(TwoBandCard({ data, theme: THEMES.b2b }))
  assert.ok(!drawn.includes('PS'), 'drew a bare PS with no product after it')
  assert.ok(!drawn.includes('|'), 'drew a dangling lockup separator')
})

test('twoband still draws the descriptor when the brand has no product', () => {
  const data = prepareLayout({
    fields: { headline: 'A. B.', items: 'RCM|Claims|doc' },
    brandSlug: 'excelent-practice-solutions',
  })
  assert.equal(data.product, null)
  const drawn = drawnText(TwoBandCard({ data, theme: THEMES.b2b }))
  assert.ok(drawn.includes('THE ENT PRACTICE PLATFORM'), 'dropped the descriptor along with the lockup')
  assert.ok(!drawn.includes('PS'), 'drew a bare PS with no product after it')
})

test('twoband keeps the PS | PRODUCT lockup for a product brand', () => {
  const data = prepareLayout({
    fields: { headline: 'A. B.', items: 'Step|One|doc' },
    brandSlug: 'ps-rcm',
  })
  const drawn = drawnText(TwoBandCard({ data, theme: THEMES.b2b }))
  assert.ok(drawn.includes('PS'), 'lost the PS half of the lockup')
  assert.ok(drawn.includes('RCM'), 'lost the product half of the lockup')
})
