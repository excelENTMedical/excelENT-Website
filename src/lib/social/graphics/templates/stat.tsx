import type { GraphicFields } from '@/lib/social/types'
import type { GraphicTheme } from '../theme'
import { clamp } from '../text'

export interface StatData { label: string; from: string; to: string; sub: string; brand: string }

export function prepareStat(fields: GraphicFields, brandName: string): StatData {
  return {
    label: (fields.statLabel || '').trim(),
    from: (fields.statFrom || '').trim(),
    to: (fields.statTo || '').trim(),
    sub: clamp(fields.subtext || '', 120),
    brand: brandName,
  }
}

export function StatCard({ data, theme }: { data: StatData; theme: GraphicTheme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', height: '100%', padding: '84px 80px', backgroundColor: theme.navy }}>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 600, fontSize: 30,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.navyLabel }}>{data.label}</div>
      <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Montserrat', fontWeight: 800,
        fontSize: 150, letterSpacing: '-0.03em', color: theme.white }}>
        <span>{data.from}</span>
        <span style={{ color: theme.purple, margin: '0 32px', fontSize: 120 }}>→</span>
        <span>{data.to}</span>
      </div>
      <div style={{ display: 'flex', fontFamily: 'Cabin', fontWeight: 400, fontSize: 34,
        lineHeight: 1.35, color: theme.navySub, maxWidth: '90%' }}>{data.sub}</div>
      <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 34,
        letterSpacing: '0.02em', color: theme.white }}>{data.brand}</div>
    </div>
  )
}
