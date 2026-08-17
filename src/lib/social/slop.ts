/**
 * Detects the writing tics the anti-slop rules ban.
 *
 * Pure: no I/O, no Payload, no network. Mirrors `guardrails.ts`, which does the same job
 * for banned terms and required disclaimers.
 *
 * Every rule here corresponds to a pattern measured in the 2026-07-31 corpus audit
 * (43 generated posts + 8 seeds). A prompt instruction is a hope; this is the check.
 *
 * Each flag carries the offending excerpt, not just a rule name. That excerpt is what
 * makes the repair pass in `generate.ts` work — quoting a sentence back to the model
 * fixes it far more reliably than naming the rule it broke.
 */

export type SlopRule =
  | 'emDash'
  | 'multiEmDash'
  | 'colonReveal'
  | 'notYButX'
  | 'binaryContrast'
  | 'dramaticFragment'
  | 'formulaOpener'
  | 'weaselAttribution'

export interface SlopFlag {
  rule: SlopRule
  excerpt: string
}

export interface SlopResult {
  ok: boolean
  flags: SlopFlag[]
}

export interface DetectSlopOpts {
  /** Disclaimer text the brand mandates verbatim. Excluded from detection. */
  requiredDisclaimers?: string[]
}

/** A line that is nothing but hashtags. */
const HASHTAG_LINE = /^\s*(#[^\s#]+\s*)+$/

/** Escape a literal string for use inside a RegExp. */
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Strip the text that must not be judged: disclaimers the brand mandates verbatim, and
 * the trailing hashtag block.
 *
 * The disclaimer exclusion is not a nicety. The patient-facing disclaimer contains an em
 * dash and is required word-for-word — counting it flags the writer for compliance, which
 * is exactly what made the first pass of the 07-31 audit read wrong until it was excluded.
 *
 * Disclaimers are matched with `\s+` between words so a reflowed line break still matches.
 */
export function prepare(copy: string, requiredDisclaimers: string[] = []): string {
  let out = copy

  for (const d of requiredDisclaimers) {
    const trimmed = d.trim()
    if (!trimmed) continue
    const pattern = trimmed.split(/\s+/).map(escapeRe).join('\\s+')
    out = out.replace(new RegExp(pattern, 'gi'), ' ')
  }

  const lines = out.split('\n')
  while (lines.length && (HASHTAG_LINE.test(lines[lines.length - 1]) || !lines[lines.length - 1].trim())) {
    lines.pop()
  }
  return lines.join('\n')
}

/** First line containing `needle`, trimmed — used as the flag excerpt. */
const lineContaining = (text: string, needle: string): string => {
  const line = text.split('\n').find((l) => l.includes(needle))
  return (line || text).trim()
}

/**
 * A colon that does not introduce a list.
 *
 * `(?!\d)` skips clock times (5:30). Requiring whitespace after the colon skips URLs
 * (https://). The negative lookahead on `•` is what keeps a legitimate list intro legal —
 * the writing rules allow colons for lists and labels, only drama is banned.
 */
const COLON_REVEAL = /[^\s:][^.!?\n]{0,80}:(?!\d)[ \t]*\n?\s*(?![•\-*])\S[^.!?\n]*/

/** Mid-sentence negation contrasts. The v2 rules banned only the two-sentence form. */
const NOT_Y_BUT_X: RegExp[] = [
  /[^.!?\n]{0,80},\s+not\s+(?!to mention\b)[^.!?\n]{0,60}/,
  /\bnot\s+(?:just|only)\b[^.!?\n]{0,60},?\s+but\b[^.!?\n]{0,60}/,
  /\b(?:is|are|was|were)n['']?t\b[^.!?\n]{0,60},\s+(?:it|they|that)['']?s?\b/,
]

/** The two-sentence version: "That's not X. That's Y." */
const BINARY_CONTRAST =
  /\b(?:that['']s|that is|this is|it['']s|it is)\s+not\b[^.!?\n]{0,80}[.!?]\s+(?:that['']s|that is|this is|it['']s|it is)\b/i

const FORMULA_OPENERS: RegExp[] = [
  /^most\s+\w+/i,
  /^here['']s the thing/i,
  /^let me be clear/i,
  /^i['']ll be honest/i,
  /^here['']s what (?:nobody|no one) tells you/i,
  /^what most \w+ get wrong/i,
  /^it['']s worth noting/i,
  /^in today['']s world/i,
  /^when it comes to/i,
  /^the (?:reality|truth) is/i,
  /^at the end of the day/i,
]

const WEASEL =
  /\b(?:studies show|research shows|experts agree|many argue|it is widely believed|some say)\b/i

/** A line that is a bullet item. Bullets are legitimately short and legitimately preceded by a colon. */
const BULLET_LINE = /^\s*[•]/

const MAX_FRAGMENT_WORDS = 4

/**
 * Finds a sentence of four words or fewer.
 *
 * Three exclusions, each earned:
 * - Bullet lines are supposed to be short fragments.
 * - The last non-empty line is the call to action ("Request a Demo."), which the writing
 *   rules explicitly permit as an ending.
 * - A quoted line is deliberate voice, not a tic. Brand 2's seed example opens on a
 *   phone-tree quote made of four-word sentences.
 */
function findDramaticFragment(text: string): string | null {
  const lines = text.split('\n')
  let lastContentIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) {
      lastContentIdx = i
      break
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) continue
    if (i === lastContentIdx) continue
    if (BULLET_LINE.test(line)) continue
    if (trimmed.startsWith('"') || trimmed.startsWith('"')) continue

    for (const sentence of trimmed.split(/(?<=[.!?])\s+/)) {
      const s = sentence.trim()
      if (!/[.!?]$/.test(s)) continue
      const words = s.split(/\s+/).filter(Boolean)
      if (words.length > 0 && words.length <= MAX_FRAGMENT_WORDS) return s
    }
  }
  return null
}

export function detectSlop(copy: string, opts: DetectSlopOpts = {}): SlopResult {
  const text = prepare(copy, opts.requiredDisclaimers)
  const flags: SlopFlag[] = []

  const emDashes = text.match(/—/g) || []
  if (emDashes.length > 0) {
    flags.push({ rule: 'emDash', excerpt: lineContaining(text, '—') })
  }
  if (emDashes.length > 1) {
    flags.push({ rule: 'multiEmDash', excerpt: `${emDashes.length} em dashes in one post` })
  }

  const colon = text.match(COLON_REVEAL)
  if (colon) flags.push({ rule: 'colonReveal', excerpt: colon[0].trim() })

  for (const re of NOT_Y_BUT_X) {
    const m = text.match(re)
    if (m) {
      flags.push({ rule: 'notYButX', excerpt: m[0].trim() })
      break
    }
  }

  const binary = text.match(BINARY_CONTRAST)
  if (binary) flags.push({ rule: 'binaryContrast', excerpt: binary[0].trim() })

  const fragment = findDramaticFragment(text)
  if (fragment) flags.push({ rule: 'dramaticFragment', excerpt: fragment })

  const opener = text.trim().split(/(?<=[.!?])\s+/)[0] || ''
  if (FORMULA_OPENERS.some((re) => re.test(opener.trim()))) {
    flags.push({ rule: 'formulaOpener', excerpt: opener.trim() })
  }

  const weasel = text.match(WEASEL)
  if (weasel) flags.push({ rule: 'weaselAttribution', excerpt: lineContaining(text, weasel[0]) })

  return { ok: flags.length === 0, flags }
}
