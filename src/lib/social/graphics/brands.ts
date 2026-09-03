/**
 * Lockup configuration per brand profile.
 *
 * `product` drives the PS | PRODUCT wordmark; brands without one show the
 * excelENT logo instead. `descriptor` is the small-caps line beneath it.
 *
 * PROVENANCE: only PS | RCM's descriptor is confirmed — it was read off the
 * graphic the client approved on 2026-09-01. The other three are placeholders
 * written by Claude and are awaiting the client's own wording. A post can
 * always override with `graphic.descriptor`.
 */
export interface BrandLockup {
  product: string | null
  descriptor: string
  descriptorConfirmed: boolean
}

const LOCKUPS: Record<string, BrandLockup> = {
  'ps-rcm': { product: 'RCM', descriptor: 'REVENUE CYCLE MANAGEMENT', descriptorConfirmed: true },
  'ps-lexi': { product: 'LEXI', descriptor: 'FRONT DESK SUPPORT', descriptorConfirmed: false },
  'ps-connect': { product: 'CONNECT', descriptor: 'PATIENT ACQUISITION', descriptorConfirmed: false },
  'excelent-practice-solutions': { product: null, descriptor: 'THE ENT PRACTICE PLATFORM', descriptorConfirmed: false },
  'excelent-company': { product: null, descriptor: 'OTOLARYNGOLOGY, EXCLUSIVELY', descriptorConfirmed: false },
  'patient-facing': { product: null, descriptor: '', descriptorConfirmed: true },
}

const FALLBACK: BrandLockup = { product: null, descriptor: '', descriptorConfirmed: true }

export function lockupForBrand(slug: string | null | undefined): BrandLockup {
  return LOCKUPS[slug || ''] || FALLBACK
}

/** Descriptors still carrying placeholder wording — surfaced by the test suite. */
export function unconfirmedDescriptors(): string[] {
  return Object.entries(LOCKUPS)
    .filter(([, v]) => !v.descriptorConfirmed)
    .map(([slug]) => slug)
}
