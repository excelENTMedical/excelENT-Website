import { ImageResponse } from 'next/dist/server/og/image-response'
import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import type { GraphicTheme } from './theme'
import { loadFonts } from './fonts'
import { HookCard, prepareHook } from './templates/hook'
import { StatCard, prepareStat } from './templates/stat'
import { DataVizCard, prepareDataViz } from './templates/dataviz'
import React from 'react'

// The tsx/classic JSX transform compiles <X /> → React.createElement(X, ...)
// In tests (outside Next's build pipeline), React is not injected into scope
// automatically — ensure it is available on the global object for template
// functions that rely on it without a local import.
;(globalThis as Record<string, unknown>).React = React

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
