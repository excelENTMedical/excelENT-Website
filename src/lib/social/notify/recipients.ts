import type { NotifyBrand, NotifyConfig, NotifyEvent, NotifyPost } from './types'

export function ownerEmails(brand: NotifyPost['brand']): string[] {
  if (!brand || typeof brand !== 'object') return []
  const reviewers = (brand as NotifyBrand).reviewers ?? []
  return reviewers.map((r) => (r.email ?? '').trim()).filter(Boolean)
}

export function recipientsFor(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): string[] {
  if (event === 'published') return cfg.teamEmails
  return ownerEmails(post.brand)
}
