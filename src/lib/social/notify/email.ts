import type { NotifyConfig, NotifyEvent, NotifyPost } from './types'

const LABELS: Record<NotifyEvent, string> = {
  generated: 'New draft generated',
  review: 'Draft ready for review',
  reminder: 'Approval needed — 24h to go-live',
  published: 'Post published',
  missed: 'Missed — not approved in time, NOT published',
}

function brandName(post: NotifyPost): string {
  const b = post.brand
  return b && typeof b === 'object' ? (b.name ?? b.slug ?? 'Unknown brand') : 'Unknown brand'
}

function fmtEt(iso: string | null | undefined, tz: string): string {
  if (!iso) return 'unscheduled'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso))
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderEmail(event: NotifyEvent, post: NotifyPost, cfg: NotifyConfig): { subject: string; html: string } {
  const brand = brandName(post)
  const title = post.title || '(untitled)'
  const editUrl = `${cfg.serverUrl}/admin/collections/social-posts/${post.id}`
  const goLive = fmtEt(post.scheduledTime, cfg.tz)
  const flags = (post.generationMeta?.guardrailFlags ?? '').trim()
  const flagsBlock = flags
    ? `<p style="color:#b00"><strong>Guardrail flags:</strong> ${esc(flags)}</p>`
    : ''

  const subject = `[Social · ${brand}] ${LABELS[event]}: ${title}`
  const html = `
<h2>${esc(LABELS[event])}</h2>
<p><strong>Brand:</strong> ${esc(brand)} &middot; <strong>Platform:</strong> ${esc(post.platform)} &middot; <strong>Language:</strong> ${esc(post.language || 'en')}</p>
<p><strong>Go-live:</strong> ${esc(goLive)}</p>
${flagsBlock}
<hr />
<pre style="white-space:pre-wrap;font-family:inherit">${esc(post.copy)}</pre>
<hr />
<p><a href="${editUrl}">Review &amp; edit in admin</a></p>
`.trim()
  return { subject, html }
}
