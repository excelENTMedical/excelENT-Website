import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canvasFor, renderGraphic } from './render'
import { THEMES } from './theme'
import { LAYOUT_STYLES } from '@/lib/social/types'

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

test('renderGraphic returns a PNG buffer for the hook style', async () => {
  const buf = await renderGraphic({
    style: 'hook',
    brandName: 'PS | RCM',
    theme: THEMES.b2b,
    fields: { headline: "Your denial rate isn't a billing metric. It's a cash-flow leak." },
  })
  assert.ok(Buffer.isBuffer(buf))
  assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC))
  assert.ok(buf.length > 2000)
})

test('renderGraphic handles every style without throwing', async () => {
  const fields = { headline: 'H', subtext: 'S', statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate', caption: 'c' }
  for (const style of ['none', 'hook', 'stat', 'dataviz'] as const) {
    const buf = await renderGraphic({ style, brandName: 'PS | RCM', theme: THEMES.b2b, fields })
    assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC), `style ${style} not a PNG`)
  }
})

test('canvasFor is square for legacy cards and landscape for layouts', () => {
  assert.deepEqual(canvasFor('hook'), { width: 1080, height: 1080 })
  assert.deepEqual(canvasFor('none'), { width: 1080, height: 1080 })
  assert.deepEqual(canvasFor('object'), { width: 1536, height: 1024 })
  assert.deepEqual(canvasFor('statement'), { width: 1536, height: 1024 })
})

test('every layout style renders a PNG from a fully populated post', async () => {
  const fields = {
    headline: 'The denial gap. In ENT billing.',
    subtext: 'Denials are usually preventable. || Payer patterns get caught before submission.',
    statFrom: '11.8%',
    statTo: '2.5%',
    statLabel: 'Denial rate',
    caption: 'Book a denial-rate diagnostic',
    items: [
      'Coding accuracy | Catches procedure-level coding errors | code',
      'Payer insights | Catches payer-specific blind spots | shield',
      '--',
      'ENT-specialized billing | Not generalists learning ENT | users',
      'Result | A cleaner claim, first time | calendar',
    ].join('\n'),
  }
  for (const style of LAYOUT_STYLES) {
    const buf = await renderGraphic({
      style,
      brandName: 'PS | RCM',
      brandSlug: 'ps-rcm',
      theme: THEMES.b2b,
      fields,
      cta: 'Book a diagnostic',
    })
    assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC), `layout ${style} did not render a PNG`)
    assert.ok(buf.length > 5000, `layout ${style} rendered suspiciously small`)
  }
})

test('every layout style renders with no content at all', async () => {
  // A post can reach the renderer with an empty graphic group. The layouts
  // must drop the blocks they cannot fill rather than throw.
  for (const style of LAYOUT_STYLES) {
    const buf = await renderGraphic({
      style,
      brandName: 'excelENT',
      brandSlug: 'excelent-company',
      theme: THEMES.b2b,
      fields: {},
    })
    assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC), `layout ${style} failed on empty fields`)
  }
})

test('a layout renders for a brand with no lockup configured', async () => {
  const buf = await renderGraphic({
    style: 'orbit',
    brandName: 'Unknown',
    brandSlug: 'not-a-real-brand',
    theme: THEMES.patient,
    fields: { headline: 'A. B.', items: 'One | first\nTwo | second' },
  })
  assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC))
})
