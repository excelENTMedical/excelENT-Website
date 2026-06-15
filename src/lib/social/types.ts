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

export type GraphicStyle = 'none' | 'hook' | 'stat' | 'dataviz'

export interface GraphicFields {
  headline?: string | null
  subtext?: string | null
  statFrom?: string | null
  statTo?: string | null
  statLabel?: string | null
  caption?: string | null
}
