// Re-run slop detection and the repair pass over already-generated drafts.
//
// TWO PHASES, deliberately split. The repair comes from a non-deterministic model, so a
// single-phase script that re-generated on --apply would save text no human ever read —
// an illusory review gate on the one job in this project that rewrites live content.
//
//   phase 1 (default)  detect -> repair -> WRITE PROPOSALS TO A JSON FILE. No DB writes.
//   phase 2 (--apply)  LOAD that file and save those exact texts. No model call at all.
//
// Apply re-reads each post and refuses to save if its copy no longer matches the BEFORE the
// human reviewed (a human edit, or the planner, moved underneath us), or if it is no longer
// a draft.
//
// Scoped by what makes a post ELIGIBLE (a future-dated draft), never by a bare date range or
// a hardcoded id list. On 2026-07-31 a date-scoped delete nearly swept up eight posts
// generated between planning and execution; the same drift added post 79 to this batch.
//
// Run from the project root:
//   node --import tsx scripts/reslop-check.mts                        # propose, writes no DB rows
//   node --import tsx scripts/reslop-check.mts --skip 78              # ...leaving post 78 out
//   node --import tsx scripts/reslop-check.mts --apply                # save the reviewed proposals
//   node --import tsx scripts/reslop-check.mts --apply --only 69,71   # ...only these two
//
// Flags:
//   --apply             save; requires a proposals file and a stopped social-scheduler
//   --from YYYY-MM-DD   earliest scheduledTime to consider (default 2026-08-19)
//   --proposals PATH    proposals file (default scripts/reslop-proposals.json)
//   --only 69,71        restrict to these post ids
//   --skip 78           exclude these post ids
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const argv = process.argv
const arg = (name: string): string | undefined => {
  const i = argv.indexOf(name)
  return i > -1 ? argv[i + 1] : undefined
}
const idList = (raw?: string): Set<string> =>
  new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean))

const APPLY = argv.includes('--apply')
const FROM = arg('--from') || '2026-08-19'
const PROPOSALS = new URL(arg('--proposals') || './reslop-proposals.json', import.meta.url)
const ONLY = idList(arg('--only'))
const SKIP = idList(arg('--skip'))

/** A reviewed repair. `before` is what the human read the rewrite against; apply verifies it. */
interface Proposal {
  id: string
  scheduledTime: string
  brand: string
  detected: string[]
  residual: string[]
  before: string
  after: string
}

const excluded = (id: string): boolean => (ONLY.size > 0 && !ONLY.has(id)) || SKIP.has(id)

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
const { buildBrandConfig, buildGuardrailFlags } = await import('../src/lib/social/generate')
const { checkGuardrails } = await import('../src/lib/social/guardrails')

const payload = await getPayload({ config })

const brandCache = new Map<string, Record<string, any>>()
const brandConfigFor = async (brandId: string) => {
  if (!brandCache.has(brandId)) {
    brandCache.set(
      brandId,
      (await payload.findByID({ collection: 'brand-profiles', id: brandId, depth: 0 })) as Record<
        string,
        any
      >,
    )
  }
  return buildBrandConfig(brandCache.get(brandId)!)
}

const rules = (flags: Array<{ rule: string }>) => [...new Set(flags.map((f) => f.rule))]

if (!APPLY) {
  // -- PHASE 1: propose ---------------------------------------------------------------
  // The model runs here and only here. Nothing touches the database.
  const { buildRepairPrompt } = await import('../src/lib/social/generate')
  const { buildSystemPrompt } = await import('../src/lib/social/prompt')
  const { callClaude } = await import('../src/lib/social/claude')

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
    `\nPROPOSE (no database writes) — ${res.docs.length} draft(s) scheduled on/after ${FROM}\n`,
  )

  /** `format` is not persisted, so infer it: repairing a bulleted post as prose would flatten it. */
  const inferFormat = (copy: string) => (/^\s*[•\-*]\s+/m.test(copy) ? 'bullets' : 'prose')
  /** Every number in the copy. A repair must not invent, drop, or alter a figure. */
  const figures = (copy: string) => (copy.match(/\d[\d,.]*%?/g) || []).join(' ')

  const proposals: Proposal[] = []
  let skipped = 0
  let unchanged = 0
  let clean = 0

  for (const post of res.docs as Array<Record<string, any>>) {
    const id = String(post.id)
    const brandId = String(post.brand)
    const when = String(post.scheduledTime || '').slice(0, 10)

    if (excluded(id)) {
      console.log(`─ post ${id}  ${when}  excluded by --only/--skip\n`)
      skipped++
      continue
    }

    const brandConfig = await brandConfigFor(brandId)
    const disclaimers = brandConfig.requiredDisclaimers
    const before = detectSlop(post.copy, { requiredDisclaimers: disclaimers })

    console.log(`─ post ${id}  ${when}  brand ${brandId} (${brandConfig.name})`)
    console.log(`    stored flags: ${post.generationMeta?.guardrailFlags || '(none)'}`)

    if (before.ok) {
      console.log('    detected:     clean — leaving alone\n')
      clean++
      continue
    }

    console.log(`    detected:     ${rules(before.flags).join(', ')}`)
    for (const f of before.flags) console.log(`      · ${f.rule}: ${f.excerpt.slice(0, 110)}`)

    let candidate = ''
    try {
      const { text } = await callClaude(
        buildSystemPrompt(brandConfig),
        buildRepairPrompt(post.copy, before.flags, inferFormat(post.copy)),
      )
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

    const fBefore = figures(post.copy)
    const fAfter = figures(candidate)
    console.log(
      `    figures:      ${fBefore === fAfter ? 'unchanged' : `CHANGED  before[${fBefore}]  after[${fAfter}]`}`,
    )
    console.log(`    residual:     ${after.flags.length ? rules(after.flags).join(', ') : 'none'}`)
    console.log('    --- BEFORE ---')
    console.log(String(post.copy).replace(/^/gm, '    | '))
    console.log('    --- AFTER ----')
    console.log(candidate.replace(/^/gm, '    | '))
    console.log('')

    proposals.push({
      id,
      scheduledTime: String(post.scheduledTime || ''),
      brand: brandId,
      detected: rules(before.flags),
      residual: rules(after.flags),
      before: String(post.copy),
      after: candidate,
    })
  }

  writeFileSync(
    PROPOSALS,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), from: FROM, proposals }, null, 2)}\n`,
  )

  console.log(
    `proposed: ${proposals.length}   left as is: ${unchanged}   already clean: ${clean}   excluded: ${skipped}`,
  )
  console.log(`\nProposals written to ${PROPOSALS.pathname}`)
  console.log('No database rows were written. Review the diffs above, then:')
  console.log('  pm2 stop social-scheduler')
  console.log('  node --import tsx scripts/reslop-check.mts --apply [--skip <ids>]')
  process.exit(0)
}

// -- PHASE 2: apply -------------------------------------------------------------------
// Saves the reviewed text verbatim. The model is never imported or called on this path.
let file: { proposals?: Proposal[] }
try {
  file = JSON.parse(readFileSync(PROPOSALS, 'utf8'))
} catch (err) {
  console.error(`No readable proposals file at ${PROPOSALS.pathname}`)
  console.error(`  (${err instanceof Error ? err.message : err})`)
  console.error('Run the propose phase first — --apply never generates its own rewrites.')
  process.exit(3)
}

const all = Array.isArray(file.proposals) ? file.proposals : []
if (all.length === 0) {
  console.error(`Proposals file ${PROPOSALS.pathname} contains no proposals. Nothing to apply.`)
  process.exit(3)
}

console.log(`\nAPPLY — ${all.length} reviewed proposal(s) from ${PROPOSALS.pathname}\n`)

let applied = 0
let skipped = 0
let stale = 0
let failed = 0

for (const p of all) {
  if (excluded(p.id)) {
    console.log(`─ post ${p.id}  excluded by --only/--skip`)
    skipped++
    continue
  }

  // findByID throws on a missing row; one bad id must not abort the rest of the batch.
  let post: Record<string, any> | null = null
  try {
    post = (await payload.findByID({
      collection: 'social-posts',
      id: p.id,
      depth: 0,
    })) as Record<string, any>
  } catch {
    post = null
  }

  if (!post) {
    console.log(`─ post ${p.id}  NOT FOUND — skipping`)
    stale++
    continue
  }
  if (post.status !== 'draft') {
    console.log(`─ post ${p.id}  status is now "${post.status}", not draft — SKIPPING`)
    stale++
    continue
  }
  // A resumed run after a partial failure: this one already landed.
  if (String(post.copy) === p.after) {
    console.log(`─ post ${p.id}  already matches the reviewed AFTER — nothing to do`)
    skipped++
    continue
  }
  // The reviewed rewrite is only valid against the copy it was reviewed against.
  if (String(post.copy) !== p.before) {
    console.log(`─ post ${p.id}  ${'*'.repeat(48)}`)
    console.log('    STALE: current copy differs from the reviewed BEFORE. SKIPPING.')
    console.log('    Someone (or the planner) changed this post after the proposal was made.')
    console.log('    Re-run the propose phase to review it again.')
    stale++
    continue
  }

  const brandConfig = await brandConfigFor(String(post.brand))
  const disclaimers = brandConfig.requiredDisclaimers
  // Recomputed, not trusted from the file: both are pure functions of the saved text.
  const residual = detectSlop(p.after, { requiredDisclaimers: disclaimers })
  const g = checkGuardrails(p.after, brandConfig.bannedTerms, disclaimers)

  try {
    await payload.update({
      collection: 'social-posts',
      id: p.id,
      // Lifecycle notification emails must not re-fire for a machine rewrite.
      context: { skipNotify: true },
      depth: 0,
      data: {
        copy: p.after,
        generationMeta: {
          ...(post.generationMeta || {}),
          // Post-repair on purpose: buildCorpus reads originalCopy !== copy as a human edit,
          // and feeding a machine repair back as a human correction is the amplification loop
          // this work exists to break. Payload versioning keeps the pre-repair text in
          // _social_posts_v.
          originalCopy: p.after,
          guardrailFlags: buildGuardrailFlags(g, residual.flags),
        },
      },
    })
  } catch (err) {
    // Keep going: a half-applied batch is resumable (the stale check protects every
    // remaining post), an aborted one just loses the rest of the reviewed work.
    console.log(`─ post ${p.id}  SAVE FAILED: ${err instanceof Error ? err.message.slice(0, 160) : err}`)
    failed++
    continue
  }
  console.log(
    `─ post ${p.id}  saved   residual: ${residual.flags.length ? rules(residual.flags).join(', ') : 'none'}`,
  )
  applied++
}

console.log(
  `\napplied: ${applied}   excluded/no-op: ${skipped}   stale or missing: ${stale}   failed: ${failed}`,
)
process.exit(failed ? 1 : 0)
