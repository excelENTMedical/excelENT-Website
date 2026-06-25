// src/lib/social/calendar/planner.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runPlanner, slotKey } from './planner'

function fakePayload(opts: { brands: any[]; existing?: any[]; campaigns?: any[] }) {
  const created: any[] = []
  const updated: any[] = []
  return {
    created,
    updated,
    async find({ collection, where }: any) {
      if (collection === 'brand-profiles') return { docs: opts.brands }
      if (collection === 'social-campaigns') return { docs: opts.campaigns ?? [] }
      if (collection === 'social-posts') return { docs: opts.existing ?? [] }
      return { docs: [] }
    },
    async update(args: any) {
      updated.push(args)
    },
  }
}

const BRAND = {
  id: 1,
  active: true,
  themes: [{ theme: 'Denials' }, { theme: 'Automation' }],
  postingSlots: [{ platform: 'linkedin', dayOfWeek: 1, time: '09:00' }],
}

test('slotKey is stable across equivalent ISO forms', () => {
  assert.equal(slotKey('linkedin', '2026-07-06T13:00:00Z'), slotKey('linkedin', '2026-07-06T13:00:00.000Z'))
})

test('runPlanner generates one draft per empty slot and stamps scheduling fields', async () => {
  const payload = fakePayload({ brands: [BRAND] })
  const genCalls: any[] = []
  const generateDraftsImpl = async (brandId: string, o: any, ctx: any) => {
    genCalls.push({ brandId, o, ctx })
    return [`id-${genCalls.length}`]
  }
  const count = await runPlanner({
    payload: payload as any,
    generateDraftsImpl: generateDraftsImpl as any,
    now: () => Date.parse('2026-07-05T00:00:00.000Z'),
    horizonDays: 14,
  })
  assert.equal(count, 2) // two Mondays in the 14-day window
  assert.equal(genCalls[0].ctx.skipNotify, true)
  assert.equal(payload.updated[0].data.slotSource, 'auto')
  assert.ok(payload.updated[0].data.scheduledTime)
})

test('runPlanner skips slots already filled (idempotent)', async () => {
  const existing = [{ id: 99, platform: 'linkedin', scheduledTime: '2026-07-06T13:00:00.000Z', theme: 'Denials' }]
  const payload = fakePayload({ brands: [BRAND], existing })
  let calls = 0
  const count = await runPlanner({
    payload: payload as any,
    generateDraftsImpl: (async () => { calls++; return [`x${calls}`] }) as any,
    now: () => Date.parse('2026-07-05T00:00:00.000Z'),
    horizonDays: 14,
  })
  assert.equal(count, 1) // only the second Monday remains
})

test('runPlanner skips non-publishable platforms in v1', async () => {
  const fbBrand = { ...BRAND, id: 2, postingSlots: [{ platform: 'facebook', dayOfWeek: 1, time: '09:00' }] }
  const payload = fakePayload({ brands: [fbBrand] })
  const count = await runPlanner({
    payload: payload as any,
    generateDraftsImpl: (async () => ['z']) as any,
    now: () => Date.parse('2026-07-05T00:00:00.000Z'),
  })
  assert.equal(count, 0)
})
