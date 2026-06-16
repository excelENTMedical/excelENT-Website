import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildGraphicFromPost } from './fromPost'

test('maps a populated post doc to render args', () => {
  const args = buildGraphicFromPost({
    graphicStyle: 'stat',
    graphic: { statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate' },
    brand: { name: 'PS | RCM', slug: 'ps-rcm' },
  })
  assert.equal(args.style, 'stat')
  assert.equal(args.brandName, 'PS | RCM')
  assert.equal(args.theme.surface, '#fafafa') // b2b theme
  assert.equal(args.fields.statFrom, '11.8%')
})

test('defaults missing style to none and unknown brand to the b2b theme', () => {
  const args = buildGraphicFromPost({ brand: { name: 'X' } })
  assert.equal(args.style, 'none')
  assert.equal(args.theme.surface, '#fafafa')
  assert.equal(args.brandName, 'X')
})
