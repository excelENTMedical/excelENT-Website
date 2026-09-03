import { ImageResponse } from 'next/og'
import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import { isLayoutStyle } from '@/lib/social/types'
import type { GraphicTheme } from './theme'
import { loadFonts } from './fonts'
import { HookCard, prepareHook } from './templates/hook'
import { StatCard, prepareStat } from './templates/stat'
import { DataVizCard, prepareDataViz } from './templates/dataviz'
import { prepareLayout } from './templates/shared'
import { ObjectCard } from './templates/object'
import { TwoBandCard } from './templates/twoband'
import { ContrastCard } from './templates/contrast'
import { OrbitCard } from './templates/orbit'
import { StatementCard } from './templates/statement'
import { LAYOUT_W, LAYOUT_H } from './layout/primitives'
import React from 'react'

// The tsx/classic JSX transform compiles <X /> → React.createElement(X, ...)
// In tests (outside Next's build pipeline), React is not injected into scope
// automatically — ensure it is available on the global object for template
// functions that rely on it without a local import.
;(globalThis as Record<string, unknown>).React = React

/** Legacy card canvas. The layout templates render landscape instead. */
export const GRAPHIC_SIZE = 1080

export { LAYOUT_W, LAYOUT_H }

export interface RenderArgs {
  style: GraphicStyle
  fields: GraphicFields
  theme: GraphicTheme
  brandName: string
  /** Drives the PS | PRODUCT lockup and its descriptor on the layout templates. */
  brandSlug?: string | null
  /** The post's own call to action, used when the graphic has no caption. */
  cta?: string | null
}

/** Canvas dimensions for a style — square for the legacy cards, landscape for layouts. */
export function canvasFor(style: GraphicStyle): { width: number; height: number } {
  return isLayoutStyle(style)
    ? { width: LAYOUT_W, height: LAYOUT_H }
    : { width: GRAPHIC_SIZE, height: GRAPHIC_SIZE }
}

function element({ style, fields, theme, brandName, brandSlug, cta }: RenderArgs) {
  if (isLayoutStyle(style)) {
    const data = prepareLayout({ fields, brandSlug, cta })
    if (style === 'object') return <ObjectCard data={data} theme={theme} />
    if (style === 'twoband') return <TwoBandCard data={data} theme={theme} />
    if (style === 'contrast') return <ContrastCard data={data} theme={theme} />
    if (style === 'orbit') return <OrbitCard data={data} theme={theme} />
    return <StatementCard data={data} theme={theme} />
  }
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

/** Render a graphic style to a PNG buffer via next/og (Satori). */
export async function renderGraphic(args: RenderArgs): Promise<Buffer> {
  const fonts = loadFonts().map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }))
  const res = new ImageResponse(element(args), { ...canvasFor(args.style), fonts })
  return Buffer.from(await res.arrayBuffer())
}
