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

  return { ok: flags.length === 0, flags }
}
