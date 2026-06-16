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
