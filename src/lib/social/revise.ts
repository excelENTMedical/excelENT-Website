import { buildSystemPrompt } from './prompt'
import type { BrandConfigForPrompt, GraphicFields, GraphicStyle } from './types'

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
