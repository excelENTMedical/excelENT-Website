export type ReviewStatus = 'draft' | 'needs-changes' | 'approved' | 'rejected'
export type Platform = 'linkedin' | 'facebook' | 'instagram'
export type Language = 'en' | 'es'

/** A prior post used to teach the next generation. */
export interface CorpusPost {
  copy: string
  cta?: string | null
  status: ReviewStatus
  reviewerFeedback?: string | null
  /** Copy exactly as the model generated it, before any human edit. */
  originalCopy?: string | null
  theme?: string | null
  updatedAt?: string
}

export interface FewShotCorpus {
  /** Exemplar copy to imitate. */
  approved: string[]
  /** Human-corrected pairs: the reviewer turned `before` into `after`. */
  edited: { before: string; after: string }[]
  /** What to avoid, with the reviewer's stated reason. */
  rejections: { copy: string; reason: string }[]
}

export interface BrandConfigForPrompt {
  name: string
  voice: string
  audience?: string | null
  themes: { theme: string; description?: string | null }[]
  defaultCtas: string[]
  bannedTerms: string[]
  requiredDisclaimers: string[]
  seedExamples: string[]
}

export interface GenerateOptions {
  theme: string
  platform: Platform
  language: Language
  count: number
}

export interface GuardrailResult {
  ok: boolean
  bannedHits: string[]
  missingDisclaimers: string[]
}

/** Legacy 1080x1080 card styles. */
export type LegacyGraphicStyle = 'none' | 'hook' | 'stat' | 'dataviz'

/**
 * Content-shape layouts, rendered at 1536x1024. Each is chosen because the post
 * has that shape — not to vary the look for its own sake:
 *   object    a single artefact with a number attached
 *   twoband   two competing sequences
 *   contrast  the same items, before and after
 *   orbit     one hub with peers around it, no sequence
 *   statement a claim with nothing to enumerate
 */
export type LayoutStyle = 'object' | 'twoband' | 'contrast' | 'orbit' | 'statement'

export type GraphicStyle = LegacyGraphicStyle | LayoutStyle

export const LAYOUT_STYLES: readonly LayoutStyle[] = ['object', 'twoband', 'contrast', 'orbit', 'statement']

export function isLayoutStyle(s: string | null | undefined): s is LayoutStyle {
  return (LAYOUT_STYLES as readonly string[]).includes(s || '')
}

/** Whether a post is written as paragraphs or as a bulleted list. Generation-time only — not persisted. */
export type PostFormat = 'prose' | 'bullets'

export interface GraphicFields {
  headline?: string | null
  subtext?: string | null
  statFrom?: string | null
  statTo?: string | null
  statLabel?: string | null
  caption?: string | null
  /** Newline-separated "Label | Description" rows. Feeds the step row on the
   *  layout templates, and the checklist on `contrast`. Description optional. */
  items?: string | null
  /** Small caps line under the PS | PRODUCT lockup, e.g. REVENUE CYCLE MANAGEMENT. */
  descriptor?: string | null
  /** `Label / Stamp` for the illustrated object, e.g. `CLAIM / DENIED`. Object layout only. */
  artefact?: string | null
}

/** One row of `GraphicFields.items` after parsing. */
export interface GraphicItem {
  label: string
  desc: string
  /** Optional icon name; falls back to a per-position default when absent. */
  icon: string | null
}
