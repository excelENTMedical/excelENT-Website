import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDrafts, buildBrandConfig, generateDrafts, buildPostTitle, buildRepairPrompt, graphicFor, styleForContent } from './generate'

test('parses a clean JSON array', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'hi', cta: 'Book', format: 'prose', graphicStyle: 'statement', graphic: {} }])
})

test('tolerates fences and surrounding prose', () => {
  const out = parseDrafts('Here you go:\n```json\n[{"copy":"a"}]\n```\nThanks!')
  assert.deepEqual(out, [{ copy: 'a', cta: undefined, format: 'prose', graphicStyle: 'statement', graphic: {} }])
})

test('drops malformed elements', () => {
  const out = parseDrafts('[{"copy":"ok"},{"nope":1},42]')
  assert.deepEqual(out, [{ copy: 'ok', cta: undefined, format: 'prose', graphicStyle: 'statement', graphic: {} }])
})

test('throws when there is no array', () => {
  assert.throws(() => parseDrafts('the model refused'))
})

test('ignores trailing prose that contains a bracket', () => {
  const out = parseDrafts('[{"copy":"hi"}]\nSee [note] above.')
  assert.deepEqual(out, [{ copy: 'hi', cta: undefined, format: 'prose', graphicStyle: 'statement', graphic: {} }])
})

test('handles brackets and escaped quotes inside the copy string', () => {
  const out = parseDrafts('[{"copy":"limited offer ] act now \\"today\\"","cta":"Book"}]')
  assert.deepEqual(out, [{ copy: 'limited offer ] act now "today"', cta: 'Book', format: 'prose', graphicStyle: 'statement', graphic: {} }])
})

test('parses graphic fields and maps a legacy style onto its layout', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book","graphicStyle":"stat","graphic":{"statFrom":"11.8%","statTo":"2.5%","statLabel":"Denial Rate","headline":"h","subtext":"s","caption":"c"}}]')
  assert.equal(out[0].graphicStyle, 'object')
  assert.equal(out[0].graphic?.statFrom, '11.8%')
  assert.equal(out[0].graphic?.statLabel, 'Denial Rate')
})

test('defaults graphicStyle to statement and graphic to empty when absent', () => {
  const out = parseDrafts('[{"copy":"hi"}]')
  assert.equal(out[0].graphicStyle, 'statement')
  assert.deepEqual(out[0].graphic, {})
})

test('parses a layout style with its items and artefact', () => {
  const out = parseDrafts(
    '[{"copy":"hi","graphicStyle":"orbit","graphic":{"headline":"h","items":"RCM|Claims|doc","artefact":"Claim / Denied"}}]',
  )
  assert.equal(out[0].graphicStyle, 'orbit')
  assert.equal(out[0].graphic.items, 'RCM|Claims|doc')
  assert.equal(out[0].graphic.artefact, 'Claim / Denied')
})

test('graphicFor blanks the descriptor for a confirmed brand and blocks it for a placeholder', () => {
  // ps-rcm is the only brand whose descriptor came from the client; the rest must
  // never print theirs, however the model filled the field.
  const draft = { graphicStyle: 'statement' as const, graphic: { headline: 'h', descriptor: 'MADE UP' } }
  assert.equal(graphicFor(draft, 'ps-rcm').descriptor, undefined)
  assert.equal(graphicFor(draft, 'ps-lexi').descriptor, '-')
})

test('graphicFor leaves a legacy card alone', () => {
  const draft = { graphicStyle: 'hook' as const, graphic: { headline: 'h' } }
  assert.deepEqual(graphicFor(draft, 'ps-lexi'), { headline: 'h' })
})

test('coerces an unknown graphicStyle to statement', () => {
  const out = parseDrafts('[{"copy":"hi","graphicStyle":"banana"}]')
  assert.equal(out[0].graphicStyle, 'statement')
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

const brandDoc = {
  id: 1, name: 'Brand', voice: 'v', audience: 'a',
  themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
}

test('buildRepairPrompt quotes each violation back to the model', () => {
  const p = buildRepairPrompt('The claim goes out — and comes back.', [
    { rule: 'emDash', excerpt: 'The claim goes out — and comes back.' },
  ], 'prose')
  assert.match(p, /emDash/)
  assert.match(p, /The claim goes out/)
})

test('a flagged draft triggers exactly one repair call and saves the repaired copy', async () => {
  const createCalls: any[] = []
  const prompts: string[] = []
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 7 } },
  }
  const fakeClaude = async (_sys: string, user: string) => {
    prompts.push(user)
    return prompts.length === 1
      ? { text: '[{"copy":"The claim goes out — and comes back denied.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'The claim goes out and comes back denied.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.equal(prompts.length, 2, 'exactly one repair call')
  assert.equal(createCalls[0].data.copy, 'The claim goes out and comes back denied.')
  assert.equal(createCalls[0].data.generationMeta.guardrailFlags, '', 'repaired copy is clean')
})

test('a clean draft triggers no repair call', async () => {
  const prompts: string[] = []
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async () => ({ id: 8 }),
  }
  const fakeClaude = async (_sys: string, user: string) => {
    prompts.push(user)
    return { text: '[{"copy":"Your coders know the payer mix before a claim goes out.","graphicStyle":"hook","graphic":{}}]' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )
  assert.equal(prompts.length, 1)
})

test('a repair that does not improve the copy is discarded and residual flags are recorded', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 9 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"One — two — three.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'Still — just — as — bad.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.equal(createCalls[0].data.copy, 'One — two — three.', 'a worse repair is rejected')
  assert.match(createCalls[0].data.generationMeta.guardrailFlags, /slop: emDash/)
})

test('generationMeta.originalCopy holds the saved copy, not the pre-repair draft', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 10 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"The claim goes out — denied.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'The claim goes out and comes back denied every time.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  // buildCorpus treats originalCopy !== copy as a HUMAN edit and feeds it back as a
  // before/after training pair. Storing the pre-repair draft here would teach the loop
  // from our own machine repair — the amplification bug through the back door.
  assert.equal(createCalls[0].data.generationMeta.originalCopy, createCalls[0].data.copy)
})

test('a repair that drops a required disclaimer is rejected', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => ({ ...brandDoc, requiredDisclaimers: [{ text: 'Not medical advice.' }] }),
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 11 } },
  }
  const fakeClaude = async () => {
    call++
    return call === 1
      ? { text: '[{"copy":"Book a visit — today. Not medical advice.","graphicStyle":"hook","graphic":{}}]' }
      : { text: 'Book a visit today.' }
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.match(createCalls[0].data.copy, /Not medical advice\./)
})

test('a repair call that throws is logged and still saves the unrepaired draft', async () => {
  // A repair broken by a 429, a timeout or a missing API key used to be indistinguishable
  // from one that ran and was correctly refused: the catch was bare. The flags look the
  // same either way, so without a log line a silently dead repair pass is invisible.
  const createCalls: any[] = []
  const warns: any[][] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 12 } },
    logger: { warn: (...a: any[]) => { warns.push(a) } },
  }
  const fakeClaude = async () => {
    call++
    if (call === 1) return { text: '[{"copy":"The claim goes out — denied.","graphicStyle":"hook","graphic":{}}]' }
    throw new Error('429 rate limited')
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.equal(createCalls.length, 1, 'the save must never be blocked by a repair failure')
  assert.equal(createCalls[0].data.copy, 'The claim goes out — denied.', 'copy left as generated')
  assert.match(createCalls[0].data.generationMeta.guardrailFlags, /slop: emDash/)
  assert.equal(call, 2, 'one repair attempt, no retry')
  assert.equal(warns.length, 1, 'exactly one warning')
  assert.match(warns[0][1], /repair failed/)
  assert.equal(warns[0][0].err.message, '429 rate limited')
})

test('a repair failure survives a payload client with no logger', async () => {
  const createCalls: any[] = []
  let call = 0
  const fakePayload = {
    findByID: async () => brandDoc,
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 13 } },
  }
  const fakeClaude = async () => {
    call++
    if (call === 1) return { text: '[{"copy":"The claim goes out — denied.","graphicStyle":"hook","graphic":{}}]' }
    throw new Error('boom')
  }

  await generateDrafts(
    '1', { theme: 'T', platform: 'linkedin', language: 'en', count: 1 }, {},
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )
  assert.equal(createCalls.length, 1)
})

test('styleForContent keeps a layout the content can actually fill', () => {
  assert.equal(styleForContent('twoband', { items: 'A|B|doc\n--\nC|D|phone' }), 'twoband')
  assert.equal(styleForContent('orbit', { items: 'RCM|Claims|doc' }), 'orbit')
  assert.equal(styleForContent('object', { artefact: 'CLAIM / DENIED' }), 'object')
  assert.equal(styleForContent('object', { statFrom: '11.8%', statTo: '2.5%' }), 'object')
  assert.equal(styleForContent('statement', { headline: 'A. B.' }), 'statement')
})

test('styleForContent falls back to statement when the enumerating layouts have nothing to enumerate', () => {
  // Post #54 was revised to `contrast` with no items at all, so the AFTER panel
  // rendered empty on a mostly-white canvas — worse than what it replaced.
  assert.equal(styleForContent('contrast', { headline: 'A. B.' }), 'statement')
  assert.equal(styleForContent('twoband', {}), 'statement')
  assert.equal(styleForContent('orbit', { items: '' }), 'statement')
})

test('styleForContent ignores a band separator that carries no row of its own', () => {
  assert.equal(styleForContent('twoband', { items: '--' }), 'statement')
  assert.equal(styleForContent('twoband', { items: '  \n--\n\n' }), 'statement')
})

test('styleForContent falls back when object has neither an artefact nor a stat pair', () => {
  assert.equal(styleForContent('object', { headline: 'A. B.' }), 'statement')
  assert.equal(styleForContent('object', { statFrom: '11.8%' }), 'statement')
})

test('styleForContent leaves none alone', () => {
  assert.equal(styleForContent('none', {}), 'none')
})
