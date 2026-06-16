import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderGraphic } from './render'
import { THEMES } from './theme'

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
