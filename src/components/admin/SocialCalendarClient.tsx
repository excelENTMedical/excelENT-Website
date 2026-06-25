'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { canReschedule } from '@/app/api/social/reschedule/guard'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } })
const DnDCalendar = withDragAndDrop(Calendar as any)

const STATE_COLOR: Record<string, string> = {
  sent: '#1a7f37', publishing: '#9a6700', failed: '#b00020', scheduled: '#459fdc', pending: '#6e7781',
}
type Post = {
  id: number; title?: string; platform: string; status: string
  scheduledTime?: string; brand?: { name?: string } | number
  publish?: { state?: string }
}
interface Evt { id: number; title: string; start: Date; end: Date; resource: Post }

export default function SocialCalendarClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/social-posts?limit=500&depth=1&where[scheduledTime][exists]=true', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPosts(json.docs ?? [])
    } catch (err) {
      console.error('Failed to load social posts', err)
      alert('Failed to load calendar posts. Check your session and reload.')
    }
  }, [])
  useEffect(() => { void load() }, [load])

  const events: Evt[] = useMemo(() =>
    posts
      .filter((p) => p.scheduledTime)
      .filter((p) => brandFilter === 'all' || (typeof p.brand === 'object' && p.brand?.name === brandFilter))
      .filter((p) => platformFilter === 'all' || p.platform === platformFilter)
      .map((p) => {
        const start = new Date(p.scheduledTime as string)
        const brand = typeof p.brand === 'object' ? p.brand?.name : ''
        return { id: p.id, title: `${brand ? brand + ' · ' : ''}${p.platform} · ${p.title || '(untitled)'}`, start, end: new Date(start.getTime() + 30 * 60000), resource: p }
      }), [posts, brandFilter, platformFilter])

  const brands = useMemo(() => Array.from(new Set(posts.map((p) => (typeof p.brand === 'object' ? p.brand?.name : '')).filter(Boolean))) as string[], [posts])

  const onMove = useCallback(async ({ event, start }: any) => {
    const ev = event as Evt
    if (!canReschedule(ev.resource.publish?.state)) { alert('Cannot reschedule a post that is already publishing or published.'); return }
    const res = await fetch('/api/social/reschedule', {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId: ev.id, scheduledTime: new Date(start).toISOString() }),
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => 'unknown error')
      alert('Reschedule failed: ' + msg)
      return
    }
    await load()
  }, [load])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Social Content Calendar</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label>Brand:{' '}
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
            <option value="all">All</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label>Platform:{' '}
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>
      </div>
      <div style={{ height: 720, background: '#fff' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day', 'agenda']}
          onEventDrop={onMove}
          draggableAccessor={(e: any) => canReschedule((e as Evt).resource.publish?.state)}
          onSelectEvent={(e: any) => { window.location.href = `/admin/collections/social-posts/${(e as Evt).id}` }}
          eventPropGetter={(e: any) => {
            const st = (e as Evt).resource.publish?.state || 'pending'
            return { style: { backgroundColor: STATE_COLOR[st] ?? '#6e7781', border: 'none' } }
          }}
        />
      </div>
    </div>
  )
}
