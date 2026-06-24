import type { NotifyConfig, NotifyEvent, NotifyPost } from './types'
import { reviewSendAt } from './businessDays'

const TERMINAL = new Set(['sent', 'publishing'])
const DAY_MS = 24 * 3_600_000

export function reviewDue(post: NotifyPost, now: Date, cfg: NotifyConfig): boolean {
  if (!post.scheduledTime) return false
  if (post.status === 'rejected') return false
  if (post.notify?.reviewSentAt) return false
  return now.getTime() >= reviewSendAt(post.scheduledTime, cfg.leadDays, cfg.hourEt, cfg.tz).getTime()
}

export function reminderDue(post: NotifyPost, now: Date): boolean {
  if (!post.scheduledTime) return false
  if (post.status === 'approved' || post.status === 'rejected') return false
  if (TERMINAL.has(post.publish?.state ?? '')) return false
  if (post.notify?.reminderSentAt) return false
  const deadline = new Date(post.scheduledTime).getTime() - DAY_MS
  return now.getTime() >= deadline
}

export function immediateEvents(args: {
  operation: 'create' | 'update'
  doc: NotifyPost
  previousDoc?: NotifyPost | null
}): NotifyEvent[] {
  const { operation, doc, previousDoc } = args
  const events: NotifyEvent[] = []
  if (operation === 'create' && !doc.notify?.generatedAt) events.push('generated')
  const nowSent = doc.publish?.state === 'sent'
  const wasSent = previousDoc?.publish?.state === 'sent'
  if (nowSent && !wasSent && !doc.notify?.publishedNotifiedAt) events.push('published')
  return events
}
