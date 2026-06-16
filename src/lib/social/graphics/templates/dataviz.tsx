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
