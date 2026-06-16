import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDrafts, buildBrandConfig } from './generate'

test('parses a clean JSON array', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'hi', cta: 'Book', graphicStyle: 'hook', graphic: {} }])
})

test('tolerates fences and surrounding prose', () => {
  const out = parseDrafts('Here you go:\n```json\n[{"copy":"a"}]\n```\nThanks!')
  assert.deepEqual(out, [{ copy: 'a', cta: undefined, graphicStyle: 'hook', graphic: {} }])
})

test('drops malformed elements', () => {
  const out = parseDrafts('[{"copy":"ok"},{"nope":1},42]')
  assert.deepEqual(out, [{ copy: 'ok', cta: undefined, graphicStyle: 'hook', graphic: {} }])
})

test('throws when there is no array', () => {
  assert.throws(() => parseDrafts('the model refused'))
})

test('ignores trailing prose that contains a bracket', () => {
  const out = parseDrafts('[{"copy":"hi"}]\nSee [note] above.')
  assert.deepEqual(out, [{ copy: 'hi', cta: undefined, graphicStyle: 'hook', graphic: {} }])
})

test('handles brackets and escaped quotes inside the copy string', () => {
  const out = parseDrafts('[{"copy":"limited offer ] act now \\"today\\"","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'limited offer ] act now "today"', cta: 'Book', graphicStyle: 'hook', graphic: {} }])
})

test('parses graphic fields and style when present', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book","graphicStyle":"stat","graphic":{"statFrom":"11.8%","statTo":"2.5%","statLabel":"Denial Rate","headline":"h","subtext":"s","caption":"c"}}]')
  assert.equal(out[0].graphicStyle, 'stat')
  assert.equal(out[0].graphic?.statFrom, '11.8%')
  assert.equal(out[0].graphic?.statLabel, 'Denial Rate')
})

test('defaults graphicStyle to hook and graphic to empty when absent', () => {
  const out = parseDrafts('[{"copy":"hi"}]')
  assert.equal(out[0].graphicStyle, 'hook')
  assert.deepEqual(out[0].graphic, {})
})

test('coerces an unknown graphicStyle to hook', () => {
  const out = parseDrafts('[{"copy":"hi","graphicStyle":"banana"}]')
  assert.equal(out[0].graphicStyle, 'hook')
})

test('buildBrandConfig maps a brand doc to prompt config', () => {
  const cfg = buildBrandConfig({
    name: 'PS | RCM', voice: 'v', audience: 'a',
    themes: [{ theme: 'T', description: 'd' }],
    defaultCtas: [{ cta: 'Book' }, { cta: '' }],
    bannedTerms: [{ term: 'guaranteed' }],
    requiredDisclaimers: [{ text: 'D' }],
    seedExamples: [{ text: 'ex' }],
  })
  assert.equal(cfg.name, 'PS | RCM')
  assert.equal(cfg.voice, 'v')
  assert.deepEqual(cfg.themes, [{ theme: 'T', description: 'd' }])
  assert.deepEqual(cfg.defaultCtas, ['Book'])
  assert.deepEqual(cfg.bannedTerms, ['guaranteed'])
  assert.deepEqual(cfg.requiredDisclaimers, ['D'])
  assert.deepEqual(cfg.seedExamples, ['ex'])
})
