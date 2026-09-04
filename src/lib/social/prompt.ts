import type { BrandConfigForPrompt, FewShotCorpus, GenerateOptions, Platform } from './types'

// Bumped when the instructions change in a way that should show up in the copy. Stored on
// every post as generationMeta.promptVersion, so you can tell which rules a draft was
// written under. v2 added the anti-slop writing rules below. v3 added bullets and the mid-sentence negation contrast rule.
export const PROMPT_VERSION = 'v4-layouts'

/**
 * Writing rules distilled from the `no-ai-slop` skill (github.com/petergyang/no-ai-slop,
 * MIT), adapted for short social copy.
 *
 * These sit in the SYSTEM prompt because they govern how everything is written, not what
 * any single post is about. Each rule carries a concrete example: a model follows "don't
 * write 'That's not a marketing problem. That's a patient journey problem.'" far more
 * reliably than it follows "avoid binary contrasts".
 */
const WRITING_RULES = `
WRITING RULES — these decide whether a draft reads human or generic. Follow them all.

Never use these words: delve, foster, leverage, utilize, facilitate, empower, streamline,
robust, cutting-edge, paradigm shift, game changer, transformative, elevate, embark,
supercharge, harness, ever-evolving, tapestry, realm, beacon, multifaceted, meticulous,
intricate, paramount.

Never open with filler: "it's worth noting", "it's important to note", "at the end of the
day", "when it comes to", "in today's world", "the reality is", "the truth is".

Avoid these patterns:
- Binary contrasts. Not "That's not a marketing problem. That's a patient journey problem."
  State the second half directly.
- Mid-sentence negation contrasts. Not "a starting point, not the destination" and not
  "not just billing, but the whole revenue cycle." Say what the thing is and stop. This
  is the same tic as a binary contrast wearing a comma.
- Throat-clearing openers. Not "Here's the thing," "Let me be clear," "I'll be honest."
  Cut them and make the point.
- Faux-insight setups. Not "Here's what nobody tells you," "What most people get wrong."
  Make the claim stand on its own.
- Colon reveals. Not "The best part: it learns." Write it as a plain sentence. Colons are
  for lists and labels, not drama.
- Superficial -ing analysis. Not "...adds scheduling, highlighting our commitment to care."
  Say what it does for the reader instead.
- Importance puffery. Not "marks a pivotal moment," "stands as a testament," "plays a vital
  role." State the fact and let the reader judge.
- Weasel attribution. Not "studies show," "experts agree," "many argue." Name the source or
  cut the claim. Never invent one.
- Negative listing and dramatic fragments. Not "Not a vendor. Not a tool. A partner." and
  not "That's it. That's the whole thing."
- Fake-profound kickers. Do not end on a metaphor or mic-drop line. End on the clearest
  concrete sentence or the call to action.
- Em dashes as a rhythm crutch. In posts this short, use none — commas, periods, or
  parentheses do the job.

Do this instead:
- Be concrete. "Cut denial rates from 12% to 4%" beats "improved revenue performance."
  Never invent a number; use only figures given to you.
- Use active voice with a human subject. "The front office confirms coverage" beats
  "coverage gets confirmed."
- Let verbs work. "decided" beats "made a decision"; "can" beats "has the ability to".
- Repeat the right word rather than cycling synonyms for variety.
- Vary sentence shape. Do not stack identical punchy fragments.

BULLETS — set "format" to "bullets" only when the content is genuinely a list: causes,
steps, features, or items that share a grammatical shape. A company story, a patient
narrative, or anything with a through-line stays "prose". Most posts are prose.

When you do use bullets:
- Open with one short paragraph of setup, then the list, then the call to action. Never
  open a post on a bullet.
- Start each item with the literal character • — LinkedIn strips markdown, so "-" and "*"
  render as themselves.
- Three to five items. Two is a sentence; six is a spreadsheet.
- Parallel grammar: every item opens with the same part of speech.
- No terminal periods on fragments.
- A colon introducing the list is correct. That is the one colon these rules allow.`

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
  lines.push(WRITING_RULES)
  lines.push(
    '\nThis is healthcare marketing. Do not make medical claims, guarantee outcomes, or give individual medical advice.',
  )
  // Last word, deliberately: the writing rules are style, the brand rules are compliance.
  // A banned term or a missing disclaimer fails review no matter how well the post reads.
  if (brand.bannedTerms.length || brand.requiredDisclaimers.length) {
    lines.push(
      '\nWhere the writing rules and the brand rules above disagree, the brand rules win: never use a banned term, and always include the required disclaimer verbatim.',
    )
  }
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
    '\nAlso design a landscape brand graphic for each post. Pick the graphicStyle from the SHAPE of ' +
      'what the post says, never for variety:' +
      '\n- "statement": a claim with nothing to enumerate. Set graphic.headline (4 to 9 words, ending ' +
      'in a period) and a short graphic.subtext.' +
      '\n- "object": one artefact with a number attached. Set graphic.headline, graphic.statFrom, ' +
      'graphic.statTo, graphic.statLabel, and graphic.artefact as "Label / Stamp", e.g. "Claim / Denied".' +
      '\n- "contrast": the same items before and after. Set graphic.headline, graphic.items, and ' +
      'graphic.subtext as "left note || right note".' +
      '\n- "twoband": two competing sequences. Set graphic.headline and graphic.items, with a line of ' +
      '-- separating the upper band from the lower.' +
      '\n- "orbit": one hub with peers around it, no sequence. Set graphic.headline, graphic.subtext and ' +
      '3 or 4 graphic.items. Every orbit item is drawn as "PS | LABEL", so each label must be a real ' +
      'product (RCM, LEXI, CONNECT) and never a generic capability.' +
      '\ngraphic.items is one row per line, "Label | Description | icon". icon is one of: phone, search, ' +
      'list, clock, exit, shield, pin, calendar, chart, users, doc, code.' +
      '\nLeave a field out rather than filling it with something invented. An absent block is dropped ' +
      'from the layout; a fabricated one ships.' +
      '\nDo not set graphic.descriptor. It comes from the brand.' +
      '\nUse ONLY numbers and facts already present in the brand voice/themes/approved posts. Never ' +
      'invent figures.',
  )
  lines.push(
    '\nReturn ONLY a JSON array. Each element: {"copy":"<post text>","cta":"<cta>","format":"prose|bullets",' +
      '"graphicStyle":"statement|object|contrast|twoband|orbit",' +
      '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":"","items":"","artefact":""}}. ' +
      'Include only the graphic keys your chosen style needs. No prose, no markdown code fences.',
  )
  return lines.join('\n')
}
