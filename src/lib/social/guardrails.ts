import type { GuardrailResult } from './types'

/** Lowercase + collapse whitespace so matches survive formatting noise. */
export const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function checkGuardrails(
  copy: string,
  bannedTerms: string[],
  requiredDisclaimers: string[],
): GuardrailResult {
  const haystack = norm(copy)

  const bannedHits = bannedTerms
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .filter((t) => haystack.includes(norm(t)))

  const missingDisclaimers = requiredDisclaimers
    .map((d) => d.trim())
    .filter((d) => d.length > 0)
    .filter((d) => !haystack.includes(norm(d)))

  return {
    ok: bannedHits.length === 0 && missingDisclaimers.length === 0,
    bannedHits,
    missingDisclaimers,
  }
}
