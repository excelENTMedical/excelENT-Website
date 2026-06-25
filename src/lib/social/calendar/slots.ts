// src/lib/social/calendar/slots.ts
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import type { Platform } from '../types'

const TZ = 'America/New_York'
const DAY_MS = 86_400_000

export interface PostingSlotRule {
  platform: Platform
  dayOfWeek: number // 0=Sun .. 6=Sat, in ET
  time: string // 'HH:mm' ET wall time
}

export interface PlannedSlot {
  platform: Platform
  scheduledTime: string // ISO UTC
}

function addDaysYmd(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}

function weekdayOfYmd(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function materializeSlots(rules: PostingSlotRule[], fromIso: string, toIso: string): PlannedSlot[] {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()
  if (!rules.length || !(from <= to)) return []
  const startYmd = formatInTimeZone(new Date(fromIso), TZ, 'yyyy-MM-dd')
  const days = Math.ceil((to - from) / DAY_MS) + 1
  const out: PlannedSlot[] = []
  for (let i = 0; i <= days; i++) {
    const ymd = addDaysYmd(startYmd, i)
    const wd = weekdayOfYmd(ymd)
    for (const r of rules) {
      if (r.dayOfWeek !== wd) continue
      const iso = fromZonedTime(`${ymd} ${r.time}`, TZ).toISOString()
      const t = new Date(iso).getTime()
      if (t >= from && t <= to) out.push({ platform: r.platform, scheduledTime: iso })
    }
  }
  return out.sort((a, b) => (a.scheduledTime < b.scheduledTime ? -1 : a.scheduledTime > b.scheduledTime ? 1 : 0))
}
