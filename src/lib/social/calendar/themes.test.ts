// src/lib/social/calendar/themes.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { selectTheme, type CampaignForPlanning } from './themes'

const SLOT = '2026-07-06T13:00:00.000Z'

test('selectTheme: picks least-recently-used pool theme', () => {
  const out = selectTheme({
    slotIso: SLOT, platform: 'linkedin',
    poolThemes: ['Denials', 'Automation', 'Outcomes'],
    campaigns: [],
    usage: { denials: 100, automation: 50 }, // outcomes never used
  })
  assert.deepEqual(out, { theme: 'Outcomes', campaignId: undefined })
})

test('selectTheme: active campaign overrides the pool', () => {
  const c: CampaignForPlanning = { id: 7, startDate: '2026-07-01', endDate: '2026-07-31', platforms: [], priority: 0, themes: ['Launch week'] }
  const out = selectTheme({ slotIso: SLOT, platform: 'linkedin', poolThemes: ['Denials'], campaigns: [c], usage: {} })
  assert.deepEqual(out, { theme: 'Launch week', campaignId: 7 })
})

test('selectTheme: higher priority campaign wins on overlap', () => {
  const a: CampaignForPlanning = { id: 1, startDate: '2026-07-01', endDate: '2026-07-31', platforms: [], priority: 1, themes: ['A'] }
  const b: CampaignForPlanning = { id: 2, startDate: '2026-07-01', endDate: '2026-07-31', platforms: [], priority: 5, themes: ['B'] }
  const out = selectTheme({ slotIso: SLOT, platform: 'linkedin', poolThemes: [], campaigns: [a, b], usage: {} })
  assert.equal(out?.campaignId, 2)
})

test('selectTheme: campaign platform filter excludes non-matching platforms', () => {
  const c: CampaignForPlanning = { id: 3, startDate: '2026-07-01', endDate: '2026-07-31', platforms: ['facebook'], priority: 0, themes: ['FB only'] }
  const out = selectTheme({ slotIso: SLOT, platform: 'linkedin', poolThemes: ['Denials'], campaigns: [c], usage: {} })
  assert.deepEqual(out, { theme: 'Denials', campaignId: undefined })
})

test('selectTheme: returns null when no themes available', () => {
  assert.equal(selectTheme({ slotIso: SLOT, platform: 'linkedin', poolThemes: [], campaigns: [], usage: {} }), null)
})
