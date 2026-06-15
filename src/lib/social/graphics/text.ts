/** Trim and cap a string, appending an ellipsis if it was cut. */
export function clamp(s: string, max: number): string {
  const t = (s || '').trim()
  return t.length <= max ? t : t.slice(0, max).trimEnd() + '…'
}

/** Parse a leading number out of strings like "11.8%". Returns null if none. */
export function parsePercent(s: string | null | undefined): number | null {
  const m = String(s ?? '').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

/** Split a hook into a lead clause and an emphasised final clause. */
export function splitHook(headline: string): { lead: string; accent: string } {
  const t = (headline || '').trim()
  const m = t.match(/^(.*[.!?])\s+(\S.*)$/s)
  if (m) return { lead: m[1].trim(), accent: m[2].trim() }
  return { lead: t, accent: '' }
}
