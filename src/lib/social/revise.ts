import { buildSystemPrompt } from './prompt'
import type { BrandConfigForPrompt, GraphicFields, GraphicStyle } from './types'
import { GRAPHIC_STYLES, GRAPHIC_KEYS } from './generate'

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

const GRAPHIC_CONTRACT =
  '\nRewrite ONLY the graphic per the feedback. Choose a graphicStyle (hook|stat|dataviz) and fill the ' +
  'graphic fields it needs. Return ONLY JSON: {"graphicStyle":"hook|stat|dataviz",' +
  '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":""}}. ' +
  'Include only the keys the chosen style needs. No prose, no markdown code fences.'

const BOTH_CONTRACT =
  '\nRewrite BOTH the post copy and the graphic per the feedback. Return ONLY JSON: ' +
  '{"copy":"...","cta":"...","graphicStyle":"hook|stat|dataviz","graphic":{...}}. ' +
  'No prose, no markdown code fences.'

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
    if (rawStyle) out.graphicStyle = (GRAPHIC_STYLES.includes(rawStyle as GraphicStyle) ? rawStyle : 'hook') as GraphicStyle
    const g = (obj.graphic || {}) as Record<string, unknown>
    const graphic: GraphicFields = {}
    for (const k of GRAPHIC_KEYS) if (g[k] != null && g[k] !== '') graphic[k] = String(g[k]).trim()
    if (Object.keys(graphic).length || out.graphicStyle) out.graphic = graphic
  }
  return out
}
