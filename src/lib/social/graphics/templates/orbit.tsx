import React from 'react'
import type { GraphicTheme } from '../theme'
import { Deco, Frame, Headline, Rule, Footer, row } from '../layout/primitives'
import { IconChip, iconAt } from '../layout/icons'
import { logoDataUri } from '../layout/assets'
import type { LayoutData } from './shared'
import { clamp, stripLockupPrefix } from '../text'

/**
 * ORBIT — one hub with peers around it, no sequence.
 *
 * Used when the items are siblings rather than steps. Arrows would claim an
 * order that isn't there; a ring says it correctly. The headline sits left with
 * a growth chart beneath it, filling what would otherwise be dead space.
 */
const CX = 1120
const CY = 470
const R = 268
const SAT_W = 236
const EDGE = 24

/**
 * Evenly spaced around the ring, first item at twelve o'clock.
 *
 * An even count would otherwise put a satellite at six o'clock, where its
 * caption collides with the footer CTA. Half a step of rotation moves an even
 * ring onto the diagonals and clears the bottom of the canvas; odd counts
 * already miss it.
 */
function angles(n: number): number[] {
  const offset = n % 2 === 0 ? 180 / n : 0
  return Array.from({ length: n }, (_, i) => -90 + offset + (360 / n) * i)
}

export function OrbitCard({ data, theme }: { data: LayoutData; theme: GraphicTheme }) {
  const items = stripLockupPrefix(data.items).slice(0, 4)
  const at = angles(items.length || 1)
  const bars = [58, 92, 130, 176, 228]

  return (
    <Frame theme={theme}>
      <Deco theme={theme} soft />

      <svg
        width={1536}
        height={1024}
        viewBox="0 0 1536 1024"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={theme.lav2} strokeWidth="3" />
        {items.map((_, i) => {
          const rad = (at[i] * Math.PI) / 180
          return (
            <circle
              key={i}
              cx={CX + R * Math.cos(rad)}
              cy={CY + R * Math.sin(rad)}
              r="9"
              fill={theme.lav3}
            />
          )
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CX - 148,
          top: CY - 96,
          width: 296,
          height: 192,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.white,
          borderRadius: 24,
          boxShadow: '0 18px 44px rgba(6,27,66,.12)',
        }}
      >
        <img src={logoDataUri()} width={196} height={65} style={{ objectFit: 'contain' }} />
        {data.statLabel ? (
          <div style={{ ...row, fontSize: 13, fontWeight: 600, color: theme.navy, letterSpacing: '0.3em', marginTop: 10 }}>
            {data.statLabel.toUpperCase()}
          </div>
        ) : null}
      </div>

      {items.map((s, i) => {
        const rad = (at[i] * Math.PI) / 180
        // Captions sit clear of the ring — closer than this and the text
        // crosses the stroke.
        const x = CX + (R + 112) * Math.cos(rad)
        const y = CY + (R + 112) * Math.sin(rad)
        // A satellite at 30 degrees lands past the right edge at this radius.
        // Clamp the box rather than pulling the whole ring inward.
        const left = Math.min(Math.max(x - SAT_W / 2, EDGE), 1536 - SAT_W - EDGE)
        return (
          <div
            key={s.label}
            style={{
              position: 'absolute',
              left,
              top: y - 78,
              width: SAT_W,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <IconChip
              name={iconAt(i, s.icon)}
              theme={theme}
              size={84}
              icon={40}
              background={theme.white}
              border={`3px solid ${theme.lav2}`}
            />
            <div style={{ ...row, marginTop: 12, fontSize: 22, fontWeight: 700 }}>
              <span style={{ color: theme.navy }}>PS</span>
              <span style={{ color: theme.lav3, margin: '0 8px' }}>|</span>
              <span style={{ color: theme.purple }}>{s.label.toUpperCase()}</span>
            </div>
            {s.desc ? (
              <div
                style={{
                  display: 'flex',
                  marginTop: 7,
                  fontSize: 16,
                  color: theme.navy,
                  lineHeight: 1.35,
                  textAlign: 'center',
                }}
              >
                {s.desc}
              </div>
            ) : null}
          </div>
        )
      })}

      <div style={{ display: 'flex', flexDirection: 'column', width: 620 }}>
        <Headline theme={theme} lead={data.lead} accent={data.accent} size={58} width={620} />
        <Rule theme={theme} />
        {data.sub ? (
          <div style={{ ...row, fontSize: 24, color: theme.navy, lineHeight: 1.42, width: 540 }}>
            {clamp(data.sub, 160)}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 'auto', marginBottom: 36 }}>
        {bars.map((h, i) => (
          <div
            key={h}
            style={{
              display: 'flex',
              width: 46,
              height: h,
              borderRadius: '6px 6px 0 0',
              marginLeft: i ? 16 : 0,
              backgroundColor: i === bars.length - 1 ? theme.purple : i === bars.length - 2 ? theme.lav3 : theme.lav2,
            }}
          />
        ))}
      </div>

      <Footer theme={theme} product={data.product} descriptor={data.descriptor} cta={data.cta} />
    </Frame>
  )
}
