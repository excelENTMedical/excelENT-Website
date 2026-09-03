import type { GraphicFields, GraphicItem } from '@/lib/social/types'
import { clamp, parseArtefact, parseItems, splitHeadline } from '../text'
import { lockupForBrand } from '../brands'

/** Everything the five layout templates draw from. */
export interface LayoutData {
  lead: string
  accent: string
  sub: string
  items: GraphicItem[]
  product: string | null
  descriptor: string | null
  cta: string | null
  statFrom: string
  statTo: string
  statLabel: string
  artefactLabel: string
  artefactStamp: string
}

/**
 * A descriptor of `-` suppresses the line entirely, rather than falling back to
 * the brand default. Four of the five brand descriptors in `brands.ts` are still
 * unconfirmed placeholders, so a post must be able to say "no descriptor" and
 * mean it — otherwise placeholder wording rides out on a published graphic.
 */
export const NO_DESCRIPTOR = '-'

export interface LayoutInput {
  fields: GraphicFields
  brandSlug?: string | null
  cta?: string | null
}

/**
 * Build layout content from the post. Anything absent stays empty — the
 * templates drop the corresponding block rather than inventing copy for it.
 */
export function prepareLayout({ fields, brandSlug, cta }: LayoutInput): LayoutData {
  const { lead, accent } = splitHeadline(fields.headline || '')
  const lock = lockupForBrand(brandSlug)
  const artefact = parseArtefact(fields.artefact)
  return {
    lead,
    accent,
    // Wide enough to hold both halves of a `left || right` note; each consumer
    // clamps its own share.
    sub: clamp(fields.subtext || '', 340),
    items: parseItems(fields.items, 12),
    product: lock.product,
    descriptor: resolveDescriptor(fields.descriptor, lock.descriptor),
    cta: clamp(fields.caption || cta || '', 60) || null,
    statFrom: (fields.statFrom || '').trim(),
    statTo: (fields.statTo || '').trim(),
    statLabel: (fields.statLabel || '').trim(),
    artefactLabel: artefact.label,
    artefactStamp: artefact.stamp,
  }
}

function resolveDescriptor(field: string | null | undefined, fallback: string): string | null {
  const own = (field || '').trim()
  if (own === NO_DESCRIPTOR) return null
  return (own || fallback || '').trim() || null
}

/** True when both ends of a stat pair are present. */
export function hasStatPair(d: LayoutData): boolean {
  return d.statFrom.length > 0 && d.statTo.length > 0
}
