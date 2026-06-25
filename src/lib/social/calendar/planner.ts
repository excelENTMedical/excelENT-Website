// src/lib/social/calendar/planner.ts
import { generateDrafts as defaultGenerateDrafts } from '../generate'
import { materializeSlots, type PostingSlotRule } from './slots'
import { selectTheme, type CampaignForPlanning } from './themes'
import type { Platform } from '../types'

const HORIZON_DAYS = 14
const PUBLISHABLE_PLATFORMS = new Set<Platform>(['linkedin'])

interface PlannerPayload {
  find: (a: any) => Promise<{ docs: any[] }>
  update: (a: any) => Promise<any>
  logger?: { info?: (...a: any[]) => void; error?: (...a: any[]) => void }
}

export interface PlannerDeps {
  payload: PlannerPayload
  generateDraftsImpl?: typeof defaultGenerateDrafts
  now?: () => number
  horizonDays?: number
}

export function slotKey(platform: string, iso: string): string {
  return `${platform}@${new Date(iso).toISOString()}`
}

function toRules(brand: any): PostingSlotRule[] {
  return (brand.postingSlots || [])
    .map((s: any) => ({ platform: s.platform as Platform, dayOfWeek: Number(s.dayOfWeek), time: String(s.time) }))
    .filter((r: PostingSlotRule) => PUBLISHABLE_PLATFORMS.has(r.platform) && r.time && Number.isInteger(r.dayOfWeek))
}

function buildUsage(existing: any[]): Record<string, number> {
  const usage: Record<string, number> = {}
  for (const p of existing) {
    if (!p.theme || !p.scheduledTime) continue
    const k = String(p.theme).toLowerCase()
    const t = new Date(p.scheduledTime).getTime()
    if (!(k in usage) || t > usage[k]) usage[k] = t
  }
  return usage
}

async function loadCampaigns(payload: PlannerPayload, brandId: number, fromIso: string, toIso: string): Promise<CampaignForPlanning[]> {
  const res = await payload.find({
    collection: 'social-campaigns',
    where: { and: [{ brand: { equals: brandId } }, { startDate: { less_than_equal: toIso } }, { endDate: { greater_than_equal: fromIso } }] },
    depth: 0,
    limit: 100,
  })
  return res.docs.map((c: any) => ({
    id: Number(c.id),
    startDate: c.startDate,
    endDate: c.endDate,
    platforms: c.platforms ?? [],
    priority: c.priority ?? 0,
    themes: (c.themes || []).map((t: any) => t.theme).filter(Boolean),
  }))
}

export async function runPlanner(deps: PlannerDeps): Promise<number> {
  const now = deps.now?.() ?? Date.now()
  const gen = deps.generateDraftsImpl ?? defaultGenerateDrafts
  const horizon = deps.horizonDays ?? HORIZON_DAYS
  const fromIso = new Date(now).toISOString()
  const toIso = new Date(now + horizon * 86_400_000).toISOString()

  const brands = await deps.payload.find({ collection: 'brand-profiles', where: { active: { equals: true } }, depth: 0, limit: 100 })
  let created = 0

  for (const brand of brands.docs) {
    const rules = toRules(brand)
    if (!rules.length) continue
    const slots = materializeSlots(rules, fromIso, toIso)
    if (!slots.length) continue

    const existingRes = await deps.payload.find({
      collection: 'social-posts',
      where: { and: [{ brand: { equals: brand.id } }, { scheduledTime: { greater_than_equal: fromIso } }, { scheduledTime: { less_than_equal: toIso } }] },
      depth: 0,
      limit: 500,
    })
    const existing = existingRes.docs
    const filled = new Set(existing.filter((p: any) => p.scheduledTime).map((p: any) => slotKey(p.platform, p.scheduledTime)))
    const usage = buildUsage(existing)
    const poolThemes = (brand.themes || []).map((t: any) => t.theme).filter(Boolean)
    const campaigns = await loadCampaigns(deps.payload, Number(brand.id), fromIso, toIso)

    for (const slot of slots) {
      const key = slotKey(slot.platform, slot.scheduledTime)
      if (filled.has(key)) continue
      const choice = selectTheme({ slotIso: slot.scheduledTime, platform: slot.platform, poolThemes, campaigns, usage })
      if (!choice) continue
      try {
        const ids = await gen(String(brand.id), { theme: choice.theme, platform: slot.platform, language: 'en', count: 1 }, { skipNotify: true })
        const id = ids[0]
        if (!id) continue
        await deps.payload.update({
          collection: 'social-posts',
          id,
          context: { skipNotify: true },
          data: { scheduledTime: slot.scheduledTime, slotSource: 'auto', campaign: choice.campaignId ?? null },
        })
        filled.add(key)
        usage[choice.theme.toLowerCase()] = new Date(slot.scheduledTime).getTime()
        created++
      } catch (err) {
        deps.payload.logger?.error?.({ err }, `planner: failed to fill ${key} for brand ${brand.id}`)
      }
    }
  }
  return created
}
