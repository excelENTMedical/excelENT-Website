/**
 * Dry-run the generator: build the exact prompts generateDrafts would send, call
 * Claude, parse, and print the draft plus the graphic fields it chose.
 *
 * Creates nothing. The planner fills a 14-day horizon, so a prompt change is
 * otherwise invisible until the calendar rolls past every draft written under the
 * old one — this is how to see the new prompt's output today, without putting a
 * throwaway post on the calendar.
 *
 *   node --import tsx scripts/v4-dryrun.mts
 *
 * Note it skips the repair pass generateDrafts runs on a slop-flagged draft, so
 * the `slop` line here is the model's first attempt, not what would be saved.
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { callClaude } = await import('../src/lib/social/claude')
const { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } = await import('../src/lib/social/prompt')
const { parseDrafts, buildBrandConfig, graphicFor } = await import('../src/lib/social/generate')
const { buildCorpus } = await import('../src/lib/social/corpus')
const { detectSlop } = await import('../src/lib/social/slop')

/** One theme per active B2B brand, chosen to exercise different layout shapes. */
const CASES: Array<[string, string]> = [
  ['1', 'Denial-rate reduction'],
  ['2', 'After-hours and overflow calls'],
  ['3', 'Fill capacity without growing overhead'],
  ['5', 'The Complete ENT Practice Ecosystem'],
  ['8', 'Why we built ExcelENT'],
]

const payload = await getPayloadClient()
console.log(`prompt version: ${PROMPT_VERSION}   model: ${process.env.SOCIAL_MODEL || 'claude-sonnet-4-6'}\n`)

for (const [brandId, theme] of CASES) {
  const brand = await payload.findByID({ collection: 'brand-profiles', id: brandId })
  const recent = await payload.find({ collection: 'social-posts', where: { brand: { equals: brandId } }, sort: '-updatedAt', limit: 50, depth: 0 })
  const cfg = buildBrandConfig(brand as Record<string, any>)
  const corpus = buildCorpus(
    (recent.docs as any[]).map((d) => ({ copy: d.copy, cta: d.cta, status: d.status, reviewerFeedback: d.reviewerFeedback, originalCopy: d.generationMeta?.originalCopy, theme: d.theme, updatedAt: d.updatedAt })),
    { requiredDisclaimers: cfg.requiredDisclaimers },
  )
  const system = buildSystemPrompt(cfg)
  const user = buildUserPrompt(cfg, corpus, { theme, platform: 'linkedin', language: 'en', count: 1 })

  try {
    const { text } = await callClaude(system, user)
    const d = parseDrafts(text)[0]
    if (!d) { console.log(`--- ${(brand as any).slug} / ${theme}\n  NO DRAFT PARSED\n`); continue }
    const g = graphicFor(d as any, (brand as any).slug ?? null)
    const slop = detectSlop(d.copy, { requiredDisclaimers: cfg.requiredDisclaimers })
    console.log(`--- ${(brand as any).slug} / ${theme}`)
    console.log(`  style     : ${d.graphicStyle}`)
    console.log(`  headline  : ${g.headline ?? '(none)'}`)
    console.log(`  subtext   : ${g.subtext ?? '(none)'}`)
    console.log(`  stat      : ${[g.statFrom, g.statTo, g.statLabel].filter(Boolean).join(' / ') || '(none)'}`)
    console.log(`  caption   : ${g.caption ?? '(none)'}`)
    console.log(`  artefact  : ${g.artefact ?? '(none)'}`)
    console.log(`  descriptor: ${g.descriptor === undefined ? '(brand default)' : JSON.stringify(g.descriptor)}`)
    console.log(`  items     :`)
    for (const it of String(g.items ?? '').split('\n').filter(Boolean)) console.log(`      ${it}`)
    console.log(`  slop      : ${slop.ok ? 'clean' : slop.flags.map((f: any) => `${f.rule}("${f.excerpt}")`).join(', ')}`)
    console.log(`  copy      : ${d.copy.replace(/\n/g, '\n              ')}`)
    console.log()
  } catch (err) {
    console.log(`--- ${(brand as any).slug} / ${theme}\n  ERROR: ${err instanceof Error ? err.message : String(err)}\n`)
  }
}
process.exit(0)
