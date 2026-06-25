# Social Content Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn each brand's editorial strategy (theme pool + campaigns + machine-readable cadence) into auto-generated, human-approved, scheduled LinkedIn posts, managed in an interactive admin calendar.

**Architecture:** Add structured cadence + a `SocialCampaigns` collection on top of the existing generate→approve→publish pipeline. A pure planner (`materializeSlots` + `selectTheme` + `runPlanner`) fills empty slots across a rolling 14-day window by calling the existing `generateDrafts` engine and stamping `scheduledTime`. A new hourly loop in the running `social-scheduler` pm2 worker drives it. A custom Payload admin view (react-big-calendar) visualizes and reschedules posts. Unapproved due slots are never published (the existing `dueWhere` only matches `approved`); a new "missed" alert emails owners.

**Tech Stack:** Next.js 15, Payload CMS 3.75, PostgreSQL 15, React 19, `node:test` + `tsx`, react-big-calendar + date-fns + date-fns-tz, pm2.

## Global Constraints

- **Payload 3 CLI codegen is broken in this env** — never run `generate:types`/`generate:importmap`. Hand-patch `src/payload-types.ts` (main interface + `*Select` interface) and hand-edit `src/app/(payload)/admin/importMap.js` for every new collection / admin component.
- **`push:true` does NOT create tables in production** — sync schema via `scripts/schema-preview.mts` (derives DDL, applies nothing) → filter out the 7 known pre-existing drift statements (faqs/users/testimonials/`demo_requests SET NOT NULL`) → apply only the new additive DDL inside a `BEGIN/COMMIT` txn with `psql -v ON_ERROR_STOP=1`.
- **Leave uncommitted** (they carry unrelated `b2b-rebuild` edits — the user commits them): `src/payload.config.ts`, `src/payload-types.ts`, `package.json`, `src/app/(payload)/admin/importMap.js`. Commit all other new/changed files normally.
- **Auto-publish is LinkedIn-only in v1** — the planner fills slots only for platforms with a live `Publisher`. `const PUBLISHABLE_PLATFORMS = new Set(['linkedin'])`.
- **Never auto-publish unapproved content.** The planner only creates `status: 'draft'` rows; publishing stays gated on human approval.
- **Tests:** `node:test`, files named `*.test.ts` beside the source, run via `npm test` (`node --import tsx --test "src/**/*.test.ts"`).
- **Money/`!` in shell:** quote DB passwords with single quotes; the DB password has no special chars.
- Branch: `feat/social-agent-phase-a`. Model env: `SOCIAL_MODEL` (default `claude-sonnet-4-6`).

---

### Task 1: `SocialCampaigns` collection

**Files:**
- Create: `src/collections/SocialCampaigns.ts`
- Modify: `src/payload.config.ts` (import + register) — *uncommitted*
- Modify: `src/payload-types.ts` (hand-patch) — *uncommitted*

**Interfaces:**
- Produces: collection slug `social-campaigns` with fields `name` (text), `brand` (relationship→`brand-profiles`), `startDate` (date), `endDate` (date), `platforms` (select hasMany, same options as posts), `priority` (number), `themes` (array of `{ theme: text, description: textarea }`).

- [ ] **Step 1: Create the collection**

```ts
// src/collections/SocialCampaigns.ts
import type { CollectionConfig } from 'payload'

export const SocialCampaigns: CollectionConfig = {
  slug: 'social-campaigns',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'startDate', 'endDate', 'priority'],
    description: 'Time-boxed campaigns. While active, the planner draws themes from here instead of the brand pool.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'brand', type: 'relationship', relationTo: 'brand-profiles', required: true },
    { name: 'startDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'endDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'platforms',
      type: 'select',
      hasMany: true,
      admin: { description: 'Empty = applies to all of the brand’s platforms.' },
      options: [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
      ],
    },
    { name: 'priority', type: 'number', defaultValue: 0, admin: { description: 'Higher wins when campaign windows overlap.' } },
    {
      name: 'themes',
      type: 'array',
      labels: { singular: 'Theme', plural: 'Themes' },
      fields: [
        { name: 'theme', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Register in payload.config.ts**

Add the import beside the other Social collections (after line 20):
```ts
import { SocialCampaigns } from './collections/SocialCampaigns'
```
Add to the `collections` array (after `SocialPosts,`):
```ts
    SocialPosts,
    SocialCampaigns,
```

- [ ] **Step 3: Hand-patch payload-types.ts — Config maps**

In `interface Config` `collections` map (near line 79-81) add:
```ts
    'social-campaigns': SocialCampaign;
```
In `collectionsSelect` map (near line 98-100) add:
```ts
    'social-campaigns': SocialCampaignsSelect<false> | SocialCampaignsSelect<true>;
```

- [ ] **Step 4: Hand-patch payload-types.ts — interfaces**

Add a main interface (place it next to `SocialPost`, ~line 648):
```ts
export interface SocialCampaign {
  id: number;
  name: string;
  brand: number | BrandProfile;
  startDate: string;
  endDate: string;
  platforms?: ('linkedin' | 'facebook' | 'instagram')[] | null;
  priority?: number | null;
  themes?: { theme: string; description?: string | null; id?: string | null }[] | null;
  updatedAt: string;
  createdAt: string;
}
```
Add the select interface (next to `SocialPostsSelect`, ~line 1214):
```ts
export interface SocialCampaignsSelect<T extends boolean = true> {
  name?: T;
  brand?: T;
  startDate?: T;
  endDate?: T;
  platforms?: T;
  priority?: T;
  themes?: T | { theme?: T; description?: T; id?: T };
  updatedAt?: T;
  createdAt?: T;
}
```

- [ ] **Step 5: Sync the schema (creates `social_campaigns` + `social_campaigns_themes` tables)**

Run the established flow:
```bash
cd /home/bitnami/stack/excelent-site
node --import tsx scripts/schema-preview.mts > /tmp/schema.sql 2>&1
```
Open `/tmp/schema.sql`. Copy ONLY the `CREATE TABLE ... social_campaigns`, `CREATE TABLE ... social_campaigns_themes`, their indexes/FKs, and any `social-campaigns` enum into `/tmp/apply.sql`. Do NOT include the 7 pre-existing drift statements (faqs/users/testimonials/`demo_requests ... SET NOT NULL`). Then:
```bash
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -1 -f /tmp/apply.sql
```
Expected: `BEGIN` … `COMMIT`, no errors.

- [ ] **Step 6: Verify tables exist**

```bash
psql "$DATABASE_URI" -c "\dt social_campaigns*"
```
Expected: `social_campaigns` and `social_campaigns_themes` listed.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors referencing `SocialCampaign`).

- [ ] **Step 8: Commit**

```bash
git add src/collections/SocialCampaigns.ts
git commit -m "feat(social): SocialCampaigns collection"
```
(Leave payload.config.ts / payload-types.ts uncommitted per Global Constraints.)

---

### Task 2: Structured cadence + post scheduling fields

**Files:**
- Modify: `src/collections/BrandProfiles.ts` (add `postingSlots`)
- Modify: `src/collections/SocialPosts.ts` (add `slotSource`, `campaign`)
- Modify: `src/payload-types.ts` (hand-patch) — *uncommitted*

**Interfaces:**
- Produces: `BrandProfile.postingSlots: { platform; dayOfWeek; time }[]`; `SocialPost.slotSource: 'manual' | 'auto'`; `SocialPost.campaign: number | SocialCampaign | null`.

- [ ] **Step 1: Add `postingSlots` to BrandProfiles**

In `src/collections/BrandProfiles.ts`, immediately after the existing `cadence` field (line ~73) insert:
```ts
    {
      name: 'postingSlots',
      type: 'array',
      labels: { singular: 'Posting slot', plural: 'Posting slots' },
      admin: { description: 'Machine-readable cadence. Each row = one recurring weekly slot the planner fills. (Supersedes the free-text "cadence" field above.)' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          defaultValue: 'linkedin',
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
          ],
        },
        {
          name: 'dayOfWeek',
          type: 'select',
          required: true,
          admin: { description: 'Day of week (Eastern Time).' },
          options: [
            { label: 'Sunday', value: '0' },
            { label: 'Monday', value: '1' },
            { label: 'Tuesday', value: '2' },
            { label: 'Wednesday', value: '3' },
            { label: 'Thursday', value: '4' },
            { label: 'Friday', value: '5' },
            { label: 'Saturday', value: '6' },
          ],
        },
        { name: 'time', type: 'text', required: true, defaultValue: '09:00', admin: { description: 'Time of day in ET, 24h "HH:mm" (e.g. 09:00, 14:30).' } },
      ],
    },
```

- [ ] **Step 2: Add `slotSource` + `campaign` to SocialPosts**

In `src/collections/SocialPosts.ts`, immediately after the `scheduledTime` field (closes at line ~113) insert:
```ts
    {
      name: 'slotSource',
      type: 'select',
      defaultValue: 'manual',
      admin: { position: 'sidebar', readOnly: true, description: 'How this post reached the calendar.' },
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Auto-filled', value: 'auto' },
      ],
    },
    { name: 'campaign', type: 'relationship', relationTo: 'social-campaigns', admin: { position: 'sidebar', description: 'Set when the slot fell inside a campaign window.' } },
```

- [ ] **Step 3: Hand-patch payload-types.ts**

In `interface BrandProfile` (~line 506) add (next to the existing `cadence?` field):
```ts
  postingSlots?: {
    platform: 'linkedin' | 'facebook' | 'instagram';
    dayOfWeek: '0' | '1' | '2' | '3' | '4' | '5' | '6';
    time: string;
    id?: string | null;
  }[] | null;
```
In `interface SocialPost` (~line 648, near `scheduledTime`) add:
```ts
  slotSource?: ('manual' | 'auto') | null;
  campaign?: (number | null) | SocialCampaign;
```
In `BrandProfilesSelect` add `postingSlots?: T | { platform?: T; dayOfWeek?: T; time?: T; id?: T };` and in `SocialPostsSelect` add `slotSource?: T;` and `campaign?: T;`.

- [ ] **Step 4: Sync schema (additive columns + `brand_profiles_posting_slots` table)**

```bash
node --import tsx scripts/schema-preview.mts > /tmp/schema2.sql 2>&1
```
Into `/tmp/apply2.sql` copy ONLY: `CREATE TABLE ... brand_profiles_posting_slots` (+ its enum/index/FK), `ALTER TABLE social_posts ADD COLUMN slot_source ...` (+ enum), `ALTER TABLE social_posts ADD COLUMN campaign_id ...` (+ FK/index). Exclude the 7 known drift statements. Apply:
```bash
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -1 -f /tmp/apply2.sql
```
Expected: `BEGIN`…`COMMIT`.

- [ ] **Step 5: Verify**

```bash
psql "$DATABASE_URI" -c "\d social_posts" | grep -E "slot_source|campaign_id"
psql "$DATABASE_URI" -c "\dt brand_profiles_posting_slots"
```
Expected: both columns present; the slots table listed.

- [ ] **Step 6: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/collections/BrandProfiles.ts src/collections/SocialPosts.ts
git commit -m "feat(social): structured posting slots + post scheduling provenance"
```

---

### Task 3: `materializeSlots` — cadence → concrete datetimes (DST-correct)

**Files:**
- Create: `src/lib/social/calendar/slots.ts`
- Test: `src/lib/social/calendar/slots.test.ts`
- Modify: `package.json` (add `date-fns`, `date-fns-tz`) — *uncommitted*

**Interfaces:**
- Produces: `PostingSlotRule { platform: Platform; dayOfWeek: number; time: string }`, `PlannedSlot { platform: Platform; scheduledTime: string }`, `materializeSlots(rules: PostingSlotRule[], fromIso: string, toIso: string): PlannedSlot[]`.
- Consumes: `Platform` from `src/lib/social/types.ts`.

- [ ] **Step 1: Install date libs**

```bash
cd /home/bitnami/stack/excelent-site
npm i --no-save --legacy-peer-deps date-fns@^3 date-fns-tz@^3 && npm i --legacy-peer-deps date-fns@^3 date-fns-tz@^3
```
Expected: added to `package.json` dependencies. (Leave package.json uncommitted.)

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/social/calendar/slots.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { materializeSlots } from './slots'

test('materializeSlots: one weekly Monday 09:00 ET slot lands at 13:00 UTC in summer (EDT)', () => {
  // 2026-07-06 is a Monday. Window covers that week.
  const out = materializeSlots(
    [{ platform: 'linkedin', dayOfWeek: 1, time: '09:00' }],
    '2026-07-05T00:00:00.000Z',
    '2026-07-08T00:00:00.000Z',
  )
  assert.equal(out.length, 1)
  assert.equal(out[0].platform, 'linkedin')
  assert.equal(out[0].scheduledTime, '2026-07-06T13:00:00.000Z') // EDT = UTC-4
})

test('materializeSlots: same wall-time is UTC-5 in winter (EST)', () => {
  // 2026-01-05 is a Monday.
  const out = materializeSlots(
    [{ platform: 'linkedin', dayOfWeek: 1, time: '09:00' }],
    '2026-01-04T00:00:00.000Z',
    '2026-01-07T00:00:00.000Z',
  )
  assert.equal(out[0].scheduledTime, '2026-01-05T14:00:00.000Z') // EST = UTC-5
})

test('materializeSlots: multiple rules over 2 weeks, sorted ascending', () => {
  const out = materializeSlots(
    [
      { platform: 'linkedin', dayOfWeek: 1, time: '09:00' },
      { platform: 'linkedin', dayOfWeek: 3, time: '12:00' },
    ],
    '2026-07-05T00:00:00.000Z',
    '2026-07-19T00:00:00.000Z',
  )
  assert.equal(out.length, 4) // 2 Mondays + 2 Wednesdays
  for (let i = 1; i < out.length; i++) assert.ok(out[i - 1].scheduledTime <= out[i].scheduledTime)
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --test-name-pattern=materializeSlots`
Expected: FAIL with "Cannot find module './slots'".

- [ ] **Step 4: Implement**

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --test-name-pattern=materializeSlots`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/calendar/slots.ts src/lib/social/calendar/slots.test.ts
git commit -m "feat(social): materializeSlots cadence-to-datetime (DST-aware)"
```

---

### Task 4: `selectTheme` — campaign overlay + LRU rotation

**Files:**
- Create: `src/lib/social/calendar/themes.ts`
- Test: `src/lib/social/calendar/themes.test.ts`

**Interfaces:**
- Produces: `CampaignForPlanning { id: number; startDate: string; endDate: string; platforms?: string[] | null; priority?: number | null; themes: string[] }`, `ThemeChoice { theme: string; campaignId?: number }`, `selectTheme(args: { slotIso: string; platform: Platform; poolThemes: string[]; campaigns: CampaignForPlanning[]; usage: Record<string, number> }): ThemeChoice | null`.
- `usage` maps `theme.toLowerCase()` → last-used epoch ms (absent/-1 = never used).

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern=selectTheme`
Expected: FAIL with "Cannot find module './themes'".

- [ ] **Step 3: Implement**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern=selectTheme`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/calendar/themes.ts src/lib/social/calendar/themes.test.ts
git commit -m "feat(social): selectTheme campaign overlay + LRU rotation"
```

---

### Task 5: `runPlanner` — fill empty slots via the generate engine

**Files:**
- Create: `src/lib/social/calendar/planner.ts`
- Test: `src/lib/social/calendar/planner.test.ts`
- Modify: `src/lib/social/generate.ts` (add optional `createContext` param + injectable `deps`)
- Test: `src/lib/social/generate.test.ts` (add a REAL context-passthrough test)

**Interfaces:**
- Consumes: `materializeSlots` (Task 3), `selectTheme`/`CampaignForPlanning` (Task 4), `generateDrafts` (modified here).
- Produces: `slotKey(platform: string, iso: string): string`, `runPlanner(deps: PlannerDeps): Promise<number>` (returns count of drafts created), `PlannerDeps`.
- `generateDrafts(brandId, opts, createContext?, deps?)` — `createContext` is passed to `payload.create({ context })`; the planner passes `{ skipNotify: true }` so 14-day batches don't email a "generated" notice per draft. `deps` makes the function unit-testable: `{ payload?, callClaudeImpl? }` default to the real `getPayloadClient()` / `callClaude`.

- [ ] **Step 1: Make generate.ts accept a create context + injectable deps**

In `src/lib/social/generate.ts`, change the signature:
```ts
export interface GenerateDraftsDeps {
  payload?: Awaited<ReturnType<typeof getPayloadClient>>
  callClaudeImpl?: typeof callClaude
}

export async function generateDrafts(
  brandId: string,
  opts: GenerateOptions,
  createContext?: Record<string, unknown>,
  deps?: GenerateDraftsDeps,
): Promise<string[]> {
```
Replace the first two lines of the body so the client and the Claude call are injectable:
```ts
  const payload = deps?.payload ?? (await getPayloadClient())
  const callClaudeImpl = deps?.callClaudeImpl ?? callClaude
```
Change the model call from `await callClaude(system, user)` to `await callClaudeImpl(system, user)`.
In the `payload.create({ collection: 'social-posts', ... })` call (line ~128), add `context` as a sibling of `data`:
```ts
    const doc = await payload.create({
      collection: 'social-posts',
      context: createContext,
      data: {
        // ...unchanged...
      },
    })
```

- [ ] **Step 2: Write a REAL context-passthrough test**

Add to `src/lib/social/generate.test.ts` (follow the existing import style in that file — it is an ESM `node:test` module; do NOT use `require`):
```ts
test('generateDrafts passes createContext to payload.create and honors injected deps', async () => {
  const createCalls: any[] = []
  const fakePayload = {
    findByID: async () => ({
      id: 1, name: 'Brand', voice: 'v', audience: 'a',
      themes: [], defaultCtas: [], bannedTerms: [], requiredDisclaimers: [], seedExamples: [],
    }),
    find: async () => ({ docs: [] }),
    create: async (args: any) => { createCalls.push(args); return { id: 42 } },
  }
  const fakeClaude = async () => ({ text: '[{"copy":"Hello world","graphicStyle":"hook","graphic":{}}]' })

  const ids = await generateDrafts(
    '1',
    { theme: 'T', platform: 'linkedin', language: 'en', count: 1 },
    { skipNotify: true },
    { payload: fakePayload as any, callClaudeImpl: fakeClaude as any },
  )

  assert.deepEqual(ids, ['42'])
  assert.equal(createCalls.length, 1)
  assert.equal(createCalls[0].collection, 'social-posts')
  assert.equal(createCalls[0].context.skipNotify, true)
})
```
This drives the real `generateDrafts` end-to-end with no network/DB, asserting the new `context` actually reaches `payload.create`. (Ensure `generateDrafts` is imported at the top of the test file.)

- [ ] **Step 3: Write the failing planner test**

```ts
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="runPlanner|slotKey"`
Expected: FAIL with "Cannot find module './planner'".

- [ ] **Step 5: Implement planner.ts**

```ts
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern="runPlanner|slotKey|generateDrafts signature"`
Expected: PASS.

- [ ] **Step 7: Full suite + commit**

```bash
npm test
git add src/lib/social/calendar/planner.ts src/lib/social/calendar/planner.test.ts src/lib/social/generate.ts src/lib/social/generate.test.ts
git commit -m "feat(social): runPlanner fills empty calendar slots via generate engine"
```

---

### Task 6: "Missed" alert for unapproved slots that pass their go-live time

**Files:**
- Modify: `src/lib/social/notify/types.ts` (add `missed` event + `missedAlertSentAt`)
- Modify: `src/lib/social/notify/email.ts` (LABELS entry)
- Modify: `src/lib/social/notify/send.ts` (STAMP_FIELD entry)
- Modify: `src/lib/social/notify/recipients.ts` (route to owners)
- Modify: `src/lib/social/notify/due.ts` (add `missedDue`)
- Test: `src/lib/social/notify/due.test.ts` (add `missedDue` cases)
- Modify: `src/collections/SocialPosts.ts` (add `missedAlertSentAt` to `notify` group)
- Modify: `src/payload-types.ts` (hand-patch notify group) — *uncommitted*

**Interfaces:**
- Consumes: `NotifyPost`, `NotifyConfig`, `reviewDue`/`reminderDue` patterns.
- Produces: `missedDue(post: NotifyPost, now: Date): boolean`; `NotifyEvent` gains `'missed'`.

- [ ] **Step 1: Extend the event type + post shape**

In `src/lib/social/notify/types.ts`:
```ts
export type NotifyEvent = 'generated' | 'review' | 'reminder' | 'published' | 'missed'
```
In the `NotifyPost.notify` object add:
```ts
    publishedNotifiedAt?: string | null
    missedAlertSentAt?: string | null
```

- [ ] **Step 2: Wire the three lookup maps**

In `src/lib/social/notify/email.ts` add to `LABELS`:
```ts
  missed: 'Missed — not approved in time, NOT published',
```
In `src/lib/social/notify/send.ts` add to `STAMP_FIELD` (and the `StampField` union):
```ts
// StampField union: add | 'missedAlertSentAt'
  missed: 'missedAlertSentAt',
```
In `src/lib/social/notify/recipients.ts`, `recipientsFor` already routes everything except `published` to `ownerEmails` — no change needed (`missed` falls through to owners). Confirm by reading.

- [ ] **Step 3: Write the failing `missedDue` test**

Add to `src/lib/social/notify/due.test.ts`:
```ts
import { missedDue } from './due'

test('missedDue: true when go-live passed and still unapproved', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T13:01:00.000Z')), true)
})

test('missedDue: false before go-live', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T12:00:00.000Z')), false)
})

test('missedDue: false when approved (it will publish, not miss)', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'approved', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'scheduled' }, notify: {} }
  assert.equal(missedDue(post, new Date('2026-07-06T14:00:00.000Z')), false)
})

test('missedDue: false once alert already sent (idempotent)', () => {
  const post: any = { id: 1, copy: 'x', platform: 'linkedin', status: 'draft', scheduledTime: '2026-07-06T13:00:00.000Z', publish: { state: 'pending' }, notify: { missedAlertSentAt: '2026-07-06T13:05:00.000Z' } }
  assert.equal(missedDue(post, new Date('2026-07-06T14:00:00.000Z')), false)
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- --test-name-pattern=missedDue`
Expected: FAIL with "missedDue is not a function".

- [ ] **Step 5: Implement `missedDue` in due.ts**

Append to `src/lib/social/notify/due.ts`:
```ts
export function missedDue(post: NotifyPost, now: Date): boolean {
  if (!post.scheduledTime) return false
  if (post.status === 'approved' || post.status === 'rejected') return false
  if (TERMINAL.has(post.publish?.state ?? '')) return false
  if (post.notify?.missedAlertSentAt) return false
  return now.getTime() > new Date(post.scheduledTime).getTime()
}
```

- [ ] **Step 6: Add the admin field + type patch**

In `src/collections/SocialPosts.ts` `notify` group `fields` add:
```ts
        { name: 'missedAlertSentAt', type: 'date' },
```
In `src/payload-types.ts`, `SocialPost.notify` object add `missedAlertSentAt?: string | null;`. (The `notify` group already maps as a single `T` in the select interface — no select change needed.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern=missedDue`
Expected: PASS (4 tests).

- [ ] **Step 8: Schema sync for the new column**

```bash
node --import tsx scripts/schema-preview.mts > /tmp/schema3.sql 2>&1
```
Copy ONLY `ALTER TABLE social_posts ADD COLUMN notify_missed_alert_sent_at ...` into `/tmp/apply3.sql` (exclude the known drift), then:
```bash
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -1 -f /tmp/apply3.sql
psql "$DATABASE_URI" -c "\d social_posts" | grep missed_alert
```
Expected: column present.

- [ ] **Step 9: Commit**

```bash
git add src/lib/social/notify/types.ts src/lib/social/notify/email.ts src/lib/social/notify/send.ts src/lib/social/notify/due.ts src/lib/social/notify/due.test.ts src/collections/SocialPosts.ts
git commit -m "feat(social): missed-slot alert for unapproved posts past go-live"
```

---

### Task 7: Drive the planner + missed-alert from the pm2 workers

**Files:**
- Modify: `scripts/social-scheduler.mts` (add hourly planner tick)
- Modify: `scripts/social-notifications.mts` (add missed-alert to tick)

**Interfaces:**
- Consumes: `runPlanner` (Task 5), `missedDue` + `notify('missed', ...)` (Task 6).

- [ ] **Step 1: Add the planner loop to social-scheduler.mts**

After the existing dynamic imports add:
```ts
const { runPlanner } = await import('../src/lib/social/calendar/planner')
```
After the `payload` is created and before the publish `while (true)` loop, add a separate self-scheduling planner loop (do NOT block the 60s publish tick):
```ts
const PLAN_MS = 3_600_000 // hourly
async function planTick(): Promise<void> {
  const n = await runPlanner({ payload: payload as any })
  if (n > 0) payload.logger.info(`social-scheduler: planner created ${n} drafts`)
}
void (async () => {
  // run once at startup, then hourly
  for (;;) {
    try { await planTick() } catch (err) { payload.logger.error({ err }, 'social-scheduler: planTick error') }
    await new Promise((r) => setTimeout(r, PLAN_MS))
  }
})()
```

- [ ] **Step 2: Add missed-alert to social-notifications.mts tick**

Add to the imports:
```ts
const { reviewDue, reminderDue, missedDue } = await import('../src/lib/social/notify/due')
```
Inside `tick()`'s loop, after the `reminderDue` line add:
```ts
      if (missedDue(post, now)) await notify('missed', post, cfg, payload as any, now.toISOString())
```

- [ ] **Step 3: Smoke-run the planner once (manual, no loop)**

```bash
cd /home/bitnami/stack/excelent-site
node --import tsx -e "
process.env.NODE_ENV='production';
const {getPayloadClient}=await import('./src/lib/payload');
const {runPlanner}=await import('./src/lib/social/calendar/planner');
const p=await getPayloadClient();
console.log('created', await runPlanner({payload:p}));
process.exit(0)" 2>&1 | tail -5
```
Expected: prints `created <n>` with no stack trace. (Requires at least one active brand with `postingSlots`; if none configured yet it prints `created 0`.)

- [ ] **Step 4: Restart workers**

```bash
pm2 restart social-scheduler
pm2 start scripts/social-notifications.mts --name social-notifications --interpreter none --interpreter-args "--import tsx" 2>/dev/null || pm2 restart social-notifications
pm2 logs social-scheduler --lines 20 --nostream
```
Expected: `social-scheduler: started` and (if slots exist) a `planner created N drafts` line.

- [ ] **Step 5: Commit**

```bash
git add scripts/social-scheduler.mts scripts/social-notifications.mts
git commit -m "feat(social): hourly planner tick + missed-alert in workers"
```

---

### Task 8: Interactive calendar admin view (react-big-calendar)

**Files:**
- Create: `src/components/admin/SocialCalendar.tsx` (server component — the registered View)
- Create: `src/components/admin/SocialCalendarClient.tsx` (`'use client'`)
- Modify: `src/payload.config.ts` (register `admin.components.views`) — *uncommitted*
- Modify: `src/app/(payload)/admin/importMap.js` (hand-add the import + map entry) — *uncommitted*
- Modify: `package.json` (react-big-calendar) — *uncommitted*

**Interfaces:**
- The view lives at `/admin/social-calendar`. The client fetches `/api/social-posts` (Payload REST, cookie-authed) for the visible range and renders events colored by `publish.state`/`status`.

- [ ] **Step 1: Install react-big-calendar**

```bash
cd /home/bitnami/stack/excelent-site
npm i --legacy-peer-deps react-big-calendar && npm i -D --legacy-peer-deps @types/react-big-calendar
```
Expected: added to dependencies.

- [ ] **Step 2: Create the client calendar**

```tsx
// src/components/admin/SocialCalendarClient.tsx
'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
    const res = await fetch('/api/social-posts?limit=500&depth=1&where[scheduledTime][exists]=true', { credentials: 'include' })
    const json = await res.json()
    setPosts(json.docs ?? [])
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
    if (ev.resource.publish?.state === 'sent') { alert('Cannot reschedule an already-published post.'); return }
    const res = await fetch('/api/social/reschedule', {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId: ev.id, scheduledTime: new Date(start).toISOString() }),
    })
    if (!res.ok) { alert('Reschedule failed: ' + (await res.json()).error); return }
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
          draggableAccessor={(e: any) => (e as Evt).resource.publish?.state !== 'sent'}
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
```

- [ ] **Step 3: Create the server view wrapper**

```tsx
// src/components/admin/SocialCalendar.tsx
import SocialCalendarClient from './SocialCalendarClient'

// Registered as a Payload custom admin view at /admin/social-calendar.
export default function SocialCalendar() {
  return <SocialCalendarClient />
}
```

- [ ] **Step 4: Register the view in payload.config.ts**

In the `admin` block, add a `components.views` entry:
```ts
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
      },
    },
  },
```

- [ ] **Step 5: Hand-add to importMap.js**

In `src/app/(payload)/admin/importMap.js`, add an import beside the other admin components:
```js
import { default as default_socialCalendar_aa11bb22 } from '../../../components/admin/SocialCalendar'
```
And add to the `importMap` object:
```js
  "/components/admin/SocialCalendar#default": default_socialCalendar_aa11bb22,
```

- [ ] **Step 6: Build + verify the route renders**

```bash
npm run build 2>&1 | tail -20
```
Expected: build succeeds. Then after Task 9 deploy, `/admin/social-calendar` shows the calendar. (If the build fails on react-big-calendar ESM/types, add `"@types/react-big-calendar"` and ensure `"skipLibCheck": true` is already in tsconfig — it is in this project.)

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/SocialCalendar.tsx src/components/admin/SocialCalendarClient.tsx
git commit -m "feat(social): interactive content calendar admin view"
```

---

### Task 9: Reschedule endpoint (drag-to-move target)

**Files:**
- Create: `src/app/api/social/reschedule/route.ts`
- Test: `src/app/api/social/reschedule/route.test.ts`

**Interfaces:**
- Produces: `POST /api/social/reschedule` `{ postId, scheduledTime }` → `{ ok: true }`. Refuses if `publish.state` is `sent`/`publishing` (409). Mirrors the guard in `api/social/publish/route.ts`. If the post was `scheduled` and the new time is in the future, keep it `scheduled`; the worker picks it up at the new time.

- [ ] **Step 1: Write the failing test (pure guard helper)**

Factor the guard into a tiny pure function so it is unit-testable without HTTP:
```ts
// src/app/api/social/reschedule/route.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canReschedule } from './guard'

test('canReschedule: blocks sent/publishing', () => {
  assert.equal(canReschedule('sent'), false)
  assert.equal(canReschedule('publishing'), false)
})
test('canReschedule: allows pending/scheduled/failed/undefined', () => {
  for (const s of ['pending', 'scheduled', 'failed', undefined]) assert.equal(canReschedule(s), true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern=canReschedule`
Expected: FAIL with "Cannot find module './guard'".

- [ ] **Step 3: Implement the guard + route**

```ts
// src/app/api/social/reschedule/guard.ts
export function canReschedule(state: string | undefined | null): boolean {
  return state !== 'sent' && state !== 'publishing'
}
```
```ts
// src/app/api/social/reschedule/route.ts
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { canReschedule } from './guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number; scheduledTime?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }) }
  if (!body.postId || !body.scheduledTime) return NextResponse.json({ error: 'missing postId or scheduledTime' }, { status: 400 })
  if (Number.isNaN(Date.parse(body.scheduledTime))) return NextResponse.json({ error: 'invalid scheduledTime' }, { status: 400 })

  const post = await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 0, disableErrors: true })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!canReschedule(post.publish?.state)) {
    return NextResponse.json({ error: `Post is ${post.publish?.state}` }, { status: 409 })
  }

  await payload.update({
    collection: 'social-posts',
    id: body.postId,
    context: { skipNotify: true },
    data: { scheduledTime: body.scheduledTime },
  })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern=canReschedule`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/social/reschedule/guard.ts src/app/api/social/reschedule/route.ts src/app/api/social/reschedule/route.test.ts
git commit -m "feat(social): reschedule endpoint for calendar drag-to-move"
```

---

### Task 10: End-to-end smoke, operator guide, deploy

**Files:**
- Modify: `docs/social-agent-phase-a.md` (operator guide — add calendar section)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Configure a real cadence + run the planner**

In admin, open a brand profile (e.g. `ps-rcm`), add a `postingSlots` row (LinkedIn, Monday, 09:00), save. Then:
```bash
cd /home/bitnami/stack/excelent-site
node --import tsx -e "
process.env.NODE_ENV='production';
const {getPayloadClient}=await import('./src/lib/payload');
const {runPlanner}=await import('./src/lib/social/calendar/planner');
const p=await getPayloadClient();
console.log('created', await runPlanner({payload:p}));
process.exit(0)" 2>&1 | tail -5
```
Expected: `created` ≥ 1 (one per Monday in 14 days). Re-running prints `created 0` (idempotent).

- [ ] **Step 2: Verify in DB + calendar**

```bash
psql "$DATABASE_URI" -c "select id, platform, status, slot_source, scheduled_time from social_posts where slot_source='auto' order by scheduled_time;"
```
Expected: auto rows with future `scheduled_time`. Then load `/admin/social-calendar` and confirm the events render in the right slots; drag one to a new day and confirm it persists (refresh).

- [ ] **Step 3: Verify skip-safety**

Leave an auto draft unapproved with a `scheduledTime` a minute in the past, wait for the next `social-notifications` tick, and confirm a "missed" email is sent and `notify.missedAlertSentAt` is stamped (and the post is NOT published — `publish.state` stays `pending`).

- [ ] **Step 4: Update operator guide + changelog**

Add a "Content Calendar" section to `docs/social-agent-phase-a.md` covering: configuring `postingSlots`, creating campaigns, how auto-fill works (hourly, 14-day rolling, LinkedIn-only), the calendar view, drag-to-reschedule, and the missed-alert behavior. Add a CHANGELOG entry under the current date.

- [ ] **Step 5: Final build + deploy**

```bash
npm test && npm run build && pm2 restart excelent-site social-scheduler && pm2 restart social-notifications
pm2 logs social-scheduler --lines 15 --nostream
```
Expected: tests pass, build clean, workers online, planner line logged.

- [ ] **Step 6: Commit**

```bash
git add docs/social-agent-phase-a.md CHANGELOG.md
git commit -m "docs(social): content calendar operator guide + changelog"
```

- [ ] **Step 7: Remind the user to commit the uncommitted files**

The feature only works on a fresh checkout once the user commits: `src/payload.config.ts`, `src/payload-types.ts`, `package.json`, `package-lock.json`, `src/app/(payload)/admin/importMap.js`. These carry unrelated `b2b-rebuild` edits, so the user commits them from their own terminal.

---

## Self-Review

- **Spec coverage:** structured cadence (Task 2) ✓; theme pool + campaigns (Tasks 1, 4) ✓; cron auto-fill 14-day rolling (Tasks 5, 7) ✓; LinkedIn-only auto-publish (Task 5 `PUBLISHABLE_PLATFORMS`) ✓; skip+alert (Task 6) ✓; interactive calendar + drag-reschedule (Tasks 8, 9) ✓; tests throughout ✓; gotchas (codegen, schema sync, uncommitted files) folded into Global Constraints + each task ✓.
- **Type consistency:** `materializeSlots`/`PostingSlotRule`/`PlannedSlot`, `selectTheme`/`CampaignForPlanning`/`ThemeChoice`, `runPlanner`/`slotKey`/`PlannerDeps`, `missedDue`, `canReschedule` are defined once and consumed with matching signatures. `generateDrafts` third param `createContext` defined in Task 5 and used by the planner.
- **Open assumption to confirm during execution:** the pm2 start flags for `social-notifications` in Task 7 Step 4 — if that worker is already registered, the `|| pm2 restart` branch handles it; if pm2 needs a different interpreter invocation than shown, match how `social-scheduler` was originally registered (`pm2 describe social-scheduler`).
```
