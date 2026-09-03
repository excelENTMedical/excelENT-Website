import React from 'react'
import type { GraphicTheme } from '../theme'
import { Deco, Frame, Headline, Rule, Footer, row } from '../layout/primitives'
import { Check, Cross } from '../layout/icons'
import type { LayoutData } from './shared'
import { clamp } from '../text'

/**
 * CONTRAST — the same items, before and after.
 *
 * Two panels carrying an identical list: crossed out in grey on the left,
 * checked in purple on the right. The structure is the argument — nothing
 * about the items changes, only what happens to them.
 *
 * Item rows supply the list; `statLabel` and `statFrom`/`statTo` name the two
 * panels when given, so the wording stays with the post rather than the code.
 */
export function ContrastCard({ data, theme }: { data: LayoutData; theme: GraphicTheme }) {
  const items = data.items.slice(0, 5)
  const leftTitle = (data.statFrom || 'BEFORE').toUpperCase()
  const rightTitle = (data.statTo || 'AFTER').toUpperCase()
  // A `left || right` note gives each panel its own line; a single note goes
  // to the left panel only. Clamp per half — clamping the pair as one string
  // truncated the right-hand note mid-sentence.
  const [leftNote, rightNote] = (data.sub || '').split('||').map((s) => clamp(s.trim(), 150))

  return (
    <Frame theme={theme}>
      <Deco theme={theme} soft />

      <Headline theme={theme} lead={data.lead} accent={data.accent} size={62} width={900} />
      <Rule theme={theme} />

      <div style={{ display: 'flex', marginTop: 'auto', marginBottom: 'auto', paddingTop: 40 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 636,
            backgroundColor: '#f2f3f6',
            border: `2px solid ${theme.grey}`,
            borderRadius: 20,
            padding: '28px 32px 30px',
          }}
        >
          <div style={{ ...row, fontSize: 15, fontWeight: 700, color: theme.mute, letterSpacing: '0.18em' }}>
            {leftTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22 }}>
            {items.map((it) => (
              <div key={it.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Cross theme={theme} />
                <div style={{ ...row, marginLeft: 16, fontSize: 21, color: theme.mute }}>{it.label}</div>
              </div>
            ))}
          </div>
          {leftNote ? (
            <div style={{ ...row, marginTop: 12, fontSize: 21, fontWeight: 600, color: theme.mute, lineHeight: 1.4 }}>
              {leftNote}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 636,
            marginLeft: 24,
            backgroundColor: theme.white,
            border: `3px solid ${theme.purple}`,
            borderRadius: 20,
            padding: '28px 32px 30px',
          }}
        >
          <div style={{ ...row, fontSize: 15, fontWeight: 700, color: theme.purple, letterSpacing: '0.18em' }}>
            {rightTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22 }}>
            {items.map((it) => (
              <div key={it.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: theme.purple,
                  }}
                >
                  <Check theme={theme} />
                </div>
                <div style={{ ...row, marginLeft: 15, fontSize: 21, color: theme.navy }}>{it.label}</div>
              </div>
            ))}
          </div>
          {rightNote ? (
            <div style={{ ...row, marginTop: 12, fontSize: 21, fontWeight: 600, color: theme.navy, lineHeight: 1.4 }}>
              {rightNote}
            </div>
          ) : null}
        </div>
      </div>

      <Footer theme={theme} product={data.product} descriptor={data.descriptor} cta={data.cta} />
    </Frame>
  )
}
