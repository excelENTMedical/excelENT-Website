// src/lib/social/calendar/themes.ts
import type { Platform } from '../types'

export interface CampaignForPlanning {
  id: number
  startDate: string
  endDate: string
  platforms?: string[] | null
  priority?: number | null
  themes: string[]
}

export interface ThemeChoice {
  theme: string
  campaignId?: number
}

function leastRecentlyUsed(themes: string[], usage: Record<string, number>): string {
  let best = themes[0]
  let bestT = usage[themes[0].toLowerCase()] ?? -1
  for (const th of themes) {
    const u = usage[th.toLowerCase()] ?? -1
    if (u < bestT) {
      best = th
      bestT = u
    }
  }
  return best
}

export function selectTheme(args: {
  slotIso: string
  platform: Platform
  poolThemes: string[]
  campaigns: CampaignForPlanning[]
  usage: Record<string, number>
}): ThemeChoice | null {
  const t = new Date(args.slotIso).getTime()
  const active = args.campaigns
    .filter(
      (c) =>
        c.themes.length > 0 &&
        t >= new Date(c.startDate).getTime() &&
        t <= new Date(c.endDate).getTime() + 86_399_999 && // inclusive end-of-day
        (!c.platforms || c.platforms.length === 0 || c.platforms.includes(args.platform)),
    )
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]

  const themes = active ? active.themes : args.poolThemes
  if (!themes.length) return null
  return { theme: leastRecentlyUsed(themes, args.usage), campaignId: active?.id }
}
