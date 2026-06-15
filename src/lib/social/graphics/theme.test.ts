import { test } from 'node:test'
import assert from 'node:assert/strict'
import { themeForBrand, THEMES } from './theme'

test('patient slug maps to the patient theme', () => {
  assert.equal(themeForBrand({ slug: 'patient-facing' }), 'patient')
})

test('b2b/product slugs map to the b2b theme', () => {
  assert.equal(themeForBrand({ slug: 'ps-rcm' }), 'b2b')
  assert.equal(themeForBrand({ slug: undefined }), 'b2b')
})

test('themes share brand colors but differ in surface', () => {
  assert.equal(THEMES.b2b.purple, '#89007a')
  assert.equal(THEMES.b2b.navy, '#061b42')
  assert.notEqual(THEMES.b2b.surface, THEMES.patient.surface)
})
