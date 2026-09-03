import React from 'react'
import type { GraphicTheme } from '../theme'
import { logoDataUri } from './assets'

/** Layout templates render landscape; the legacy cards stay square. */
export const LAYOUT_W = 1536
export const LAYOUT_H = 1024

export const row = { display: 'flex' } as const

/**
 * Satori serialises `<svg>` subtrees to a string, so a React Fragment inside
 * one throws "Cannot convert a Symbol value to a string". Every SVG must
 * therefore receive element or array children only — never a fragment, and
 * never a component that returns one.
 */
export function Svg(props: {
  children: React.ReactNode
  w: number
  h: number
  vb: string
  style?: React.CSSProperties
}) {
  return (
    <svg width={props.w} height={props.h} viewBox={props.vb} style={props.style}>
      {props.children}
    </svg>
  )
}

/** Stroke preset for line icons. */
export const st = (c: string, w = 2.1) =>
  ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const

/**
 * Corner ribbons from the illustration tier. `soft` drops the heavy
 * bottom-right stack for layouts whose content reaches that corner.
 *
 * The centres sit outside the canvas on purpose — only the arcs show. Radii
 * must exceed the distance from the centre to the nearest canvas corner or the
 * whole circle falls off-frame and renders nothing.
 */
export function Deco({ theme, soft = false }: { theme: GraphicTheme; soft?: boolean }) {
  const circles: Array<{ cx: number; cy: number; r: number; fill: string }> = [
    { cx: 1660, cy: -130, r: 430, fill: theme.lav2 },
    { cx: 1610, cy: -215, r: 330, fill: theme.lav3 },
  ]
  if (!soft) {
    circles.push(
      { cx: 1760, cy: 1330, r: 680, fill: theme.lav1 },
      { cx: 1760, cy: 1330, r: 590, fill: theme.lav2 },
      { cx: 1760, cy: 1330, r: 500, fill: theme.navy },
      { cx: 1760, cy: 1330, r: 430, fill: theme.purple },
    )
  }
  circles.push({ cx: -160, cy: 1150, r: 340, fill: theme.lav1 })
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: LAYOUT_W, height: LAYOUT_H, display: 'flex' }}>
      <Svg w={LAYOUT_W} h={LAYOUT_H} vb={`0 0 ${LAYOUT_W} ${LAYOUT_H}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        {circles.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
        ))}
      </Svg>
    </div>
  )
}

export function Frame({
  children,
  theme,
  pad = '70px 72px 58px 72px',
}: {
  children: React.ReactNode
  theme: GraphicTheme
  pad?: string
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: LAYOUT_W,
        height: LAYOUT_H,
        backgroundColor: theme.surface,
        fontFamily: 'Cabin',
        padding: pad,
      }}
    >
      {children}
    </div>
  )
}

/** PS | PRODUCT wordmark, or the excelENT logo for umbrella brands. */
export function Lockup({
  theme,
  product,
  descriptor,
  size = 40,
}: {
  theme: GraphicTheme
  product?: string | null
  descriptor?: string | null
  size?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', width: 4, height: size * 1.9, backgroundColor: theme.navy, marginRight: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {product ? (
          <div style={{ ...row, fontSize: size, fontWeight: 700, letterSpacing: '0.01em' }}>
            <span style={{ color: theme.navy }}>PS</span>
            <span style={{ color: theme.lav3, margin: '0 13px' }}>|</span>
            <span style={{ color: theme.purple }}>{product}</span>
          </div>
        ) : (
          <img src={logoDataUri()} width={168} height={56} style={{ objectFit: 'contain' }} />
        )}
        {descriptor ? (
          <div
            style={{
              ...row,
              fontSize: 14,
              fontWeight: 600,
              color: theme.navy,
              letterSpacing: '0.22em',
              marginTop: 8,
            }}
          >
            {descriptor}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Cta({ theme, label, size = 22 }: { theme: GraphicTheme; label: string; size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.purple,
        borderRadius: 999,
        padding: '22px 36px',
      }}
    >
      <div style={{ ...row, fontSize: size, fontWeight: 600, color: theme.white }}>{label}</div>
      <Svg w={28} h={20} vb="0 0 30 20" style={{ marginLeft: 16 }}>
        <path d="M2 10 H26" fill="none" stroke={theme.white} strokeWidth="2.6" strokeLinecap="round" />
        <path
          d="M19 4 L26 10 L19 16"
          fill="none"
          stroke={theme.white}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </div>
  )
}

/** The gradient rule under a headline: purple into the illustration tier. */
export function Rule({ theme, w = 200 }: { theme: GraphicTheme; w?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        width: w,
        height: 7,
        borderRadius: 4,
        margin: '22px 0',
        backgroundImage: `linear-gradient(to right, ${theme.purple}, ${theme.lav3})`,
      }}
    />
  )
}

/** Two-tone headline: navy lead, purple accent, wrapped to `width`. */
export function Headline({
  theme,
  lead,
  accent,
  size,
  width,
}: {
  theme: GraphicTheme
  lead: string
  accent: string
  size: number
  width: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      {lead ? (
        <div style={{ ...row, fontSize: size, fontWeight: 700, color: theme.navy, lineHeight: 1.1 }}>{lead}</div>
      ) : null}
      {accent ? (
        <div style={{ ...row, fontSize: size, fontWeight: 700, color: theme.purple, lineHeight: 1.1 }}>{accent}</div>
      ) : null}
    </div>
  )
}

export function Arrow({ theme, top = 44 }: { theme: GraphicTheme; top?: number }) {
  return (
    <Svg w={54} h={20} vb="0 0 54 20" style={{ marginTop: top }}>
      <path d="M2 10 H44" {...st(theme.purple, 2.4)} />
      <path d="M36 3.5 L44 10 L36 16.5" {...st(theme.purple, 2.4)} />
    </Svg>
  )
}

export function Dots({ theme }: { theme: GraphicTheme }) {
  return (
    <Svg w={64} h={8} vb="0 0 64 8" style={{ marginTop: 44 }}>
      {[4, 20, 36, 52].map((x) => (
        <circle key={x} cx={x} cy="4" r="3" fill={theme.lav3} />
      ))}
    </Svg>
  )
}

export function Footer({
  theme,
  product,
  descriptor,
  cta,
}: {
  theme: GraphicTheme
  product?: string | null
  descriptor?: string | null
  cta?: string | null
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
      <Lockup theme={theme} product={product} descriptor={descriptor} />
      {cta ? (
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          <Cta theme={theme} label={cta} size={21} />
        </div>
      ) : null}
    </div>
  )
}
