import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDrafts, buildBrandConfig, generateDrafts, buildPostTitle } from './generate'

test('parses a clean JSON array', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'hi', cta: 'Book', format: 'prose', graphicStyle: 'hook', graphic: {} }])
})

test('tolerates fences and surrounding prose', () => {
  const out = parseDrafts('Here you go:\n```json\n[{"copy":"a"}]\n```\nThanks!')
  assert.deepEqual(out, [{ copy: 'a', cta: undefined, format: 'prose', graphicStyle: 'hook', graphic: {} }])
})

test('drops malformed elements', () => {
  const out = parseDrafts('[{"copy":"ok"},{"nope":1},42]')
  assert.deepEqual(out, [{ copy: 'ok', cta: undefined, format: 'prose', graphicStyle: 'hook', graphic: {} }])
})

test('throws when there is no array', () => {
  assert.throws(() => parseDrafts('the model refused'))
})

test('ignores trailing prose that contains a bracket', () => {
  const out = parseDrafts('[{"copy":"hi"}]\nSee [note] above.')
  assert.deepEqual(out, [{ copy: 'hi', cta: undefined, format: 'prose', graphicStyle: 'hook', graphic: {} }])
})

test('handles brackets and escaped quotes inside the copy string', () => {
  const out = parseDrafts('[{"copy":"limited offer ] act now \\"today\\"","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'limited offer ] act now "today"', cta: 'Book', format: 'prose', graphicStyle: 'hook', graphic: {} }])
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

test('generateDrafts passes createContext to payload.create and honors injected deps', async () => {
  const createCalls: any[] = []
  const fakePayload = {
    findByID: async () => ({
      id: 1, name: 'Brand', voice: 'v', audience: 'a',
      themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
    }),
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 42 } },
  }
  const fakeClaude = async () => ({ text: '[{"copy":"Hello world","graphicStyle":"hook","graphic":{}}]' })

  const ids = await generateDrafts(
    '1',
    { theme: 'T', platform: 'linkedin', language: 'en', count: 1 },
    { skipNotify: true },
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.deepEqual(ids, ['42'])
  assert.equal(createCalls.length, 1)
  assert.equal(createCalls[0].collection, 'social-posts')
  assert.equal(createCalls[0].context.skipNotify, true)
})

test('generateDrafts caps created posts to opts.count even when model returns more drafts', async () => {
  const createCalls: any[] = []
  let nextId = 10
  const fakePayload = {
    findByID: async () => ({
      id: 1, name: 'Brand', voice: 'v', audience: 'a',
      themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
    }),
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: nextId++ } },
  }
  // Model returns TWO drafts despite count:1 request
  const fakeClaude = async () => ({
    text: '[{"copy":"Draft one","graphicStyle":"hook","graphic":{}},{"copy":"Draft two","graphicStyle":"hook","graphic":{}}]',
  })

  const ids = await generateDrafts(
    '1',
    { theme: 'T', platform: 'linkedin', language: 'en', count: 1 },
    {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  // Exactly ONE create call — the second draft must be sliced off
  assert.equal(createCalls.length, 1, 'should create exactly 1 post when count:1')
  assert.equal(ids.length, 1, 'should return exactly 1 id')
})

test('buildPostTitle leads with the theme and collapses whitespace', () => {
  // The list view is the posting calendar. A title carrying raw newlines wraps the row and
  // pushes the date column out of alignment, which is what made the calendar hard to scan.
  const t = buildPostTitle('Denial-rate reduction', 'Website traffic doesn\'t pay.\n\nThe CT scanner does.')
  assert.match(t, /^Denial-rate reduction — /)
  assert.doesNotMatch(t, /\n/)
  assert.match(t, /Website traffic doesn't pay\. The CT scanner does\./)
})

test('buildPostTitle truncates long copy and survives a missing theme', () => {
  const long = buildPostTitle('Cash-flow stabilization', 'x'.repeat(200))
  assert.ok(long.length < 100, `title too long for a list column: ${long.length}`)
  assert.equal(buildPostTitle('', 'just the copy'), 'just the copy')
})

test('parses the format field', () => {
  const out = parseDrafts('[{"copy":"hi","format":"bullets"}]')
  assert.equal(out[0].format, 'bullets')
})

test('defaults format to prose when absent or unknown', () => {
  assert.equal(parseDrafts('[{"copy":"hi"}]')[0].format, 'prose')
  assert.equal(parseDrafts('[{"copy":"hi","format":"banana"}]')[0].format, 'prose')
})
