import { getPayloadClient } from '@/lib/payload'
import { buildSystemPrompt } from './prompt'
import type { BrandConfigForPrompt, GraphicFields, GraphicStyle } from './types'
import { GRAPHIC_KEYS, buildBrandConfig, buildGuardrailFlags, coerceGraphicStyle, graphicFor } from './generate'
import { callClaude } from './claude'
import { checkGuardrails } from './guardrails'
import { detectSlop } from './slop'

export type ReviseTarget = 'copy' | 'graphic' | 'both'

export interface RevisePostState {
  copy: string
  cta?: string | null
  graphicStyle?: GraphicStyle | null
  graphic?: GraphicFields | null
}

const COPY_CONTRACT =
  '\nRewrite ONLY the post copy per the feedback; keep it on-brand. Return ONLY JSON: ' +
  '{"copy":"<new post text>","cta":"<the call to action you used>"}. No prose, no markdown code fences.'

/** Kept in step with the generator's own list in prompt.ts. */
const LAYOUTS = 'statement|object|contrast|twoband|orbit'

const GRAPHIC_CONTRACT =
  `\nRewrite ONLY the graphic per the feedback. Choose a graphicStyle (${LAYOUTS}) from the shape of ` +
  'what the post says, and fill the graphic fields it needs. graphic.items is one row per line, ' +
  '"Label | Description | icon". Do not set graphic.descriptor; it comes from the brand. ' +
  `Return ONLY JSON: {"graphicStyle":"${LAYOUTS}",` +
  '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":"","items":"","artefact":""}}. ' +
  'Include only the keys the chosen style needs. No prose, no markdown code fences.'

const BOTH_CONTRACT =
  '\nRewrite BOTH the post copy and the graphic per the feedback. Return ONLY JSON: ' +
  `{"copy":"...","cta":"...","graphicStyle":"${LAYOUTS}","graphic":{...}}. ` +
  'Do not set graphic.descriptor; it comes from the brand. No prose, no markdown code fences.'

export function buildRevisePrompt(
  brand: BrandConfigForPrompt,
  post: RevisePostState,
  note: string,
  target: ReviseTarget,
): { system: string; user: string } {
  const system = buildSystemPrompt(brand)
  const lines: string[] = []
  lines.push('Revise an existing social media post based on reviewer feedback.')
  lines.push(`\nREVIEWER FEEDBACK:\n${note}`)
  lines.push('\nCURRENT POST:')
  lines.push(`copy: ${post.copy}`)
  if (post.cta) lines.push(`cta: ${post.cta}`)
  if (post.graphicStyle) lines.push(`graphicStyle: ${post.graphicStyle}`)
  if (post.graphic) lines.push(`graphic: ${JSON.stringify(post.graphic)}`)
  lines.push('\nUse ONLY numbers and facts already present in the brand voice/themes — never invent figures.')
  lines.push(target === 'copy' ? COPY_CONTRACT : target === 'graphic' ? GRAPHIC_CONTRACT : BOTH_CONTRACT)
  return { system, user: lines.join('\n') }
}

export interface RevisionResult {
  copy?: string
  cta?: string
  graphicStyle?: GraphicStyle
  graphic?: GraphicFields
}

/** Extract the first balanced {...} JSON object, tolerating fences/prose. */
function extractObject(text: string): Record<string, unknown> {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object in model output')
  let depth = 0
  let inString = false
  let escaped = false
  let end = -1
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end === -1) throw new Error('No JSON object in model output')
  const obj = JSON.parse(text.slice(start, end + 1))
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Model output was not an object')
  return obj as Record<string, unknown>
}

/** Parse a revision response, keeping only the fields valid for `target`. */
export function parseRevision(text: string, target: ReviseTarget): RevisionResult {
  const obj = extractObject(text)
  const out: RevisionResult = {}
  if (target === 'copy' || target === 'both') {
    if (typeof obj.copy === 'string') out.copy = obj.copy.trim()
    if (obj.cta != null && obj.cta !== '') out.cta = String(obj.cta).trim()
  }
  if (target === 'graphic' || target === 'both') {
    const rawStyle = String(obj.graphicStyle || '')
    if (rawStyle) out.graphicStyle = coerceGraphicStyle(rawStyle)
    const g = (obj.graphic || {}) as Record<string, unknown>
    const graphic: GraphicFields = {}
    for (const k of GRAPHIC_KEYS) if (g[k] != null && g[k] !== '') graphic[k] = String(g[k]).trim()
    if (Object.keys(graphic).length || out.graphicStyle) out.graphic = graphic
  }
  return out
}


/**
 * Rebuild generationMeta for a machine revision.
 *
 * originalCopy is set to the REVISED copy on purpose. buildCorpus reads
 * `originalCopy !== copy` as a reviewer correction and promotes that pair into the
 * highest-priority "learn the preference" exemplar tier. Leaving originalCopy at the
 * previously generated text would launder every Revise click into the corpus as a human
 * edit and teach the loop from its own output - the amplification bug this module guards
 * against. Slop flags ride along so a revision cannot silently clear the review queue.
 */
export function buildRevisionMeta(
  prevMeta: Record<string, any> | null | undefined,
  copy: string,
  brandConfig: BrandConfigForPrompt,
): Record<string, any> {
  const g = checkGuardrails(copy, brandConfig.bannedTerms, brandConfig.requiredDisclaimers)
  const slop = detectSlop(copy, { requiredDisclaimers: brandConfig.requiredDisclaimers })
  return {
    ...(prevMeta || {}),
    originalCopy: copy,
    guardrailFlags: buildGuardrailFlags(g, slop.flags),
  }
}

/** Rewrite a post's copy and/or graphic in place from a reviewer note. */
export async function reviseDraft(
  postId: string | number,
  opts: { note: string; target: ReviseTarget },
): Promise<void> {
  const payload = await getPayloadClient()
  const post = await payload.findByID({ collection: 'social-posts', id: postId, depth: 1 })
  if (!post) throw new Error(`Post ${postId} not found`)
  const p = post as Record<string, any>

  const brandConfig = buildBrandConfig(p.brand as Record<string, any>)
  const { system, user } = buildRevisePrompt(
    brandConfig,
    { copy: p.copy, cta: p.cta, graphicStyle: p.graphicStyle, graphic: p.graphic },
    opts.note,
    opts.target,
  )
  const { text } = await callClaude(system, user)
  const rev = parseRevision(text, opts.target)

  const data: Record<string, any> = { status: 'draft' }
  if (rev.copy !== undefined) {
    data.copy = rev.copy
    if (rev.cta !== undefined) data.cta = rev.cta
    data.generationMeta = buildRevisionMeta(p.generationMeta, rev.copy, brandConfig)
  }
  if (rev.graphicStyle !== undefined) data.graphicStyle = rev.graphicStyle
  if (rev.graphic !== undefined) {
    // Same rule as generation: the descriptor is the brand's, never the model's.
    const style = rev.graphicStyle ?? (p.graphicStyle as GraphicStyle)
    const slug = (p.brand as Record<string, unknown> | null)?.slug as string | null
    data.graphic = graphicFor({ graphicStyle: style, graphic: rev.graphic }, slug ?? null)
  }

  await payload.update({ collection: 'social-posts', id: postId, data })
}
