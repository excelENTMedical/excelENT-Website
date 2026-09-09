import React from 'react'
import type { GraphicItem } from '@/lib/social/types'
import type { GraphicTheme } from '../theme'
import { Deco, Frame, Headline, Rule, Svg, Dots, Cta, row, st } from '../layout/primitives'
import { IconChip, iconAt } from '../layout/icons'
import { logoDataUri } from '../layout/assets'
import type { LayoutData } from './shared'
import { clamp } from '../text'

/**
 * TWOBAND — two competing sequences.
 *
 * Used when the post's argument is a race: what happens without us on top,
 * what happens with us below. Both bands run left to right so the reader
 * compares them at the same tempo.
 *
 * Items feed both bands, split on a row whose label is `--`. Rows before the
 * separator are the upper band, rows after are the lower one. With no
 * separator every row goes to the lower band and the upper band is dropped —
 * a graphic with one sequence should not pretend to have two.
 *
 * Step widths are computed from the count. The earlier fixed-width version
 * overflowed: a 372px headline column plus five 190px steps needed 1578px of
 * a 1408px content box, and the headline collided with the first step.
 */
const CONTENT_W = 1408

function splitBands(items: GraphicItem[]): { upper: GraphicItem[]; lower: GraphicItem[] } {
  const at = items.findIndex((it) => /^-{2,}$/.test(it.label))
  if (at === -1) return { upper: [], lower: items }
  return { upper: items.slice(0, at), lower: items.slice(at + 1) }
}

function stepWidth(n: number, gutter: number): number {
  if (n <= 0) return 0
  return Math.floor((CONTENT_W - gutter * (n - 1)) / n)
}

function UpperBand({ items, theme }: { items: GraphicItem[]; theme: GraphicTheme }) {
  const w = Math.min(stepWidth(items.length, 64), 220)
  return (
    <div style={{ display: 'flex', marginTop: 'auto', paddingTop: 30 }}>
      {items.map((s, i) => (
        <div key={s.label} style={{ display: 'flex' }}>
          {i > 0 ? <Dots theme={theme} /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: w }}>
            {s.desc ? (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: theme.purple,
                  color: theme.white,
                  borderRadius: 999,
                  padding: '5px 18px',
                  fontSize: 19,
                  fontWeight: 700,
                }}
              >
                {s.desc}
              </div>
            ) : null}
            <IconChip name={iconAt(i, s.icon)} theme={theme} size={84} icon={40} background={theme.chip} />
            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 16.5,
                color: theme.navy,
                lineHeight: 1.35,
                textAlign: 'center',
              }}
            >
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LowerBand({
  items,
  theme,
  data,
}: {
  items: GraphicItem[]
  theme: GraphicTheme
  data: LayoutData
}) {
  // An umbrella brand has no PS | PRODUCT lockup and may have no descriptor
  // either. Drawing the column anyway left a dangling "PS |" separator with
  // nothing after it; with nothing to say, the column goes and the band widens.
  const hasLockup = Boolean(data.product || data.descriptor)
  const labelW = hasLockup ? 300 : 0
  const w = Math.min(stepWidth(items.length, 46) - Math.floor(labelW / Math.max(items.length, 1)), 214)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        // Without the lockup column the steps are narrower than the band, so
        // they must centre rather than cluster against the left edge.
        justifyContent: hasLockup ? 'flex-start' : 'center',
        marginTop: 'auto',
        marginBottom: 34,
        border: `2px solid ${theme.lav2}`,
        borderRadius: 20,
        backgroundColor: theme.white,
        padding: '34px 38px',
      }}
    >
      {hasLockup ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: labelW, paddingRight: 26 }}>
          {data.product ? (
            <div style={{ ...row, fontSize: 38, fontWeight: 700 }}>
              <span style={{ color: theme.navy }}>PS</span>
              <span style={{ color: theme.lav3, margin: '0 12px' }}>|</span>
              <span style={{ color: theme.purple }}>{data.product}</span>
            </div>
          ) : null}
          {data.descriptor ? (
            <div
              style={{
                ...row,
                fontSize: 15,
                fontWeight: 600,
                color: theme.navy,
                letterSpacing: '0.2em',
                marginTop: data.product ? 12 : 0,
              }}
            >
              {data.descriptor}
            </div>
          ) : null}
        </div>
      ) : null}
      {items.map((s, i) => (
        <div key={s.label} style={{ display: 'flex' }}>
          {i > 0 ? (
            <Svg w={40} h={18} vb="0 0 40 18" style={{ marginTop: 42 }}>
              <path d="M2 9 H32" {...st(theme.purple, 2.2)} />
              <path d="M25 3 L32 9 L25 15" {...st(theme.purple, 2.2)} />
            </Svg>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: w }}>
            <IconChip name={iconAt(i, s.icon)} theme={theme} size={76} icon={38} background={theme.lav1} />
            <div style={{ ...row, marginTop: 14, fontSize: 20, fontWeight: 700, color: theme.purple }}>{s.label}</div>
            {s.desc ? (
              <div
                style={{
                  display: 'flex',
                  marginTop: 8,
                  fontSize: 15.5,
                  color: theme.navy,
                  lineHeight: 1.35,
                  textAlign: 'center',
                }}
              >
                {s.desc}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TwoBandCard({ data, theme }: { data: LayoutData; theme: GraphicTheme }) {
  const { upper, lower } = splitBands(data.items)
  return (
    <Frame theme={theme} pad="62px 64px 52px 64px">
      <Deco theme={theme} soft />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Headline theme={theme} lead={data.lead} accent={data.accent} size={46} width={760} />
        <Rule theme={theme} w={150} />
        {data.sub ? (
          <div style={{ ...row, fontSize: 21, color: theme.navy, lineHeight: 1.4, width: 760 }}>
            {clamp(data.sub, 160)}
          </div>
        ) : null}
      </div>

      {upper.length > 0 ? <UpperBand items={upper} theme={theme} /> : null}
      {lower.length > 0 ? <LowerBand items={lower} theme={theme} data={data} /> : null}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logoDataUri()} width={158} height={53} style={{ objectFit: 'contain' }} />
        {data.cta ? (
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            <Cta theme={theme} label={data.cta} size={21} />
          </div>
        ) : null}
      </div>
    </Frame>
  )
}
