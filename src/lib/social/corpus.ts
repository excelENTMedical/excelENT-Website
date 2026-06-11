import type { CorpusPost, FewShotCorpus } from './types'
import { norm } from './guardrails'

interface BuildCorpusOpts {
  maxApproved?: number
  maxEdited?: number
  maxRejections?: number
}

const byNewest = (a: CorpusPost, b: CorpusPost): number =>
  (b.updatedAt || '').localeCompare(a.updatedAt || '')

export function buildCorpus(posts: CorpusPost[], opts: BuildCorpusOpts = {}): FewShotCorpus {
  const { maxApproved = 6, maxEdited = 4, maxRejections = 4 } = opts
  const sorted = [...posts].sort(byNewest)

  const approvedPosts = sorted.filter((p) => p.status === 'approved')

  const editedPosts = approvedPosts
    .filter((p) => p.originalCopy && norm(p.originalCopy) !== norm(p.copy))
    .slice(0, maxEdited)
  const editedSet = new Set(editedPosts.map((p) => p.copy))
  const edited = editedPosts.map((p) => ({ before: p.originalCopy as string, after: p.copy }))

  const approved = approvedPosts
    .filter((p) => !editedSet.has(p.copy))
    .slice(0, maxApproved)
    .map((p) => p.copy)

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
