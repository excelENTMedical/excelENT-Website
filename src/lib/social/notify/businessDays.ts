const MS_DAY = 86_400_000

interface YMD {
  y: number
  m: number
  d: number
}

function partsIn(date: Date, tz: string, withTime: boolean): Record<string, number> {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {}),
  })
  const out: Record<string, number> = {}
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  if (out.hour === 24) out.hour = 0 // some engines emit "24" at midnight
  return out
}

export function zonedYMD(date: Date, tz: string): YMD {
  const p = partsIn(date, tz, false)
  return { y: p.year, m: p.month, d: p.day }
}

// ms to add to `date.getTime()` so the result equals the same wall clock read as UTC.
function tzOffsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz, true)
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUTC - date.getTime()
}

export function zonedToUtc(y: number, m: number, d: number, hour: number, minute: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, hour, minute)
  const offset = tzOffsetMs(new Date(guess), tz)
  return new Date(guess - offset)
}

export function businessDaysBefore(scheduled: Date, n: number, tz: string): YMD {
  const { y, m, d } = zonedYMD(scheduled, tz)
  let cur = Date.UTC(y, m - 1, d)
  let counted = 0
  while (counted < n) {
    cur -= MS_DAY
    const dow = new Date(cur).getUTCDay() // 0=Sun .. 6=Sat
    if (dow !== 0 && dow !== 6) counted++
  }
  const dt = new Date(cur)
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
}

export function reviewSendAt(scheduledTime: string, leadDays: number, hourEt: number, tz: string): Date {
  const { y, m, d } = businessDaysBefore(new Date(scheduledTime), leadDays, tz)
  return zonedToUtc(y, m, d, hourEt, 0, tz)
}
