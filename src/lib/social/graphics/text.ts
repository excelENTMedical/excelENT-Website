import type { GraphicItem } from '@/lib/social/types'
import { isIconName } from './layout/icons'

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
  const m = t.match(/^([\s\S]*[.!?])\s+(\S[\s\S]*)$/)
  if (m) return { lead: m[1].trim(), accent: m[2].trim() }
  return { lead: t, accent: '' }
}

/**
 * Parse the `items` field: one row per line, `Label | Description | icon`.
 * Description and icon are both optional. Blank lines and empty labels drop out.
 */
export function parseItems(raw: string | null | undefined, max = 5): GraphicItem[] {
  return String(raw ?? '')
    .split('\n')
    .map((line) => {
      const [label, desc, icon] = line.split('|')
      return {
        label: (label || '').trim(),
        desc: (desc || '').trim(),
        icon: (icon || '').trim() || null,
      }
    })
    .filter((it) => it.label.length > 0)
    .slice(0, max)
}

/**
 * Recover an orbit row that wrote the whole lockup into the label field.
 *
 * Orbit draws every satellite as `PS | LABEL`, so a row's label is the bare
 * product name. But `graphic.items` is itself pipe-delimited, so a model that
 * writes the lockup out in full — `PS | RCM | chart` — parses into label `PS`,
 * desc `RCM`, and the satellite renders `PS | PS`. The prompt asks for the bare
 * name; this makes shipping the doubled lockup impossible either way.
 *
 * Shifting is only safe because the icon vocabulary is closed: a third field
 * that names an icon stays an icon, and anything else becomes the description.
 */
export function stripLockupPrefix(items: GraphicItem[]): GraphicItem[] {
  return items
    .map((it) => {
      if (it.label.trim().toUpperCase() !== 'PS') return it
      const iconIsName = isIconName(it.icon)
      return {
        label: it.desc,
        desc: iconIsName ? '' : (it.icon ?? ''),
        icon: iconIsName ? it.icon : null,
      }
    })
    .filter((it) => it.label.length > 0)
}

/**
 * Split a headline for the two-tone treatment: navy lead, purple accent.
 *
 * Prefers a sentence break, then the last comma. Failing both, a single-clause
 * headline is broken at the word boundary nearest the middle — without this a
 * line like "Their decision happens fast." renders entirely navy and loses the
 * treatment every approved graphic has. Under four words there is nothing to
 * balance, so the line stays whole.
 */
export function splitHeadline(headline: string): { lead: string; accent: string } {
  const t = (headline || '').trim()
  const sentence = splitHook(t)
  if (sentence.accent) return sentence
  const c = t.lastIndexOf(', ')
  if (c > 0) return { lead: t.slice(0, c + 1).trim(), accent: t.slice(c + 2).trim() }

  const words = t.split(/\s+/).filter(Boolean)
  if (words.length < 4) return { lead: t, accent: '' }
  let at = 1
  let best = Infinity
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length)
    if (diff < best) {
      best = diff
      at = i
    }
  }
  return { lead: words.slice(0, at).join(' '), accent: words.slice(at).join(' ') }
}

/** Parse the artefact field: `Label / Stamp`, both optional. */
export function parseArtefact(raw: string | null | undefined): { label: string; stamp: string } {
  const [label, ...rest] = String(raw ?? '').split('/')
  return { label: (label || '').trim(), stamp: rest.join('/').trim() }
}
