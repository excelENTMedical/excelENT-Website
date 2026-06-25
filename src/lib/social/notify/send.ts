// src/lib/social/notify/send.ts
import type { NotifyEvent, NotifyConfig, NotifyPost } from './types'
import { recipientsFor } from './recipients'
import { renderEmail } from './email'

type StampField = 'generatedAt' | 'reviewSentAt' | 'reminderSentAt' | 'publishedNotifiedAt' | 'missedAlertSentAt'

const STAMP_FIELD: Record<NotifyEvent, StampField> = {
  generated: 'generatedAt',
  review: 'reviewSentAt',
  reminder: 'reminderSentAt',
  published: 'publishedNotifiedAt',
  missed: 'missedAlertSentAt',
}

export interface SendablePayload {
  sendEmail: (m: { to: string[]; subject: string; html: string }) => Promise<unknown>
  update: (a: { collection: string; id: string | number; data: unknown; context?: unknown }) => Promise<unknown>
  findByID: (a: { collection: string; id: string | number; depth?: number }) => Promise<unknown>
}

export async function notify(
  event: NotifyEvent,
  post: NotifyPost,
  cfg: NotifyConfig,
  payload: SendablePayload,
  nowIso: string,
): Promise<{ sent: boolean; reason?: string }> {
  const to = recipientsFor(event, post, cfg)
  if (to.length === 0) return { sent: false, reason: 'no-recipients' }
  const { subject, html } = renderEmail(event, post, cfg)
  await payload.sendEmail({ to, subject, html })
  await stampNotify(payload, post, STAMP_FIELD[event], nowIso)
  return { sent: true }
}

export async function stampNotify(
  payload: SendablePayload,
  post: NotifyPost,
  field: StampField,
  iso: string,
): Promise<void> {
  await payload.update({
    collection: 'social-posts',
    id: post.id,
    data: { notify: { ...(post.notify ?? {}), [field]: iso } },
    context: { skipNotify: true },
  })
}

export async function withBrand(payload: SendablePayload, post: NotifyPost): Promise<NotifyPost> {
  if (post.brand && typeof post.brand !== 'object') {
    const brand = (await payload.findByID({ collection: 'brand-profiles', id: post.brand, depth: 0 })) as NotifyPost['brand']
    return { ...post, brand }
  }
  return post
}
