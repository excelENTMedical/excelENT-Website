import type { CorpusPost, FewShotCorpus } from './types'
import { norm } from './guardrails'
import { detectSlop } from './slop'

interface BuildCorpusOpts {
  maxApproved?: number
  maxEdited?: number
  maxRejections?: number
  /**
   * Disclaimers the brand mandates verbatim, passed straight through to `detectSlop`.
   *
   * Threaded in from the caller rather than looked up here: `CorpusPost` carries no brand,
   * and `buildCorpus` must stay pure and synchronous because it runs on the generation hot
   * path. A lookup would add I/O to a function that has none.
   *
   * Scoring without them is not cosmetic. The patient-facing disclaimer contains an em dash
   * and an `X, not Y`, and by taking the last line it turns the real call to action into a
   * `dramaticFragment`. A post that `generate.ts` scores at zero flags scores three here,
   * so without this the "prefer clean" branch below can never fire for that brand.
   */
  requiredDisclaimers?: string[]
}

/**
 * Normalized first four words. Two posts that share this share a formula.
 *
 * The 2026-07-31 audit found eight posts opening `Most [noun]`. Nothing instructed that;
 * the loop learned it from its own approved output and taught it back. De-duplicating
 * openers is what stops one formula from occupying most of the exemplar slots.
 */
const openerKey = (copy: string): string => norm(copy).split(' ').slice(0, 4).join(' ')

/**
 * Rank exemplars by quality, then recency, and never let one opener repeat.
 *
 * Selection used to be recency alone, and the prompt hands these to the model labelled
 * "match this quality and tone" — so any tic that survived human review became the next
 * template. That is why the em dash rate climbed back from 27% to 60% after the seed
 * examples were cleaned up.
 *
 * Flagged posts are kept as a fallback, ordered fewest-flags-first: a brand with no clean
 * history still needs exemplars, and an empty corpus generates worse copy than a flawed one.
 */
function rankByQuality(
  posts: CorpusPost[],
  max: number,
  requiredDisclaimers: string[] = [],
): CorpusPost[] {
  const scored = posts.map((p) => ({ p, flags: detectSlop(p.copy, { requiredDisclaimers }).flags.length }))
  const clean = scored.filter((s) => s.flags === 0)
  // Array.prototype.sort is stable, so recency order survives within an equal flag count.
  const rest = scored.filter((s) => s.flags > 0).sort((a, b) => a.flags - b.flags)

  const seen = new Set<string>()
  const picked: CorpusPost[] = []
  for (const { p } of [...clean, ...rest]) {
    if (picked.length >= max) break
    const key = openerKey(p.copy)
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(p)
  }
  return picked
}

const byNewest = (a: CorpusPost, b: CorpusPost): number =>
  (b.updatedAt || '').localeCompare(a.updatedAt || '')

export function buildCorpus(posts: CorpusPost[], opts: BuildCorpusOpts = {}): FewShotCorpus {
  const { maxApproved = 6, maxEdited = 4, maxRejections = 4, requiredDisclaimers = [] } = opts
  const sorted = [...posts].sort(byNewest)

  const approvedPosts = sorted.filter((p) => p.status === 'approved')

  // A human edit that removed slop is the most valuable signal in the system. Rank these
  // first so the strongest exemplars claim their slots before the plain approved pool.
  const editedPosts = rankByQuality(
    approvedPosts.filter((p) => p.originalCopy && norm(p.originalCopy) !== norm(p.copy)),
    maxEdited,
    requiredDisclaimers,
  )
  const editedSet = new Set(editedPosts.map((p) => p.copy))
  const edited = editedPosts.map((p) => ({ before: p.originalCopy as string, after: p.copy }))

  const approved = rankByQuality(
    approvedPosts.filter((p) => !editedSet.has(p.copy)),
    maxApproved,
    requiredDisclaimers,
  ).map((p) => p.copy)

  const rejections = sorted
    .filter(
      (p) =>
        (p.status === 'rejected' || p.status === 'needs-changes') &&
        !!p.reviewerFeedback &&
        p.reviewerFeedback.trim().length > 0,
    )
    .slice(0, maxRejections)
    .map((p) => ({ copy: p.copy, reason: (p.reviewerFeedback as string).trim() }))

  return { approved, edited, rejections }
}
