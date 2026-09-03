/**
 * One-off recovery for the four approved posts that failed before LinkedIn was
 * connected (#9, #24, #38, #14). They are all prompt v1, the generation that ran
 * 91% em dashes, so they are repaired before being requeued rather than sent as-is.
 *
 * Pass 1 (--audit) reports what detectSlop finds. Pass 2 (--repair) rewrites the
 * flagged copy through reviseDraft, which drops each post back to draft for
 * re-approval. Nothing here publishes.
 *
 * Run: node --import tsx scripts/social-repair-2026-09.mts --audit
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { detectSlop } = await import('../src/lib/social/slop')
const { buildBrandConfig } = await import('../src/lib/social/generate')

const IDS = [9, 24, 38, 14]
const payload = await getPayloadClient()

const BASE =
  'This draft predates the current writing rules. Rewrite it to them. Keep the argument, the ' +
  'audience and every number exactly as they are, and invent nothing new. Keep the hashtags if ' +
  'the post already has them.'

const NOTES: Record<number, string> = {
  9:
    BASE +
    ' Cut the sentence citing partner-practice results entirely: we do not publish partner-practice ' +
    'outcomes, and the 9 p.m. capture figure cannot be evidenced. Do not substitute another claim in ' +
    'its place. Keep the point on calls answered and appointments booked, not on how human the ' +
    'answering sounds.',
  24: BASE,
  38: BASE,
  14: BASE + ' Replace the "that is not X, that is Y" construction at the end; state the consequence plainly.',
}

const RULE_HELP: Record<string, string> = {
  emDash: 'replace every em dash: recast the sentence, or use a comma, colon or full stop',
  multiEmDash: 'replace every em dash: recast the sentence, or use a comma, colon or full stop',
  colonReveal: 'drop the colon-then-reveal construction; make it one plain sentence',
  dramaticFragment: 'turn the sentence fragment into a complete sentence, or fold it into the one before it',
  notYButX: 'drop the "not X, but Y" construction; say the positive claim on its own',
  binaryContrast: 'drop the "that is not X, that is Y" contrast; state the consequence plainly',
}

/**
 * One revision often leaves a stubborn em dash or two behind, so re-detect and
 * go again naming the exact rules that survived. Bounded, because a model that
 * has not complied twice will not comply on the fifth try.
 */
/** callClaude has no retry of its own, and the API returns 429/529 under load. */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const transient = /Claude API (429|5\d\d)/.test(msg)
      if (!transient || attempt >= 5) throw err
      const wait = 2 ** attempt * 2000
      console.log(`\n  ${label}: ${msg.slice(0, 60)} - retrying in ${wait / 1000}s`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
}

async function repair(): Promise<void> {
  const { reviseDraft } = await import('../src/lib/social/revise')
  const MAX_PASSES = 3
  for (const id of IDS) {
    for (let pass = 1; pass <= MAX_PASSES; pass++) {
      const post = (await payload.findByID({ collection: 'social-posts', id, depth: 1 })) as any
      const brand = buildBrandConfig(post.brand as Record<string, any>)
      const found = detectSlop(post.copy || '', { requiredDisclaimers: brand.requiredDisclaimers })
      if (pass > 1 && found.flags.length === 0) break
      const rules = [...new Set(found.flags.map((f: any) => f.rule as string))]
      const note =
        pass === 1
          ? NOTES[id]
          : 'The rewrite still breaks the writing rules. Fix exactly these and change nothing else: ' +
            rules.map((r) => RULE_HELP[r] || r).join('; ') +
            '. Keep every number, the hashtags, and the argument as they are.'
      process.stdout.write(`#${id} pass ${pass}${pass > 1 ? ` (${rules.join(',')})` : ''}... `)
      await withRetry(() => reviseDraft(id, { note, target: 'copy' }), `#${id}`)
      console.log('done')
    }
  }
}

/**
 * Pass 3 (--finish): the last copy fixes the model would not make (the API was
 * returning 529 on the retry passes), the graphic fields, a layout style per post
 * and a pillar-day slot each, so the four go out one a day rather than in a burst.
 * Values live in the sibling .json so the exact published wording is reviewable.
 *
 * Descriptor '-' suppresses the lockup descriptor on the three brands whose
 * descriptor is still an unconfirmed placeholder. Only ps-rcm (#14) has a
 * descriptor the client actually approved, so only #14 shows one.
 */
async function finish(): Promise<void> {
  const spec = JSON.parse(readFileSync(new URL('./social-repair-2026-09.json', import.meta.url), 'utf8'))
  for (const id of IDS) {
    const s = spec[String(id)]
    if (!s) continue
    const post = (await payload.findByID({ collection: 'social-posts', id, depth: 0 })) as any
    const data: Record<string, any> = {
      graphicStyle: s.graphicStyle,
      graphic: { ...(post.graphic || {}), ...s.graphic },
      scheduledTime: s.scheduledTime,
      // Requeue, but leave status as draft: these need re-approving before they send.
      publish: { ...(post.publish || {}), state: 'pending', attempts: 0, error: '' },
    }
    if (s.copy) data.copy = s.copy
    await payload.update({ collection: 'social-posts', id, data })
    console.log(`#${id} -> ${s.graphicStyle}, ${s.scheduledTime.slice(0, 10)}`)
  }
}

const PREVIEW_DIR = '/tmp/claude-1000/-home-bitnami/7895c00f-21cf-4869-aa18-6a04df397958/scratchpad'

/** Render each post's graphic through the same path the route uses. */
async function render(save: boolean): Promise<void> {
  const { writeFileSync } = await import('node:fs')
  const { renderGraphic } = await import('../src/lib/social/graphics/render')
  const { buildGraphicFromPost } = await import('../src/lib/social/graphics/fromPost')
  for (const id of IDS) {
    const post = (await payload.findByID({ collection: 'social-posts', id, depth: 1 })) as any
    const png = await renderGraphic(buildGraphicFromPost(post))
    writeFileSync(`${PREVIEW_DIR}/post-${id}-${post.graphicStyle}.png`, png)
    if (save) {
      const brandId = typeof post.brand === 'object' ? post.brand.id : post.brand
      const asset = await payload.create({
        collection: 'social-assets',
        data: { alt: `${post.title || 'post'} graphic`, brand: brandId, source: 'ai-generated' },
        file: { data: png, mimetype: 'image/png', name: `post-${id}-${post.graphicStyle}.png`, size: png.length },
      })
      await payload.update({ collection: 'social-posts', id, data: { asset: asset.id } })
      console.log(`#${id} ${post.graphicStyle} -> asset ${asset.id}`)
    } else {
      console.log(`#${id} ${post.graphicStyle} -> ${PREVIEW_DIR}/post-${id}-${post.graphicStyle}.png`)
    }
  }
}

if (process.argv.includes('--render')) {
  await render(false)
}
if (process.argv.includes('--assets')) {
  await render(true)
}
if (process.argv.includes('--repair')) {
  await repair()
}
if (process.argv.includes('--finish')) {
  await finish()
}

for (const id of IDS) {
  const post = (await payload.findByID({ collection: 'social-posts', id, depth: 1 })) as any
  const brand = buildBrandConfig(post.brand as Record<string, any>)
  const copy = detectSlop(post.copy || '', { requiredDisclaimers: brand.requiredDisclaimers })
  const sub = detectSlop(post.graphic?.subtext || '', { requiredDisclaimers: [] })
  const head = detectSlop(post.graphic?.headline || '', { requiredDisclaimers: [] })
  console.log(`\n#${id}  ${post.brand?.slug}  style=${post.graphicStyle}  asset=${post.asset?.id ?? 'none'}`)
  console.log(`  copy     ${copy.flags.length ? copy.flags.map((f: any) => `${f.rule} ("${f.excerpt}")`).join(' | ') : 'clean'}`)
  console.log(`  headline ${post.graphic?.headline ? (head.flags.length ? head.flags.map((f: any) => f.rule).join(' | ') : 'clean') : 'EMPTY'}`)
  console.log(`  subtext  ${post.graphic?.subtext ? (sub.flags.length ? sub.flags.map((f: any) => f.rule).join(' | ') : 'clean') : 'EMPTY'}`)
}
process.exit(0)
