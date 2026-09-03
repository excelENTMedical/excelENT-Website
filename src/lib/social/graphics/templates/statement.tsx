import React from 'react'
import type { GraphicTheme } from '../theme'
import { Deco, Frame, Rule, Lockup, Cta, row } from '../layout/primitives'
import type { LayoutData } from './shared'
import { clamp } from '../text'

/**
 * STATEMENT — a claim with nothing to enumerate.
 *
 * No icons, no panels, no list. The typography is the artwork, with a
 * concentric target as the only device. A post that makes one claim should not
 * be dressed up with a process row it does not have.
 *
 * Headline size steps down as the claim gets longer so a two-line statement
 * still fills the frame and a four-line one still fits it.
 */
function headlineSize(lead: string, accent: string): number {
  const longest = Math.max(lead.length, accent.length)
  if (longest <= 16) return 104
  if (longest <= 24) return 86
  if (longest <= 34) return 72
  return 60
}

export function StatementCard({ data, theme }: { data: LayoutData; theme: GraphicTheme }) {
  const size = headlineSize(data.lead, data.accent)
  const badge = (data.statTo || data.statLabel || '').trim()
  const badgeSub = (data.statFrom || '').trim()

  return (
    <Frame theme={theme} pad="0">
      <Deco theme={theme} soft />

      <svg width={1536} height={1024} viewBox="0 0 1536 1024" style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx="1290" cy="512" r="330" fill={theme.lav1} />
        <circle cx="1290" cy="512" r="248" fill={theme.lav2} />
        <circle cx="1290" cy="512" r="172" fill={theme.purple} />
      </svg>

      {badge ? (
        <div
          style={{
            position: 'absolute',
            left: 1180,
            top: 434,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 220,
          }}
        >
          <div style={{ ...row, fontSize: 62, fontWeight: 700, color: theme.white, lineHeight: 1 }}>{badge}</div>
          {badgeSub ? (
            <div style={{ ...row, fontSize: 15, fontWeight: 600, color: theme.lav2, letterSpacing: '0.2em', marginTop: 10 }}>
              {badgeSub}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 72px',
          marginTop: 'auto',
          marginBottom: 'auto',
          width: 1000,
        }}
      >
        {data.lead ? (
          <div style={{ ...row, fontSize: size, fontWeight: 700, color: theme.navy, lineHeight: 1.02 }}>{data.lead}</div>
        ) : null}
        {data.accent ? (
          <div style={{ ...row, fontSize: size, fontWeight: 700, color: theme.purple, lineHeight: 1.02 }}>
            {data.accent}
          </div>
        ) : null}
        <Rule theme={theme} w={240} />
        {data.sub ? (
          <div style={{ ...row, fontSize: 30, color: theme.navy, lineHeight: 1.4, width: 760 }}>
            {clamp(data.sub, 160)}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 72px 58px 72px' }}>
        <Lockup theme={theme} product={data.product} descriptor={data.descriptor} />
        {data.cta ? (
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            <Cta theme={theme} label={data.cta} size={22} />
          </div>
        ) : null}
      </div>
    </Frame>
  )
}
