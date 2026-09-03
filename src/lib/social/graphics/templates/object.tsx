import React from 'react'
import type { GraphicTheme } from '../theme'
import { Deco, Frame, Headline, Rule, Svg, Arrow, Lockup, Cta, row, st } from '../layout/primitives'
import { IconChip, iconAt } from '../layout/icons'
import type { LayoutData } from './shared'
import { hasStatPair } from './shared'
import { clamp } from '../text'

/**
 * OBJECT — a single artefact with a number attached.
 *
 * Chosen when the post is about one thing that went wrong or right: a claim,
 * a document, a record. The artefact is illustrated at the right; the headline
 * and the checks that act on it run down the left.
 */

/** The stacked claim sheets, the DENIED stamp, the shield, and the stat card. */
function Artefact({ theme, d }: { theme: GraphicTheme; d: LayoutData }) {
  const Line = ({ w, t }: { w: number; t: number }) => (
    <div style={{ display: 'flex', width: w, height: 13, borderRadius: 7, backgroundColor: theme.paper, marginTop: t }} />
  )
  const sheet = (rot: number, x: number, y: number, op: number): React.CSSProperties => ({
    position: 'absolute',
    left: x,
    top: y,
    width: 360,
    height: 470,
    backgroundColor: theme.white,
    borderRadius: 14,
    opacity: op,
    transform: `rotate(${rot}deg)`,
    display: 'flex',
    boxShadow: '0 18px 40px rgba(6,27,66,.10)',
  })

  return (
    <div style={{ position: 'absolute', left: 950, top: 118, width: 560, height: 640, display: 'flex' }}>
      <div style={sheet(-7, 26, 26, 0.55)} />
      <div style={sheet(-3.5, 14, 13, 0.8)} />
      <div style={{ ...sheet(0, 0, 0, 1), flexDirection: 'column', padding: '30px 30px 0 30px' }}>
        {d.artefactLabel ? (
          <div style={{ ...row, fontSize: 27, fontWeight: 700, color: theme.lav3, letterSpacing: '0.06em' }}>
            {d.artefactLabel.toUpperCase()}
          </div>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: d.artefactLabel ? 22 : 0 }}>
          {[286, 250, 286, 196, 270, 286, 228, 286].map((w, i) => (
            <Line key={i} w={w} t={i === 0 ? 0 : 16} />
          ))}
        </div>
      </div>

      {d.artefactStamp ? (
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 292,
            transform: 'rotate(-9deg)',
            display: 'flex',
            border: `6px solid ${theme.purple}`,
            borderRadius: 10,
            padding: '10px 26px',
            backgroundColor: 'rgba(255,255,255,0.86)',
          }}
        >
          <div style={{ ...row, fontSize: 46, fontWeight: 700, color: theme.purple, letterSpacing: '0.04em' }}>
            {d.artefactStamp.toUpperCase()}
          </div>
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: 342, top: 62, display: 'flex' }}>
        <Svg w={132} h={150} vb="0 0 44 50">
          <path d="M22 1.5 L41 9 V25 C41 37 22 48 22 48 C22 48 3 37 3 25 V9 Z" fill={theme.deep} />
          <path
            d="M13.5 24.5 L19.5 30.5 L31 18.5"
            fill="none"
            stroke={theme.white}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </div>

      {hasStatPair(d) ? (
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 398,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.white,
            borderRadius: 14,
            padding: '20px 30px 22px',
            boxShadow: '0 16px 40px rgba(6,27,66,.14)',
          }}
        >
          {d.statLabel ? (
            <div style={{ ...row, fontSize: 15, fontWeight: 700, color: theme.navy, letterSpacing: '0.13em' }}>
              {d.statLabel.toUpperCase()}
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginRight: 20 }}>
              <div style={{ display: 'flex', width: 17, height: 58, borderRadius: 3, backgroundColor: theme.lav3 }} />
              <div
                style={{ display: 'flex', width: 17, height: 14, borderRadius: 3, backgroundColor: theme.purple, marginLeft: 7 }}
              />
            </div>
            <div style={{ ...row, fontSize: 31, fontWeight: 700, color: theme.lav3 }}>{d.statFrom}</div>
            <Svg w={38} h={20} vb="0 0 38 20" style={{ margin: '0 12px 9px 12px' }}>
              <path d="M2 10 H30" {...st(theme.navy, 2.4)} />
              <path d="M23 4 L30 10 L23 16" {...st(theme.navy, 2.4)} />
            </Svg>
            <div style={{ ...row, fontSize: 46, fontWeight: 700, color: theme.purple, lineHeight: 1 }}>{d.statTo}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ObjectCard({ data, theme }: { data: LayoutData; theme: GraphicTheme }) {
  return (
    <Frame theme={theme} pad="76px 72px 62px 72px">
      <Deco theme={theme} />
      <Artefact theme={theme} d={data} />

      <div style={{ display: 'flex', flexDirection: 'column', width: 830 }}>
        <Headline theme={theme} lead={data.lead} accent={data.accent} size={74} width={830} />
        <Rule theme={theme} w={210} />
        {data.sub ? (
          <div style={{ ...row, fontSize: 27, color: theme.navy, lineHeight: 1.42, width: 800 }}>
            {clamp(data.sub, 160)}
          </div>
        ) : null}
      </div>

      {data.items.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 108 }}>
          {data.items.slice(0, 3).map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {i > 0 ? <Arrow theme={theme} /> : null}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 232 }}>
                <IconChip name={iconAt(i, s.icon)} theme={theme} />
                <div
                  style={{
                    display: 'flex',
                    marginTop: 20,
                    fontSize: 21,
                    fontWeight: 700,
                    color: theme.navy,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {s.label}
                </div>
                {s.desc ? (
                  <div
                    style={{
                      display: 'flex',
                      marginTop: 13,
                      fontSize: 19,
                      color: theme.navy,
                      lineHeight: 1.4,
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
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
        <Lockup theme={theme} product={data.product} descriptor={data.descriptor} size={44} />
        {data.cta ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', width: 2, height: 84, backgroundColor: theme.grey, marginRight: 44 }} />
            <Cta theme={theme} label={data.cta} size={24} />
          </div>
        ) : null}
      </div>
    </Frame>
  )
}
