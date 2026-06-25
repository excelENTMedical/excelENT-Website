import { reviewSendAt } from './businessDays'

export type Bucket = 'missed' | 'overdue' | 'review-overdue' | 'awaiting'

export interface BucketCfg {
  leadDays: number
  hourEt: number
  tz: string
}

export interface BucketPost {
  status?: string
  scheduledTime?: string | null
  publish?: { state?: string | null } | null
  notify?: { reviewSentAt?: string | null } | null
}

export interface Bucketized<T> {
  missed: T[]
  overdue: T[]
  reviewOverdue: T[]
  awaiting: T[]
}

const DAY_MS = 24 * 60 * 60 * 1000
const UNDECIDED = new Set(['draft', 'needs-changes'])

// Assign a post to exactly ONE bucket by severity priority, or null if it needs
// no attention. Priority: missed > overdue > review-overdue > awaiting.
export function classify(post: BucketPost, now: Date, cfg: BucketCfg): Bucket | null {
  const sched = post.scheduledTime ? new Date(post.scheduledTime) : null
  if (!sched || Number.isNaN(sched.getTime())) return null

  const status = post.status ?? ''
  const undecided = UNDECIDED.has(status)
  const reviewSent = Boolean(post.notify?.reviewSentAt)
  const published = post.publish?.state === 'sent'
  const t = now.getTime()
  const go = sched.getTime()

  // 1. missed: past go-live, never resolved, not published.
  if (go < t && status !== 'approved' && status !== 'rejected' && !published) {
    return 'missed'
  }
  // 2. overdue: undecided, inside the 24h-before-go-live window.
  if (undecided && t < go && go - t <= DAY_MS) {
    return 'overdue'
  }
  // 3. review-overdue: undecided, no review email yet, past its scheduled send time.
  if (
    undecided &&
    !reviewSent &&
    t < go &&
    reviewSendAt(post.scheduledTime as string, cfg.leadDays, cfg.hourEt, cfg.tz).getTime() < t
  ) {
    return 'review-overdue'
  }
  // 4. awaiting: undecided, review email sent, still before go-live.
  if (undecided && reviewSent && t < go) {
    return 'awaiting'
  }
  return null
}

export function bucketize<T extends BucketPost>(posts: T[], now: Date, cfg: BucketCfg): Bucketized<T> {
  const out: Bucketized<T> = { missed: [], overdue: [], reviewOverdue: [], awaiting: [] }
  for (const p of posts) {
    switch (classify(p, now, cfg)) {
      case 'missed': out.missed.push(p); break
      case 'overdue': out.overdue.push(p); break
      case 'review-overdue': out.reviewOverdue.push(p); break
      case 'awaiting': out.awaiting.push(p); break
    }
  }
  const at = (p: BucketPost) => new Date(p.scheduledTime as string).getTime()
  out.awaiting.sort((a, b) => at(a) - at(b))
  return out
}
