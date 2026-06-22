import type { Where } from 'payload'

export const MAX_ATTEMPTS = 3
const CLAIMABLE_STATES = ['pending', 'scheduled', 'failed']

export function dueWhere(nowIso: string): Where {
  return {
    and: [
      { status: { equals: 'approved' } },
      { scheduledTime: { less_than_equal: nowIso } },
      { 'publish.state': { in: CLAIMABLE_STATES } },
      { 'publish.attempts': { less_than: MAX_ATTEMPTS } },
    ],
  }
}

export function isClaimable(post: { publish?: { state?: string; attempts?: number } }): boolean {
  const state = post.publish?.state ?? 'pending'
  const attempts = post.publish?.attempts ?? 0
  return CLAIMABLE_STATES.includes(state) && attempts < MAX_ATTEMPTS
}
