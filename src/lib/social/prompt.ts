import type { BrandConfigForPrompt, FewShotCorpus, GenerateOptions, Platform } from './types'

export const PROMPT_VERSION = 'v1'

const PLATFORM_GUIDE: Record<Platform, string> = {
  linkedin:
    'LinkedIn: professional tone, 1–3 short paragraphs, up to ~1300 characters, 3–5 relevant hashtags at the end. No clickbait.',
  facebook:
    'Facebook: warm and conversational, 1–2 short paragraphs, under ~500 characters, at most 2 hashtags.',
  instagram:
    'Instagram: a punchy first line as the hook, short lines, an emoji or two is fine, 5–10 hashtags grouped at the end.',
}

export function buildSystemPrompt(brand: BrandConfigForPrompt): string {
  const lines: string[] = []
  lines.push(`You are the social-media copywriter for ${brand.name}, a healthcare brand.`)
  lines.push(`\nBRAND VOICE:\n${brand.voice}`)
  if (brand.audience) lines.push(`\nTARGET AUDIENCE:\n${brand.audience}`)
  if (brand.seedExamples.length) {
    lines.push('\nREFERENCE POSTS THAT CAPTURE THE BRAND STYLE:')
    brand.seedExamples.forEach((ex, i) => lines.push(`${i + 1}. ${ex}`))
  }
  if (brand.bannedTerms.length) {
    lines.push(`\nNEVER use these words or phrases: ${brand.bannedTerms.join(', ')}.`)
  }
  if (brand.requiredDisclaimers.length) {
    lines.push('\nEVERY post MUST include this disclaimer text verbatim:')
    brand.requiredDisclaimers.forEach((d) => lines.push(`"${d}"`))
  }
  lines.push(
    '\nThis is healthcare marketing. Do not make medical claims, guarantee outcomes, or give individual medical advice.',
  )
  return lines.join('\n')
}

export function buildUserPrompt(
  brand: BrandConfigForPrompt,
  corpus: FewShotCorpus,
  opts: GenerateOptions,
): string {
  const lines: string[] = []
  const themeDesc = brand.themes.find((t) => t.theme === opts.theme)?.description
  const langName = opts.language === 'es' ? 'Spanish' : 'English'

  lines.push(`Write ${opts.count} distinct social media post(s) in ${langName}.`)
  lines.push(`\nTHEME: ${opts.theme}${themeDesc ? ` — ${themeDesc}` : ''}`)
  lines.push(`\nPLATFORM RULES — ${PLATFORM_GUIDE[opts.platform]}`)

  if (brand.defaultCtas.length) {
    lines.push(
      `\nEnd each post with one of these calls to action (or a close variant): ${brand.defaultCtas.join(' | ')}`,
    )
  }
  if (corpus.approved.length) {
    lines.push('\nPOSTS THAT WERE APPROVED — match this quality and tone:')
    corpus.approved.forEach((c, i) => lines.push(`[A${i + 1}] ${c}`))
  }
  if (corpus.edited.length) {
    lines.push('\nHUMAN EDITS — the reviewer changed the first version into the second. Learn the preference:')
    corpus.edited.forEach((e, i) => {
      lines.push(`[E${i + 1}] BEFORE: ${e.before}`)
      lines.push(`[E${i + 1}] AFTER:  ${e.after}`)
    })
  }
  if (corpus.rejections.length) {
    lines.push('\nPOSTS THAT WERE REJECTED — do not repeat these mistakes:')
    corpus.rejections.forEach((r, i) => lines.push(`[R${i + 1}] "${r.copy}" — reason: ${r.reason}`))
  }

  lines.push(
    '\nAlso design a square brand graphic for each post. Choose a graphicStyle:' +
      '\n- "hook": one punchy line (set graphic.headline to a 4–9 word hook ending in a period).' +
      '\n- "stat": a single before→after number (set graphic.statFrom, graphic.statTo, graphic.statLabel, and a short graphic.subtext).' +
      '\n- "dataviz": a two-bar comparison (set graphic.statFrom, graphic.statTo, graphic.statLabel, graphic.caption).' +
      '\nUse ONLY numbers and facts already present in the brand voice/themes/approved posts — never invent figures.',
  )
  lines.push(
    '\nReturn ONLY a JSON array. Each element: {"copy":"<post text>","cta":"<cta>","graphicStyle":"hook|stat|dataviz",' +
      '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":""}}. ' +
      'Include only the graphic keys your chosen style needs. No prose, no markdown code fences.',
  )
  return lines.join('\n')
}
