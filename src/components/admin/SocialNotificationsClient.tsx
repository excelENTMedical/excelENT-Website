'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { bucketize, type BucketPost } from '@/lib/social/notify/buckets'

// Mirrors SOCIAL_REVIEW_LEAD_DAYS / SOCIAL_NOTIFY_HOUR_ET in .env.
const CFG = { leadDays: 2, hourEt: 9, tz: 'America/New_York' }

const RED = '#b00020'
const AMBER = '#9a6700'
const GREEN = '#1a7f37'
const MUTED = '#6e7781'

type Reviewer = { email?: string | null }
type Brand = { name?: string; reviewers?: Reviewer[] }
type Post = BucketPost & {
  id: number
  title?: string
  platform?: string
  brand?: Brand | number | null
  notify?: {
    reviewSentAt?: string | null
    reminderSentAt?: string | null
  }
}

function fmtEt(iso?: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso))
}

function ago(iso?: string | null): string {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return 'soon'
  const d = Math.floor(ms / 86_400_000)
  if (d > 0) return `${d}d ago`
  const h = Math.floor(ms / 3_600_000)
  if (h > 0) return `${h}h ago`
  return 'just now'
}

function reviewersOf(brand?: Brand | number | null): string {
  if (!brand || typeof brand !== 'object') return '—'
  const emails = (brand.reviewers ?? []).map((r) => r.email).filter(Boolean) as string[]
  return emails.length ? emails.join(', ') : '—'
}

function brandName(brand?: Brand | number | null): string {
  return brand && typeof brand === 'object' ? brand.name ?? '—' : '—'
}

function Row({ post, note }: { post: Post; note: string }) {
  return (
    <a
      href={`/admin/collections/social-posts/${post.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1.6fr 1fr',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        borderTop: '1px solid #e1e4e8',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span>
        <strong>{brandName(post.brand)}</strong>
        {post.platform ? ` · ${post.platform}` : ''}
        <br />
        <span style={{ color: MUTED }}>{post.title || '(untitled)'}</span>
      </span>
      <span>
        Go-live: {fmtEt(post.scheduledTime)}
        <br />
        <span style={{ color: MUTED }}>Reviewers: {reviewersOf(post.brand)}</span>
      </span>
      <span style={{ textAlign: 'right' }}>
        <span style={{ textTransform: 'capitalize' }}>{post.status}</span>
        <br />
        <span style={{ color: MUTED }}>{note}</span>
      </span>
    </a>
  )
}

function Section({
  title, color, posts, note,
}: {
  title: string; color: string; posts: Post[]; note: (p: Post) => string
}) {
  if (posts.length === 0) return null
  return (
    <section style={{ marginBottom: '1.5rem', border: `1px solid ${color}`, borderRadius: 6 }}>
      <h2 style={{ margin: 0, padding: '0.5rem 0.75rem', background: color, color: '#fff', fontSize: '1rem' }}>
        {title} ({posts.length})
      </h2>
      <div>{posts.map((p) => <Row key={p.id} post={p} note={note(p)} />)}</div>
    </section>
  )
}

export default function SocialNotificationsClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        '/api/social-posts?limit=500&depth=1&where[scheduledTime][exists]=true',
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPosts(json.docs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const b = useMemo(() => bucketize(posts, new Date(), CFG), [posts])
  const total = b.missed.length + b.overdue.length + b.reviewOverdue.length + b.awaiting.length

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Notifications</h1>
        <button type="button" onClick={() => void load()} style={{ cursor: 'pointer' }}>Refresh</button>
      </div>

      {!loading && !error && (
        <p style={{ color: MUTED, marginTop: 0 }}>
          {b.awaiting.length} awaiting · {b.overdue.length} overdue · {b.missed.length} missed · {b.reviewOverdue.length} review-late
        </p>
      )}

      {loading && <p>Loading…</p>}

      {error && (
        <p style={{ color: RED }}>
          Failed to load: {error}{' '}
          <button type="button" onClick={() => void load()} style={{ cursor: 'pointer' }}>Retry</button>
        </p>
      )}

      {!loading && !error && total === 0 && (
        <p style={{ color: GREEN, fontSize: '1.1rem' }}>✓ Nothing needs attention.</p>
      )}

      {!loading && !error && (
        <>
          <Section title="Past go-live, unapproved" color={RED} posts={b.missed}
            note={(p) => `was due ${fmtEt(p.scheduledTime)}`} />
          <Section title="Approval overdue (<24h)" color={RED} posts={b.overdue}
            note={(p) => (p.notify?.reminderSentAt ? `reminder sent ${ago(p.notify.reminderSentAt)}` : 'reminder not yet sent')} />
          <Section title="Review email overdue" color={AMBER} posts={b.reviewOverdue}
            note={() => 'review never sent'} />
          <Section title="Awaiting approval" color={MUTED} posts={b.awaiting}
            note={(p) => `review sent ${ago(p.notify?.reviewSentAt)}`} />
        </>
      )}
    </div>
  )
}
