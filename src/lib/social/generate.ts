import { getPayloadClient } from '@/lib/payload'
import { buildCorpus } from './corpus'
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from './prompt'
import { checkGuardrails, norm } from './guardrails'
import { detectSlop, type SlopFlag } from './slop'
import { callClaude } from './claude'
import type { BrandConfigForPrompt, CorpusPost, GenerateOptions, GraphicFields, GraphicStyle, GuardrailResult, PostFormat } from './types'

interface ParsedDraft {
  copy: string
  cta?: string
  format: PostFormat
  graphicStyle: GraphicStyle
  graphic: GraphicFields
}

export const GRAPHIC_STYLES: GraphicStyle[] = ['none', 'hook', 'stat', 'dataviz']
export const POST_FORMATS: PostFormat[] = ['prose', 'bullets']
export const GRAPHIC_KEYS: (keyof GraphicFields)[] = ['headline', 'subtext', 'statFrom', 'statTo', 'statLabel', 'caption']

/** Tolerate stray prose or ```json fences around the JSON array. */
export function parseDrafts(text: string): ParsedDraft[] {
  const start = text.indexOf('[')
  if (start === -1) throw new Error('No JSON array in model output')
  let depth = 0
  let end = -1
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) throw new Error('No JSON array in model output')
  const arr = JSON.parse(text.slice(start, end + 1))
  if (!Array.isArray(arr)) throw new Error('Model output was not an array')
  return arr
    .filter((d: unknown): d is Record<string, unknown> =>
      Boolean(d) && typeof (d as { copy?: unknown }).copy === 'string')
    .map((d) => {
      const rawStyle = String((d as any).graphicStyle || '')
      const rawFormat = String((d as any).format || '')
      const g = ((d as any).graphic || {}) as Record<string, unknown>
      const graphic: GraphicFields = {}
      for (const k of GRAPHIC_KEYS) if (g[k] != null && g[k] !== '') graphic[k] = String(g[k]).trim()
      return {
        copy: String((d as any).copy).trim(),
        cta: (d as any).cta ? String((d as any).cta).trim() : undefined,
        format: (POST_FORMATS.includes(rawFormat as PostFormat) ? rawFormat : 'prose') as PostFormat,
        graphicStyle: (GRAPHIC_STYLES.includes(rawStyle as GraphicStyle) ? rawStyle : 'hook') as GraphicStyle,
        graphic,
      }
    })
}

/** Map a brand-profiles doc to the prompt config. Shared by generate + revise. */
/**
 * Build the label a post shows in the admin list, which doubles as the posting calendar.
 *
 * Leads with the theme because the schedule is a weekday pillar rotation — scanning a week you
 * want to see which pillar ran, not the brand (its own column) or the platform (all LinkedIn).
 * Whitespace is collapsed because copy contains paragraph breaks, and a title with newlines
 * wraps the row and knocks the date column out of alignment.
 */
export function buildPostTitle(theme: string, copy: string, max = 60): string {
  const excerpt = [...copy.replace(/\s+/g, ' ').trim()].slice(0, max).join('').trim()
  return theme ? `${theme} — ${excerpt}` : excerpt
}

export function buildBrandConfig(brand: Record<string, any>): BrandConfigForPrompt {
  const b = brand
  return {
    name: b.name,
    voice: b.voice,
    audience: b.audience,
    themes: (b.themes || []).map((t: any) => ({ theme: t.theme, description: t.description })),
    defaultCtas: (b.defaultCtas || []).map((c: any) => c.cta).filter(Boolean),
    bannedTerms: (b.bannedTerms || []).map((x: any) => x.term).filter(Boolean),
    requiredDisclaimers: (b.requiredDisclaimers || []).map((r: any) => r.text).filter(Boolean),
    seedExamples: (b.seedExamples || []).map((s: any) => s.text).filter(Boolean),
  }
}

/**
 * Asks the model to fix its own slop, quoting each violation back at it.
 *
 * Scoped deliberately narrow. A wholesale rewrite produces correct, lifeless copy — the
 * failure mode of mechanical de-slopping. Naming the offending spans and forbidding
 * everything else keeps the voice the brand prompt built.
 */
export function buildRepairPrompt(copy: string, flags: SlopFlag[], format: PostFormat): string {
  const violations = flags.map((f) => `- ${f.rule}: "${f.excerpt}"`).join('\n')
  return [
    'The post below breaks the writing rules in your brief. Fix it.',
    '',
    'VIOLATIONS:',
    violations,
    '',
    'Rewrite ONLY what is needed to clear these violations. Keep the meaning, every fact and',
    'figure, the call to action, and any required disclaimer word for word. Do not invent',
    'numbers, do not add claims, and do not change the subject.',
    format === 'bullets'
      ? 'Keep the bulleted structure, including the • characters.'
      : 'Keep it as prose. Do not convert it to a list.',
    '',
    'Return ONLY the corrected post text. No JSON, no commentary, no code fences.',
    '',
    'POST:',
    copy,
  ].join('\n')
}

/**
 * Assemble the single `generationMeta.guardrailFlags` string from the hard guardrail result
 * and any residual slop flags.
 *
 * One function, not two copies: the backfill script writes the same field on existing posts,
 * and a drifting format there would make the review queue's flag column unreadable.
 * Zero DDL by design — slop rides along in the existing string field.
 */
export function buildGuardrailFlags(guardrails: GuardrailResult, slopFlags: SlopFlag[]): string {
  const parts: string[] = []
  if (guardrails.bannedHits.length) parts.push(`banned: ${guardrails.bannedHits.join(', ')}`)
  if (guardrails.missingDisclaimers.length) {
    parts.push(`missing disclaimers: ${guardrails.missingDisclaimers.join(' | ')}`)
  }
  if (slopFlags.length) {
    parts.push(`slop: ${[...new Set(slopFlags.map((f) => f.rule))].join(', ')}`)
  }
  return parts.join('; ')
}

export interface GenerateDraftsDeps {
  payload?: Awaited<ReturnType<typeof getPayloadClient>>
  callClaudeImpl?: typeof callClaude
}

export async function generateDrafts(
  brandId: string,
  opts: GenerateOptions,
  createContext?: Record<string, unknown>,
  deps?: GenerateDraftsDeps,
): Promise<string[]> {
  const payload = deps?.payload ?? (await getPayloadClient())
  const callClaudeImpl = deps?.callClaudeImpl ?? callClaude

  const brand = await payload.findByID({ collection: 'brand-profiles', id: brandId })
  if (!brand) throw new Error(`Brand ${brandId} not found`)

  const recent = await payload.find({
    collection: 'social-posts',
    where: { brand: { equals: brandId } },
    sort: '-updatedAt',
    limit: 50,
    depth: 0,
  })

  const corpusPosts: CorpusPost[] = recent.docs.map((d: Record<string, any>) => ({
    copy: d.copy,
    cta: d.cta,
    status: d.status,
    reviewerFeedback: d.reviewerFeedback,
    originalCopy: d.generationMeta?.originalCopy,
    theme: d.theme,
    updatedAt: d.updatedAt,
  }))
  const corpus = buildCorpus(corpusPosts)

  const brandConfig = buildBrandConfig(brand as Record<string, any>)

  const system = buildSystemPrompt(brandConfig)
  const user = buildUserPrompt(brandConfig, corpus, opts)
  const { text } = await callClaudeImpl(system, user)
  const drafts = parseDrafts(text).slice(0, opts.count)

  const assetRes = await payload.find({
    collection: 'social-assets',
    where: { brand: { equals: brandId } },
    limit: 50,
    depth: 0,
  })
  const assets = assetRes.docs as Array<Record<string, any>>
  const pickAsset = (): string | number | undefined => {
    const themed = assets.find((a) => (a.tags || []).some((t: any) => norm(t.tag) === norm(opts.theme)))
    return (themed || assets[0])?.id
  }

  const model = process.env.SOCIAL_MODEL || 'claude-sonnet-4-6'
  const created: string[] = []
  for (const d of drafts) {
    let copy = d.copy
    const disclaimers = brandConfig.requiredDisclaimers
    const before = detectSlop(copy, { requiredDisclaimers: disclaimers })
    let residual = before

    // One attempt, best-effort. A repair failure must never cost the calendar a draft,
    // and a retry loop on a stubborn theme burns credits with no ceiling.
    if (!before.ok) {
      try {
        const { text: repaired } = await callClaudeImpl(
          system,
          buildRepairPrompt(copy, before.flags, d.format),
        )
        const candidate = repaired.trim()
        if (candidate) {
          const after = detectSlop(candidate, { requiredDisclaimers: disclaimers })
          const stillCompliant =
            checkGuardrails(candidate, brandConfig.bannedTerms, disclaimers).missingDisclaimers
              .length === 0
          // Accept only a strict improvement that kept the disclaimer. A repair is allowed
          // to fail; it is not allowed to make the draft worse or drop mandated text.
          if (after.flags.length < before.flags.length && stillCompliant) {
            copy = candidate
            residual = after
          }
        }
      } catch {
        // Leave the draft as generated; the flags below still surface it for review.
      }
    }

    const g = checkGuardrails(copy, brandConfig.bannedTerms, disclaimers)
    const assetId = pickAsset()
    const doc = await payload.create({
      collection: 'social-posts',
      context: createContext,
      data: {
        title: buildPostTitle(opts.theme, copy),
        brand: Number(brandId),
        platform: opts.platform,
        language: opts.language,
        theme: opts.theme,
        copy,
        cta: d.cta,
        graphicStyle: d.graphicStyle,
        graphic: d.graphic,
        asset: assetId != null ? Number(assetId) : undefined,
        status: 'draft',
        generationMeta: {
          model,
          promptVersion: PROMPT_VERSION,
          // Post-repair on purpose: buildCorpus reads originalCopy !== copy as a human
          // edit. Storing the pre-repair draft would feed our own machine repair back as
          // a human correction.
          originalCopy: copy,
          guardrailFlags: buildGuardrailFlags(g, residual.flags),
        },
      },
    })
    created.push(String(doc.id))
  }
  return created
}
