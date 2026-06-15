# Social Post Preview + Generated Brand Graphics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give reviewers a realistic in-admin preview of each social post — platform card chrome + copy + a generated, on-brand graphic (PNG) rendered from the site's real colors and fonts.

**Architecture:** A pure graphics engine under `src/lib/social/graphics/` (theme tokens → templates → `next/og` PNG render) is exposed by an auth-gated route `/api/social/graphic`. A custom Payload `ui` field renders platform chrome + an `<img>` pointing at that route, so the preview *is* the real PNG. The generator pre-fills editable graphic fields on each post; reviewers pick the style from a dropdown.

**Tech Stack:** Next 15 `next/og` (Satori, built-in — no new deps), Payload CMS 3, PostgreSQL, `node:test` via `tsx`, bundled OFL fonts (Cabin, Montserrat).

---

## File Structure

**New files**
- `src/lib/social/graphics/text.ts` — pure string helpers (`clamp`, `parsePercent`, `splitHook`).
- `src/lib/social/graphics/theme.ts` — `GraphicTheme` tokens + `themeForBrand`.
- `src/lib/social/graphics/fonts.ts` — loads bundled `.ttf` buffers for `next/og`.
- `src/lib/social/graphics/fonts/*.ttf` — bundled font binaries (6 files).
- `src/lib/social/graphics/templates/hook.tsx` — hook card (prepare + JSX).
- `src/lib/social/graphics/templates/stat.tsx` — stat hero (prepare + JSX).
- `src/lib/social/graphics/templates/dataviz.tsx` — data-viz card (prepare + JSX).
- `src/lib/social/graphics/render.tsx` — `renderGraphic()` → PNG buffer.
- `src/lib/social/graphics/fromPost.ts` — `buildGraphicFromPost()` doc → render args.
- `src/app/api/social/graphic/route.ts` — GET (render preview) + POST (save asset).
- `src/components/admin/PostPreview.tsx` — the in-admin preview `ui` field.
- Tests: `text.test.ts`, `theme.test.ts`, `fonts.test.ts`, `templates.test.ts`, `render.test.ts`, `fromPost.test.ts` (all under `src/lib/social/graphics/`).

**Modified files**
- `src/lib/social/types.ts` — add `GraphicStyle`, `GraphicFields`.
- `src/collections/SocialPosts.ts` — add `graphicStyle`, `graphic` group, preview `ui` field.
- `src/lib/social/prompt.ts` — request graphic fields in the JSON contract.
- `src/lib/social/generate.ts` — parse + persist graphic fields/style.
- `src/lib/social/generate.test.ts` — extend `parseDrafts` tests.

---

## Task 1: Shared types + pure text helpers

**Files:**
- Modify: `src/lib/social/types.ts`
- Create: `src/lib/social/graphics/text.ts`
- Test: `src/lib/social/graphics/text.test.ts`

- [ ] **Step 1: Add types to `src/lib/social/types.ts`** (append at end)

```ts
export type GraphicStyle = 'none' | 'hook' | 'stat' | 'dataviz'

export interface GraphicFields {
  headline?: string | null
  subtext?: string | null
  statFrom?: string | null
  statTo?: string | null
  statLabel?: string | null
  caption?: string | null
}
```

- [ ] **Step 2: Write the failing test** `src/lib/social/graphics/text.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clamp, parsePercent, splitHook } from './text'

test('clamp trims to length with an ellipsis', () => {
  assert.equal(clamp('hello world', 5), 'hello…')
  assert.equal(clamp('short', 20), 'short')
  assert.equal(clamp('  spaced  ', 20), 'spaced')
})

test('parsePercent reads a leading number', () => {
  assert.equal(parsePercent('11.8%'), 11.8)
  assert.equal(parsePercent('2.5'), 2.5)
  assert.equal(parsePercent('n/a'), null)
})

test('splitHook splits on the final sentence', () => {
  assert.deepEqual(
    splitHook("Your denial rate isn't a billing metric. It's a cash-flow leak."),
    { lead: "Your denial rate isn't a billing metric.", accent: "It's a cash-flow leak." },
  )
})

test('splitHook with one sentence puts everything in lead', () => {
  assert.deepEqual(splitHook('One strong line'), { lead: 'One strong line', accent: '' })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/text.test.ts`
Expected: FAIL — cannot find module `./text`.

- [ ] **Step 4: Implement `src/lib/social/graphics/text.ts`**

```ts
/** Trim and cap a string, appending an ellipsis if it was cut. */
export function clamp(s: string, max: number): string {
  const t = (s || '').trim()
  return t.length <= max ? t : t.slice(0, max).trimEnd() + '…'
}

/** Parse a leading number out of strings like "11.8%". Returns null if none. */
export function parsePercent(s: string | null | undefined): number | null {
  const m = String(s ?? '').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

/** Split a hook into a lead clause and an emphasised final clause. */
export function splitHook(headline: string): { lead: string; accent: string } {
  const t = (headline || '').trim()
  const m = t.match(/^(.*[.!?])\s+(\S.*)$/s)
  if (m) return { lead: m[1].trim(), accent: m[2].trim() }
  return { lead: t, accent: '' }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/text.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/types.ts src/lib/social/graphics/text.ts src/lib/social/graphics/text.test.ts
git commit -m "feat(social): graphic types and pure text helpers"
```

---

## Task 2: Theme tokens + brand→theme mapping

**Files:**
- Create: `src/lib/social/graphics/theme.ts`
- Test: `src/lib/social/graphics/theme.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/social/graphics/theme.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { themeForBrand, THEMES } from './theme'

test('patient slug maps to the patient theme', () => {
  assert.equal(themeForBrand({ slug: 'patient-facing' }), 'patient')
})

test('b2b/product slugs map to the b2b theme', () => {
  assert.equal(themeForBrand({ slug: 'ps-rcm' }), 'b2b')
  assert.equal(themeForBrand({ slug: undefined }), 'b2b')
})

test('themes share brand colors but differ in surface', () => {
  assert.equal(THEMES.b2b.purple, '#89007a')
  assert.equal(THEMES.b2b.navy, '#061b42')
  assert.notEqual(THEMES.b2b.surface, THEMES.patient.surface)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/theme.test.ts`
Expected: FAIL — cannot find module `./theme`.

- [ ] **Step 3: Implement `src/lib/social/graphics/theme.ts`**

```ts
export type ThemeName = 'b2b' | 'patient'

/** Tokens mirrored from src/app/tokens.css — the renderer's source of truth. */
export interface GraphicTheme {
  navy: string
  purple: string
  ink: string
  ink2: string
  surface: string
  white: string
  navyLabel: string
  navySub: string
  barHi: string
}

const SHARED = {
  navy: '#061b42',
  purple: '#89007a',
  ink: '#18181b',
  ink2: '#52525b',
  white: '#ffffff',
  navyLabel: '#9fb3d8',
  navySub: '#c7d4ea',
  barHi: '#9aa3af',
}

export const THEMES: Record<ThemeName, GraphicTheme> = {
  b2b: { ...SHARED, surface: '#fafafa' },
  patient: { ...SHARED, surface: '#ffffff' },
}

/** Pick a theme from the brand profile. Patient brands → patient, else b2b. */
export function themeForBrand(brand: { slug?: string | null }): ThemeName {
  return (brand.slug || '').includes('patient') ? 'patient' : 'b2b'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/theme.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/graphics/theme.ts src/lib/social/graphics/theme.test.ts
git commit -m "feat(social): graphic theme tokens and brand mapping"
```

---

## Task 3: Bundle fonts + font loader

**Files:**
- Create: `src/lib/social/graphics/fonts/` (6 `.ttf` files)
- Create: `src/lib/social/graphics/fonts.ts`
- Test: `src/lib/social/graphics/fonts.test.ts`

- [ ] **Step 1: Download the static TTFs** (OFL — safe to bundle)

```bash
cd /home/bitnami/stack/excelent-site
mkdir -p src/lib/social/graphics/fonts
cd src/lib/social/graphics/fonts
base=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -fLo Cabin-Regular.ttf       "$base/cabin/static/Cabin-Regular.ttf"
curl -fLo Cabin-SemiBold.ttf      "$base/cabin/static/Cabin-SemiBold.ttf"
curl -fLo Cabin-Bold.ttf          "$base/cabin/static/Cabin-Bold.ttf"
curl -fLo Montserrat-SemiBold.ttf "$base/montserrat/static/Montserrat-SemiBold.ttf"
curl -fLo Montserrat-Bold.ttf     "$base/montserrat/static/Montserrat-Bold.ttf"
curl -fLo Montserrat-ExtraBold.ttf "$base/montserrat/static/Montserrat-ExtraBold.ttf"
cd /home/bitnami/stack/excelent-site
```

Verify each is a real TTF (first bytes `00 01 00 00`), not an HTML 404 page:

```bash
for f in src/lib/social/graphics/fonts/*.ttf; do printf '%s ' "$f"; xxd -l4 -p "$f"; done
# Expected: each line ends in "00010000"
```

If any URL 404s (the `static/` path can vary by family), pull the file from the same family folder's `static/` listing on github.com/google/fonts, or from the jsDelivr `@fontsource/<family>` TTF files. The six filenames above are what the loader expects — keep them exact.

- [ ] **Step 2: Write the failing test** `src/lib/social/graphics/fonts.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadFonts } from './fonts'

test('loadFonts returns six non-empty font buffers', () => {
  const fonts = loadFonts()
  assert.equal(fonts.length, 6)
  for (const f of fonts) {
    assert.ok(['Cabin', 'Montserrat'].includes(f.name))
    assert.ok(f.data.length > 1000, `${f.name} ${f.weight} buffer too small`)
    assert.equal(f.style, 'normal')
  }
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/fonts.test.ts`
Expected: FAIL — cannot find module `./fonts`.

- [ ] **Step 4: Implement `src/lib/social/graphics/fonts.ts`**

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type FontWeight = 400 | 600 | 700 | 800

export interface LoadedFont {
  name: 'Cabin' | 'Montserrat'
  data: Buffer
  weight: FontWeight
  style: 'normal'
}

const DIR = join(process.cwd(), 'src/lib/social/graphics/fonts')

const SPECS: Array<{ name: LoadedFont['name']; file: string; weight: FontWeight }> = [
  { name: 'Cabin', file: 'Cabin-Regular.ttf', weight: 400 },
  { name: 'Cabin', file: 'Cabin-SemiBold.ttf', weight: 600 },
  { name: 'Cabin', file: 'Cabin-Bold.ttf', weight: 700 },
  { name: 'Montserrat', file: 'Montserrat-SemiBold.ttf', weight: 600 },
  { name: 'Montserrat', file: 'Montserrat-Bold.ttf', weight: 700 },
  { name: 'Montserrat', file: 'Montserrat-ExtraBold.ttf', weight: 800 },
]

let cache: LoadedFont[] | null = null

/** Read the bundled TTFs once; shaped for next/og's `fonts` option. */
export function loadFonts(): LoadedFont[] {
  if (cache) return cache
  cache = SPECS.map((s) => ({
    name: s.name,
    weight: s.weight,
    style: 'normal' as const,
    data: readFileSync(join(DIR, s.file)),
  }))
  return cache
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/fonts.test.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/lib/social/graphics/fonts src/lib/social/graphics/fonts.ts src/lib/social/graphics/fonts.test.ts
git commit -m "feat(social): bundle Cabin/Montserrat TTFs and font loader"
```

---

## Task 4: Templates (prepare functions + JSX)

**Files:**
- Create: `src/lib/social/graphics/templates/hook.tsx`
- Create: `src/lib/social/graphics/templates/stat.tsx`
- Create: `src/lib/social/graphics/templates/dataviz.tsx`
- Test: `src/lib/social/graphics/templates.test.ts`

The pure `prepare*` functions are unit-tested; the JSX components are exercised by the render smoke test in Task 5.

- [ ] **Step 1: Write the failing test** `src/lib/social/graphics/templates.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareHook } from './templates/hook'
import { prepareStat } from './templates/stat'
import { prepareDataViz } from './templates/dataviz'

const brand = 'PS | RCM'

test('prepareHook splits the headline and carries the brand', () => {
  const d = prepareHook({ headline: 'A. B.' }, brand)
  assert.equal(d.lead, 'A.')
  assert.equal(d.accent, 'B.')
  assert.equal(d.brand, brand)
})

test('prepareStat passes stat fields through and clamps the sub', () => {
  const long = 'x'.repeat(200)
  const d = prepareStat({ statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate', subtext: long }, brand)
  assert.equal(d.from, '11.8%')
  assert.equal(d.to, '2.5%')
  assert.equal(d.label, 'Denial Rate')
  assert.ok(d.sub.length <= 121) // 120 + ellipsis
})

test('prepareDataViz computes relative bar heights from percentages', () => {
  const d = prepareDataViz({ statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial rate', caption: 'note' }, brand)
  assert.equal(d.hiPct, 11.8)
  assert.equal(d.loPct, 2.5)
  assert.equal(d.hiHeight, 100) // taller bar is the reference
  assert.ok(d.loHeight > 18 && d.loHeight < 26) // ~21%
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/templates.test.ts`
Expected: FAIL — cannot find module `./templates/hook`.

- [ ] **Step 3: Implement `src/lib/social/graphics/templates/hook.tsx`**

```tsx
import type { GraphicFields } from '@/lib/social/types'
import type { GraphicTheme } from '../theme'
import { splitHook } from '../text'

export interface HookData { lead: string; accent: string; brand: string }

export function prepareHook(fields: GraphicFields, brandName: string): HookData {
  const { lead, accent } = splitHook(fields.headline || '')
  return { lead, accent, brand: brandName }
}

export function HookCard({ data, theme }: { data: HookData; theme: GraphicTheme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', height: '100%', padding: '88px 80px', backgroundColor: theme.surface }}>
      <div style={{ width: 120, height: 14, backgroundColor: theme.purple, borderRadius: 7 }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', fontFamily: 'Montserrat', fontWeight: 700,
        fontSize: 76, lineHeight: 1.1, letterSpacing: '-0.02em', color: theme.ink }}>
        <span>{data.lead}{data.accent ? ' ' : ''}</span>
        {data.accent ? <span style={{ color: theme.purple }}>{data.accent}</span> : null}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 34,
        letterSpacing: '0.02em', color: theme.navy }}>{data.brand}</div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/lib/social/graphics/templates/stat.tsx`**

```tsx
import type { GraphicFields } from '@/lib/social/types'
import type { GraphicTheme } from '../theme'
import { clamp } from '../text'

export interface StatData { label: string; from: string; to: string; sub: string; brand: string }

export function prepareStat(fields: GraphicFields, brandName: string): StatData {
  return {
    label: (fields.statLabel || '').trim(),
    from: (fields.statFrom || '').trim(),
    to: (fields.statTo || '').trim(),
    sub: clamp(fields.subtext || '', 120),
    brand: brandName,
  }
}

export function StatCard({ data, theme }: { data: StatData; theme: GraphicTheme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', height: '100%', padding: '84px 80px', backgroundColor: theme.navy }}>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 600, fontSize: 30,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.navyLabel }}>{data.label}</div>
      <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Montserrat', fontWeight: 800,
        fontSize: 150, letterSpacing: '-0.03em', color: theme.white }}>
        <span>{data.from}</span>
        <span style={{ color: theme.purple, margin: '0 32px', fontSize: 120 }}>→</span>
        <span>{data.to}</span>
      </div>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 400, fontSize: 34,
        lineHeight: 1.35, color: theme.navySub, maxWidth: '90%' }}>{data.sub}</div>
      <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 34,
        letterSpacing: '0.02em', color: theme.white }}>{data.brand}</div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/lib/social/graphics/templates/dataviz.tsx`**

```tsx
import type { GraphicFields } from '@/lib/social/types'
import type { GraphicTheme } from '../theme'
import { parsePercent } from '../text'

export interface DataVizData {
  label: string; caption: string; brand: string
  from: string; to: string; hiPct: number; loPct: number; hiHeight: number; loHeight: number
}

export function prepareDataViz(fields: GraphicFields, brandName: string): DataVizData {
  const hiPct = parsePercent(fields.statFrom) ?? 0
  const loPct = parsePercent(fields.statTo) ?? 0
  const max = Math.max(hiPct, loPct, 1)
  return {
    label: (fields.statLabel || '').trim(),
    caption: (fields.caption || '').trim(),
    brand: brandName,
    from: (fields.statFrom || '').trim(),
    to: (fields.statTo || '').trim(),
    hiPct, loPct,
    hiHeight: Math.round((hiPct / max) * 100),
    loHeight: Math.round((loPct / max) * 100),
  }
}

export function DataVizCard({ data, theme }: { data: DataVizData; theme: GraphicTheme }) {
  const Bar = ({ heightPct, color, value, label }: { heightPct: number; color: string; value: string; label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'center', height: 360, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18, width: 170,
          height: `${Math.max(heightPct, 6)}%`, backgroundColor: color, borderRadius: '12px 12px 0 0',
          fontFamily: 'Montserrat', fontWeight: 700, fontSize: 40, color: theme.white }}>{value}</div>
      </div>
      <div style={{ display: 'flex', marginTop: 16, fontFamily: 'Cabin', fontWeight: 600,
        fontSize: 30, color: theme.ink2 }}>{label}</div>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', height: '100%', padding: '80px', backgroundColor: theme.surface }}>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 600, fontSize: 30,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.ink2 }}>{data.label}</div>
      <div style={{ display: 'flex', gap: 80, justifyContent: 'center' }}>
        <Bar heightPct={data.hiHeight} color={theme.barHi} value={data.from} label="Industry" />
        <Bar heightPct={data.loHeight} color={theme.purple} value={data.to} label={data.brand} />
      </div>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 400, fontSize: 30, color: theme.ink2 }}>{data.caption}</div>
      <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 34,
        letterSpacing: '0.02em', color: theme.navy }}>{data.brand}</div>
    </div>
  )
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/templates.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/social/graphics/templates src/lib/social/graphics/templates.test.ts
git commit -m "feat(social): hook/stat/dataviz graphic templates"
```

---

## Task 5: PNG renderer (`render.tsx`)

**Files:**
- Create: `src/lib/social/graphics/render.tsx`
- Test: `src/lib/social/graphics/render.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/social/graphics/render.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderGraphic } from './render'
import { THEMES } from './theme'

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

test('renderGraphic returns a PNG buffer for the hook style', async () => {
  const buf = await renderGraphic({
    style: 'hook',
    brandName: 'PS | RCM',
    theme: THEMES.b2b,
    fields: { headline: "Your denial rate isn't a billing metric. It's a cash-flow leak." },
  })
  assert.ok(Buffer.isBuffer(buf))
  assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC))
  assert.ok(buf.length > 2000)
})

test('renderGraphic handles every style without throwing', async () => {
  const fields = { headline: 'H', subtext: 'S', statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate', caption: 'c' }
  for (const style of ['none', 'hook', 'stat', 'dataviz'] as const) {
    const buf = await renderGraphic({ style, brandName: 'PS | RCM', theme: THEMES.b2b, fields })
    assert.ok(buf.subarray(0, 4).equals(PNG_MAGIC), `style ${style} not a PNG`)
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/render.test.ts`
Expected: FAIL — cannot find module `./render`.

- [ ] **Step 3: Implement `src/lib/social/graphics/render.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import type { GraphicTheme } from './theme'
import { loadFonts } from './fonts'
import { HookCard, prepareHook } from './templates/hook'
import { StatCard, prepareStat } from './templates/stat'
import { DataVizCard, prepareDataViz } from './templates/dataviz'

export const GRAPHIC_SIZE = 1080

export interface RenderArgs {
  style: GraphicStyle
  fields: GraphicFields
  theme: GraphicTheme
  brandName: string
}

function element({ style, fields, theme, brandName }: RenderArgs) {
  if (style === 'hook') return <HookCard data={prepareHook(fields, brandName)} theme={theme} />
  if (style === 'stat') return <StatCard data={prepareStat(fields, brandName)} theme={theme} />
  if (style === 'dataviz') return <DataVizCard data={prepareDataViz(fields, brandName)} theme={theme} />
  // 'none' — a clean branded panel so the slot is never empty.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      width: '100%', height: '100%', padding: 80, backgroundColor: theme.surface }}>
      <div style={{ width: 120, height: 14, backgroundColor: theme.purple, borderRadius: 7, marginBottom: 28 }} />
      <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 40,
        letterSpacing: '0.02em', color: theme.navy }}>{brandName}</div>
    </div>
  )
}

/** Render a graphic style to a 1080×1080 PNG buffer via next/og (Satori). */
export async function renderGraphic(args: RenderArgs): Promise<Buffer> {
  const fonts = loadFonts().map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }))
  const res = new ImageResponse(element(args), { width: GRAPHIC_SIZE, height: GRAPHIC_SIZE, fonts })
  return Buffer.from(await res.arrayBuffer())
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/render.test.ts`
Expected: PASS (2 tests). Note: the first render loads the Satori wasm + fonts and may take a few seconds.

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/graphics/render.tsx src/lib/social/graphics/render.test.ts
git commit -m "feat(social): next/og PNG renderer for graphic styles"
```

---

## Task 6: `buildGraphicFromPost` mapper

**Files:**
- Create: `src/lib/social/graphics/fromPost.ts`
- Test: `src/lib/social/graphics/fromPost.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/social/graphics/fromPost.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildGraphicFromPost } from './fromPost'

test('maps a populated post doc to render args', () => {
  const args = buildGraphicFromPost({
    graphicStyle: 'stat',
    graphic: { statFrom: '11.8%', statTo: '2.5%', statLabel: 'Denial Rate' },
    brand: { name: 'PS | RCM', slug: 'ps-rcm' },
  })
  assert.equal(args.style, 'stat')
  assert.equal(args.brandName, 'PS | RCM')
  assert.equal(args.theme.surface, '#fafafa') // b2b theme
  assert.equal(args.fields.statFrom, '11.8%')
})

test('defaults missing style to none and unknown brand to the b2b theme', () => {
  const args = buildGraphicFromPost({ brand: { name: 'X' } })
  assert.equal(args.style, 'none')
  assert.equal(args.theme.surface, '#fafafa')
  assert.equal(args.brandName, 'X')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/graphics/fromPost.test.ts`
Expected: FAIL — cannot find module `./fromPost`.

- [ ] **Step 3: Implement `src/lib/social/graphics/fromPost.ts`**

```ts
import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import { THEMES, themeForBrand } from './theme'
import type { RenderArgs } from './render'

/** A social-post doc with brand populated (depth>=1). */
export interface PostForGraphic {
  graphicStyle?: GraphicStyle | null
  graphic?: GraphicFields | null
  brand: { name?: string | null; slug?: string | null } | number | string
}

export function buildGraphicFromPost(post: PostForGraphic): RenderArgs {
  const brand = (typeof post.brand === 'object' && post.brand) || {}
  return {
    style: (post.graphicStyle as GraphicStyle) || 'none',
    fields: (post.graphic as GraphicFields) || {},
    brandName: (brand.name as string) || 'excelENT',
    theme: THEMES[themeForBrand({ slug: (brand.slug as string) || null })],
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/social/graphics/fromPost.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/social/graphics/fromPost.ts src/lib/social/graphics/fromPost.test.ts
git commit -m "feat(social): map a post doc to graphic render args"
```

---

## Task 7: Collection fields + production schema sync

**Files:**
- Modify: `src/collections/SocialPosts.ts`
- Ops: `scripts/schema-preview.mts`, `psql`

- [ ] **Step 1: Add fields to `src/collections/SocialPosts.ts`**

Insert these two fields immediately AFTER the existing `asset` field (line 45, `{ name: 'asset', ... }`) and BEFORE the `status` field:

```ts
    {
      name: 'graphicStyle',
      type: 'select',
      defaultValue: 'hook',
      admin: { position: 'sidebar', description: 'Which generated graphic to render. The generator suggests one.' },
      options: [
        { label: 'None', value: 'none' },
        { label: 'Hook card', value: 'hook' },
        { label: 'Stat hero', value: 'stat' },
        { label: 'Data-viz', value: 'dataviz' },
      ],
    },
    {
      name: 'graphic',
      type: 'group',
      admin: { description: 'Text rendered onto the graphic. Pre-filled by the generator; edit freely.' },
      fields: [
        { name: 'headline', type: 'text', admin: { description: 'Hook/main line (hook card).' } },
        { name: 'subtext', type: 'text', admin: { description: 'Supporting line (stat hero).' } },
        { name: 'statFrom', type: 'text', admin: { description: 'e.g. "11.8%" — stat/data-viz.' } },
        { name: 'statTo', type: 'text', admin: { description: 'e.g. "2.5%" — stat/data-viz.' } },
        { name: 'statLabel', type: 'text', admin: { description: 'e.g. "ENT Denial Rate".' } },
        { name: 'caption', type: 'text', admin: { description: 'Small footer line (data-viz).' } },
      ],
    },
```

- [ ] **Step 2: Add the preview `ui` field to `src/collections/SocialPosts.ts`**

Insert this field immediately AFTER the `title` field (line 19) so the preview sits at the top of the editor:

```ts
    {
      name: 'preview',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PostPreview' } },
    },
```

(The component is built in Task 9; Payload tolerates the missing default export only at render time, so build the schema now and the component before restart.)

- [ ] **Step 3: Preview the schema diff (applies nothing)**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx scripts/schema-preview.mts`
Expected: prints `hasDataLoss: false` and writes `scripts/schema-push.full.sql`. The new statements should add `social_posts.graphic_style` (a new enum type + column) and `social_posts.graphic_*` columns.

- [ ] **Step 4: Filter out drift on existing tables and wrap in a transaction**

```bash
cd /home/bitnami/stack/excelent-site
grep -vE '^ALTER TABLE "(faqs|users|testimonials|demo_requests)" ALTER COLUMN' \
  scripts/schema-push.full.sql > scripts/schema-push.body.sql
{ echo 'BEGIN;'; cat scripts/schema-push.body.sql; echo 'COMMIT;'; } > scripts/schema-push.apply.sql
echo '--- statements to apply ---'; grep -c ';' scripts/schema-push.apply.sql
echo '--- sanity: only social_posts/enum touched ---'; grep -iE 'ALTER TABLE|CREATE TYPE|CREATE TABLE' scripts/schema-push.apply.sql
```

Confirm the only `ALTER TABLE` targets are `social_posts` (and any `CREATE TYPE` is the graphic-style enum). If anything else appears, stop and investigate before applying.

- [ ] **Step 5: Apply the additive DDL**

```bash
cd /home/bitnami/stack/excelent-site
PGPASSWORD=ExcelENT2024Secure psql -h localhost -U excelent -d excelent_cms \
  -v ON_ERROR_STOP=1 -f scripts/schema-push.apply.sql
```
Expected: `BEGIN` … `ALTER TABLE` / `CREATE TYPE` … `COMMIT`, no errors.

- [ ] **Step 6: Verify the columns exist**

```bash
PGPASSWORD=ExcelENT2024Secure psql -h localhost -U excelent -d excelent_cms \
  -c "\d social_posts" | grep -E 'graphic'
```
Expected: rows for `graphic_style`, `graphic_headline`, `graphic_subtext`, `graphic_stat_from`, `graphic_stat_to`, `graphic_stat_label`, `graphic_caption`.

- [ ] **Step 7: Commit** (collection only — never the generated SQL or shared files)

```bash
git add src/collections/SocialPosts.ts
git commit -m "feat(social): graphicStyle, graphic group, and preview field on SocialPosts"
```

---

## Task 8: Render + save route

**Files:**
- Create: `src/app/api/social/graphic/route.ts`

- [ ] **Step 1: Implement `src/app/api/social/graphic/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderGraphic, GRAPHIC_SIZE } from '@/lib/social/graphics/render'
import { buildGraphicFromPost, type PostForGraphic } from '@/lib/social/graphics/fromPost'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/social/graphic?postId=123 → live PNG preview. */
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('postId')
  if (!id) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({ collection: 'social-posts', id, depth: 1 })) as unknown as PostForGraphic
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const png = await renderGraphic(buildGraphicFromPost(post))
  return new NextResponse(png, {
    headers: { 'content-type': 'image/png', 'cache-control': 'no-store' },
  })
}

/** POST /api/social/graphic { postId } → render, store as a Social Asset, link it. */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }) }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 1 })) as any
  const png = await renderGraphic(buildGraphicFromPost(post as PostForGraphic))
  const brandId = typeof post.brand === 'object' ? post.brand.id : post.brand

  const asset = await payload.create({
    collection: 'social-assets',
    data: { alt: `${post.title || 'post'} graphic`, brand: brandId, source: 'ai-generated' },
    file: { data: png, mimetype: 'image/png', name: `post-${body.postId}-${post.graphicStyle || 'none'}.png`, size: png.length },
  })

  await payload.update({ collection: 'social-posts', id: body.postId, data: { asset: asset.id } })
  return NextResponse.json({ ok: true, assetId: asset.id })
}
```

- [ ] **Step 2: Verify the build compiles this route**

Run: `cd /home/bitnami/stack/excelent-site && npx tsc --noEmit 2>&1 | grep -E 'graphic|render|fromPost' || echo 'no type errors in new graphics files'`
Expected: `no type errors in new graphics files`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/social/graphic/route.ts
git commit -m "feat(social): graphic render + save-asset route"
```

(End-to-end auth + PNG verification happens in Task 11 after restart.)

---

## Task 9: In-admin preview component

**Files:**
- Create: `src/components/admin/PostPreview.tsx`

- [ ] **Step 1: Implement `src/components/admin/PostPreview.tsx`**

```tsx
'use client'
import React, { useMemo, useState } from 'react'
import { useDocumentInfo, useAllFormFields } from '@payloadcms/ui'

const CHROME: Record<string, { sub: string }> = {
  linkedin: { sub: 'Revenue Cycle Management · Promoted' },
  facebook: { sub: 'Sponsored' },
  instagram: { sub: 'Sponsored' },
}

export default function PostPreview() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const get = (k: string) => (fields[k]?.value as string) || ''
  const platform = get('platform') || 'linkedin'
  const copy = get('copy')
  const style = get('graphicStyle')

  // Cache-bust the preview image whenever copy/style/graphic fields change.
  const ver = useMemo(() => {
    const keys = ['copy', 'graphicStyle', 'platform', 'graphic.headline', 'graphic.subtext',
      'graphic.statFrom', 'graphic.statTo', 'graphic.statLabel', 'graphic.caption']
    return encodeURIComponent(keys.map((k) => (fields[k]?.value as string) || '').join('|')).slice(0, 64)
  }, [fields])

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the draft to see its preview.</p>

  const save = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/graphic', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg('Graphic saved to the post asset.')
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <div style={{ maxWidth: 540, border: '1px solid #e4e4e7', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 8px' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#061b42', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PS</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>PS | RCM</div>
            <div style={{ fontSize: 12, color: '#52525b' }}>{(CHROME[platform] || CHROME.linkedin).sub}</div>
          </div>
        </div>
        <div style={{ padding: '4px 16px 12px', fontSize: 14, lineHeight: 1.5, color: '#18181b', whiteSpace: 'pre-line' }}>{copy}</div>
        {style !== 'none' && (
          <img
            alt="generated graphic"
            src={`/api/social/graphic?postId=${id}&v=${ver}`}
            style={{ width: '100%', aspectRatio: '1 / 1', display: 'block', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', fontSize: 13, color: '#52525b', fontWeight: 600 }}>
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button type="button" onClick={save} disabled={busy || style === 'none'}>
          {busy ? 'Saving…' : 'Save graphic to asset'}
        </button>
        <span style={{ fontSize: 12, color: '#52525b' }}>Edit copy or graphic fields, then re-open to refresh the image.</span>
      </div>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/PostPreview.tsx
git commit -m "feat(social): in-admin post preview component"
```

(Visual verification happens in Task 11 after restart, since the importMap/admin bundle only updates on build.)

---

## Task 10: Generator fills graphic fields

**Files:**
- Modify: `src/lib/social/prompt.ts`
- Modify: `src/lib/social/generate.ts`
- Test: `src/lib/social/generate.test.ts`

- [ ] **Step 1: Write the failing test** — append to `src/lib/social/generate.test.ts`

```ts
test('parses graphic fields and style when present', () => {
  const out = parseDrafts('[{"copy":"hi","cta":"Book","graphicStyle":"stat","graphic":{"statFrom":"11.8%","statTo":"2.5%","statLabel":"Denial Rate","headline":"h","subtext":"s","caption":"c"}}]')
  assert.equal(out[0].graphicStyle, 'stat')
  assert.equal(out[0].graphic?.statFrom, '11.8%')
  assert.equal(out[0].graphic?.statLabel, 'Denial Rate')
})

test('defaults graphicStyle to hook and graphic to empty when absent', () => {
  const out = parseDrafts('[{"copy":"hi"}]')
  assert.equal(out[0].graphicStyle, 'hook')
  assert.deepEqual(out[0].graphic, {})
})

test('coerces an unknown graphicStyle to hook', () => {
  const out = parseDrafts('[{"copy":"hi","graphicStyle":"banana"}]')
  assert.equal(out[0].graphicStyle, 'hook')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/social/generate.test.ts`
Expected: FAIL — `out[0].graphicStyle` is undefined.

- [ ] **Step 3: Update `ParsedDraft` and `parseDrafts` in `src/lib/social/generate.ts`**

Replace the `ParsedDraft` interface (lines 8-11) with:

```ts
import type { GraphicFields, GraphicStyle } from './types'

interface ParsedDraft {
  copy: string
  cta?: string
  graphicStyle: GraphicStyle
  graphic: GraphicFields
}

const GRAPHIC_STYLES: GraphicStyle[] = ['none', 'hook', 'stat', 'dataviz']
const GRAPHIC_KEYS: (keyof GraphicFields)[] = ['headline', 'subtext', 'statFrom', 'statTo', 'statLabel', 'caption']
```

(Add `GraphicFields, GraphicStyle` to the existing `import type … from './types'` line instead of a second import if you prefer; keep one import.)

Then replace the `.map((d) => …)` tail of `parseDrafts` (lines 43-45) with:

```ts
    .filter((d: unknown): d is Record<string, unknown> =>
      Boolean(d) && typeof (d as { copy?: unknown }).copy === 'string')
    .map((d) => {
      const rawStyle = String((d as any).graphicStyle || '')
      const g = ((d as any).graphic || {}) as Record<string, unknown>
      const graphic: GraphicFields = {}
      for (const k of GRAPHIC_KEYS) if (g[k] != null && g[k] !== '') graphic[k] = String(g[k]).trim()
      return {
        copy: String((d as any).copy).trim(),
        cta: (d as any).cta ? String((d as any).cta).trim() : undefined,
        graphicStyle: (GRAPHIC_STYLES.includes(rawStyle as GraphicStyle) ? rawStyle : 'hook') as GraphicStyle,
        graphic,
      }
    })
```

- [ ] **Step 4: Persist the new fields in `generateDrafts`** — in the `payload.create({ … data: { … } })` call, add after the `cta: d.cta,` line:

```ts
        graphicStyle: d.graphicStyle,
        graphic: d.graphic,
```

- [ ] **Step 5: Ask the model for the fields in `src/lib/social/prompt.ts`** — replace the final `lines.push('\nReturn ONLY a JSON array…')` block (lines 70-72) with:

```ts
  lines.push(
    '\nAlso design a square brand graphic for each post. Choose a graphicStyle:' +
      '\n- "hook": one punchy line (set graphic.headline to a 4–9 word hook ending in a period).' +
      '\n- "stat": a single before→after number (set graphic.statFrom, graphic.statTo, graphic.statLabel, and a short graphic.subtext).' +
      '\n- "dataviz": a two-bar comparison (set graphic.statFrom, graphic.statTo, graphic.statLabel, graphic.caption).' +
      '\nUse ONLY numbers and facts already present in the brand voice/themes/approved posts — never invent figures.',
  )
  lines.push(
    '\nReturn ONLY a JSON array. Each element: {"copy":"<post text>","cta":"<cta>","graphicStyle":"hook|stat|dataviz",' +
      '"graphic":{"headline":"","subtext":"","statFrom":"","statTo":"","statLabel":"","caption":""}}. ' +
      'Include only the graphic keys your chosen style needs. No prose, no markdown code fences.',
  )
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --import tsx --test src/lib/social/generate.test.ts src/lib/social/prompt.test.ts`
Expected: PASS (existing + 3 new).

- [ ] **Step 7: Commit**

```bash
git add src/lib/social/generate.ts src/lib/social/prompt.ts src/lib/social/generate.test.ts
git commit -m "feat(social): generator suggests graphic style and fills graphic fields"
```

---

## Task 11: Build, restart, end-to-end verification

**Files:** none (ops)

- [ ] **Step 1: Run the full graphics test suite**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx --test src/lib/social/graphics/*.test.ts src/lib/social/generate.test.ts`
Expected: all PASS.

- [ ] **Step 2: Build** (regenerates the admin bundle/importMap so the preview field appears)

Run: `cd /home/bitnami/stack/excelent-site && npm run build`
Expected: build succeeds. If Payload reports a missing importMap entry for `/components/admin/PostPreview`, run the project's importMap step (see `project_social_agent_gotchas.md`) and rebuild.

- [ ] **Step 3: Restart**

Run: `pm2 restart excelent-site && pm2 status`
Expected: `excelent-site` online.

- [ ] **Step 4: Verify the render route returns a PNG** (authenticated — run from a browser tab already logged into the admin, or skip if no cookie at hand)

In the admin, open any existing PS | RCM draft, set its `graphicStyle` to `stat`, fill `graphic.statFrom=11.8%`, `statTo=2.5%`, `statLabel=ENT Denial Rate`, save. Confirm the preview card at the top of the editor shows the post copy and the rendered stat graphic.

- [ ] **Step 5: Generate a fresh batch and confirm fields populate**

Run: `cd /home/bitnami/stack/excelent-site && node --import tsx scripts/generate-test.mts`
Then open one new draft in the admin: confirm `graphicStyle` is set and the `graphic` group is pre-filled, and the preview renders. Click **Save graphic to asset** and confirm a new Social Asset is created and linked.

- [ ] **Step 6: Update docs + memory pointer**

Append a short "Post preview + generated graphics (built 2026-06-15)" section to `docs/social-agent-phase-a.md` describing the route, styles, and that PNGs are produced by `next/og`. (Commit `docs/social-agent-phase-a.md` by explicit path.)

```bash
git add docs/social-agent-phase-a.md
git commit -m "docs(social): document in-admin preview and generated graphics"
```

---

## Self-Review Notes

- **Spec coverage:** data model (Task 7) · theme engine (Task 2) · templates (Task 4) · render route + live preview (Tasks 5, 8, 9) · generator fills fields (Task 10) · testing (Tasks 1-6, 10) · schema sync (Task 7) · build/restart (Task 11). All spec sections map to a task.
- **No new npm deps:** uses built-in `next/og`; only new *files* (fonts + source) are committed; shared `package.json`/`payload-types.ts`/`payload.config.ts` untouched.
- **Type consistency:** `RenderArgs`, `GraphicFields`, `GraphicStyle`, `prepareHook/prepareStat/prepareDataViz`, `renderGraphic`, `buildGraphicFromPost`, `loadFonts` names are used identically across tasks.
- **Prod safety:** schema sync follows the established preview→filter→transactional-apply flow; only `social_posts` is altered.
