// Re-run slop detection and the repair pass over already-generated drafts.
//
// Scoped by what makes a post ELIGIBLE (a future-dated draft), never by a bare date
// range or a hardcoded id list. On 2026-07-31 a date-scoped delete nearly swept up eight
// posts generated between planning and execution; the same drift added post 79 between
// the planning and execution of this script.
//
// Dry run is the DEFAULT: with no flags this writes NOTHING. It still spends Anthropic
// credits, because the only honest preview of a repair is the repair itself.
//
// Run from the project root:
//   node --import tsx scripts/reslop-check.mts                 # dry run, writes nothing
//   node --import tsx scripts/reslop-check.mts --apply         # live, needs the scheduler stopped
//   node --import tsx scripts/reslop-check.mts --apply --from 2026-08-19
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const APPLY = process.argv.includes('--apply')
const fromIdx = process.argv.indexOf('--from')
const FROM = fromIdx > -1 ? process.argv[fromIdx + 1] : '2026-08-19'

/**
 * The hourly planner refills any empty slot inside its 14-day horizon and has sniped a
 * vacated slot before (post 38, 2026-07-09). A live run therefore refuses to start while
 * `social-scheduler` is online. Stopping it is a human's call, never this script's.
 */
function schedulerState(): 'online' | 'stopped' | 'unknown' {
  try {
    const raw = execFileSync('pm2', ['jlist'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const procs = JSON.parse(raw) as Array<{ name?: string; pm2_env?: { status?: string } }>
    const proc = procs.find((p) => p.name === 'social-scheduler')
    if (!proc) return 'stopped'
    return proc.pm2_env?.status === 'online' ? 'online' : 'stopped'
  } catch {
    return 'unknown'
  }
}

const scheduler = schedulerState()
if (scheduler === 'online') {
  console.log('!'.repeat(78))
  console.log('!! social-scheduler is ONLINE. The hourly planner refills empty slots in its')
  console.log('!! 14-day horizon and has sniped a vacated slot before (post 38, 2026-07-09).')
  console.log('!! Stop it before a live run:  pm2 stop social-scheduler')
  console.log('!'.repeat(78))
  if (APPLY) {
    console.error('\nREFUSING to --apply while social-scheduler is online. Nothing was written.')
    process.exit(2)
  }
} else if (scheduler === 'unknown' && APPLY) {
  console.log('!'.repeat(78))
  console.log('!! Could not read pm2 state. Confirm social-scheduler is stopped by hand.')
  console.log('!'.repeat(78))
}

const { getPayload } = await import('payload')
const config = (await import('../src/payload.config')).default
const { detectSlop } = await import('../src/lib/social/slop')
const { buildBrandConfig, buildGuardrailFlags, buildRepairPrompt } = await import(
  '../src/lib/social/generate'
)
const { buildSystemPrompt } = await import('../src/lib/social/prompt')
const { checkGuardrails } = await import('../src/lib/social/guardrails')
const { callClaude } = await import('../src/lib/social/claude')

const payload = await getPayload({ config })

// Eligibility, not a date window: only drafts. `approved` and `sent` posts are never touched.
const res = await payload.find({
  collection: 'social-posts',
  where: {
    and: [
      { status: { equals: 'draft' } },
      { scheduledTime: { greater_than_equal: `${FROM}T00:00:00.000Z` } },
    ],
  },
  sort: 'scheduledTime',
  limit: 100,
  depth: 0,
})

console.log(
  `\n${APPLY ? 'APPLY' : 'DRY RUN (writes nothing)'} — ${res.docs.length} draft(s) scheduled on/after ${FROM}\n`,
)

/** `format` is not persisted, so infer it: repairing a bulleted post as prose would flatten it. */
const inferFormat = (copy: string) => (/^\s*[•\-*]\s+/m.test(copy) ? 'bullets' : 'prose')

/** Every number in the copy. A repair must not invent, drop, or alter a figure. */
const figures = (copy: string) => (copy.match(/\d[\d,.]*%?/g) || []).join(' ')

const brandCache = new Map<string, Record<string, any>>()
let repaired = 0
let unchanged = 0
let clean = 0

for (const post of res.docs as Array<Record<string, any>>) {
  const brandId = String(post.brand)
  if (!brandCache.has(brandId)) {
    brandCache.set(
      brandId,
      (await payload.findByID({
        collection: 'brand-profiles',
        id: brandId,
        depth: 0,
      })) as Record<string, any>,
    )
  }
  const brandConfig = buildBrandConfig(brandCache.get(brandId)!)
  const disclaimers = brandConfig.requiredDisclaimers
  const when = String(post.scheduledTime || '').slice(0, 10)

  const before = detectSlop(post.copy, { requiredDisclaimers: disclaimers })
  const stored = post.generationMeta?.guardrailFlags || '(none)'

  console.log(`─ post ${post.id}  ${when}  brand ${brandId} (${brandConfig.name})`)
  console.log(`    stored flags: ${stored}`)

  if (before.ok) {
    console.log('    detected:     clean — leaving alone\n')
    clean++
    continue
  }

  console.log(`    detected:     ${[...new Set(before.flags.map((f) => f.rule))].join(', ')}`)
  for (const f of before.flags) console.log(`      · ${f.rule}: ${f.excerpt.slice(0, 110)}`)

  const system = buildSystemPrompt(brandConfig)
  const format = inferFormat(post.copy)
  let candidate = ''
  try {
    const { text } = await callClaude(system, buildRepairPrompt(post.copy, before.flags, format))
    candidate = text.trim()
  } catch (err) {
    console.log(`    repair call FAILED: ${err instanceof Error ? err.message.slice(0, 160) : err}\n`)
    unchanged++
    continue
  }

  const after = detectSlop(candidate, { requiredDisclaimers: disclaimers })
  const keptDisclaimer =
    checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers).missingDisclaimers.length === 0

  if (!candidate || after.flags.length >= before.flags.length || !keptDisclaimer) {
    console.log(
      `    repair REJECTED (${after.flags.length} flags vs ${before.flags.length}, disclaimer ${keptDisclaimer ? 'ok' : 'DROPPED'}) — leaving as is\n`,
    )
    unchanged++
    continue
  }

  const figuresBefore = figures(post.copy)
  const figuresAfter = figures(candidate)
  console.log(
    `    figures:      ${figuresBefore === figuresAfter ? 'unchanged' : `CHANGED  before[${figuresBefore}]  after[${figuresAfter}]`}`,
  )
  console.log(
    `    residual:     ${after.flags.length ? [...new Set(after.flags.map((f) => f.rule))].join(', ') : 'none'}`,
  )
  console.log('    --- BEFORE ---')
  console.log(String(post.copy).replace(/^/gm, '    | '))
  console.log('    --- AFTER ----')
  console.log(candidate.replace(/^/gm, '    | '))
  console.log('')

  if (APPLY) {
    const g = checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers)
    await payload.update({
      collection: 'social-posts',
      id: post.id,
      // Lifecycle notification emails must not re-fire for a machine rewrite.
      context: { skipNotify: true },
      depth: 0,
      data: {
        copy: candidate,
        generationMeta: {
          ...(post.generationMeta || {}),
          // Post-repair on purpose: buildCorpus reads originalCopy !== copy as a human
          // edit, and feeding a machine repair back as a human correction is exactly the
          // amplification loop this work exists to break. Payload versioning keeps the
          // pre-repair text in _social_posts_v.
          originalCopy: candidate,
          guardrailFlags: buildGuardrailFlags(g, after.flags),
        },
      },
    })
  }
  repaired++
}

console.log(
  `${APPLY ? 'repaired' : 'would repair'}: ${repaired}   left as is: ${unchanged}   already clean: ${clean}`,
)
if (!APPLY) console.log('\nNothing was written. Re-run with --apply (scheduler stopped) to save.')
process.exit(0)
