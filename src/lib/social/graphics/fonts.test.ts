import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadFonts } from './fonts'

test('loadFonts returns six non-empty font buffers', () => {
  const fonts = loadFonts()
  assert.equal(fonts.length, 6)
  for (const f of fonts) {
    assert.ok(['Cabin', 'Montserrat'].includes(f.name))
    assert.ok(f.data.length > 1000, `${f.name} ${f.weight} buffer too small`)
    assert.equal(f.style, 'normal')
  }
})
