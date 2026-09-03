import React from 'react'
import type { GraphicTheme } from '../theme'
import { Svg, st } from './primitives'

export interface IconProps {
  theme: GraphicTheme
  size?: number
}

/** Line icons, two-tone: navy structure with a purple detail. */
const ICONS = {
  phone: (t: GraphicTheme) => [
    <path
      key="a"
      d="M6.5 3.5 H10 L11.5 8 L9 9.75 C10 12.25 11.75 14 14.25 15 L16 12.5 L20.5 14 V17.5 C20.5 19 19.5 20 18 20 C10 19.5 4.5 14 4 6 C4 4.5 5 3.5 6.5 3.5 Z"
      {...st(t.navy)}
    />,
  ],
  search: (t: GraphicTheme) => [
    <circle key="a" cx="10.5" cy="10.5" r="6.5" {...st(t.navy)} />,
    <path key="b" d="M15.5 15.5 L21 21" {...st(t.purple)} />,
  ],
  list: (t: GraphicTheme) => [
    <path key="a" d="M4 6 H20" {...st(t.navy)} />,
    <path key="b" d="M4 12 H20" {...st(t.navy)} />,
    <path key="c" d="M4 18 H14" {...st(t.purple)} />,
  ],
  clock: (t: GraphicTheme) => [
    <circle key="a" cx="12" cy="12" r="8.5" {...st(t.navy)} />,
    <path key="b" d="M12 7.5 V12 L15 14.5" {...st(t.purple)} />,
  ],
  exit: (t: GraphicTheme) => [
    <path key="a" d="M14 4 H19 V20 H14" {...st(t.navy)} />,
    <path key="b" d="M4 12 H14" {...st(t.purple)} />,
    <path key="c" d="M9.5 7.5 L14 12 L9.5 16.5" {...st(t.purple)} />,
  ],
  shield: (t: GraphicTheme) => [
    <path key="a" d="M12 2.5 L20 6 V12 C20 17 12 21.5 12 21.5 C12 21.5 4 17 4 12 V6 Z" {...st(t.navy)} />,
    <path key="b" d="M8.6 11.8 L11 14.2 L15.4 9.4" {...st(t.purple)} />,
  ],
  pin: (t: GraphicTheme) => [
    <path key="a" d="M12 21.5 C12 21.5 19 14.5 19 9.5 A7 7 0 0 0 5 9.5 C5 14.5 12 21.5 12 21.5 Z" {...st(t.navy)} />,
    <circle key="b" cx="12" cy="9.5" r="2.4" {...st(t.purple)} />,
  ],
  calendar: (t: GraphicTheme) => [
    <path key="a" d="M4 5.5 H20 V20 H4 Z" {...st(t.navy)} />,
    <path key="b" d="M4 10 H20" {...st(t.navy)} />,
    <path key="c" d="M8.5 3 V7" {...st(t.purple)} />,
    <path key="d" d="M15.5 3 V7" {...st(t.purple)} />,
  ],
  chart: (t: GraphicTheme) => [
    <path key="a" d="M4 20 V10" {...st(t.navy)} />,
    <path key="b" d="M10 20 V4" {...st(t.navy)} />,
    <path key="c" d="M16 20 V13" {...st(t.purple)} />,
    <path key="d" d="M2 20 H22" {...st(t.navy)} />,
  ],
  users: (t: GraphicTheme) => [
    <circle key="a" cx="9" cy="8" r="3.4" {...st(t.navy)} />,
    <path key="b" d="M2.6 20 C2.6 16 5.6 14 9 14 C12.4 14 15.4 16 15.4 20" {...st(t.navy)} />,
    <path key="c" d="M16 5 A3.5 3.5 0 0 1 16 12" {...st(t.purple)} />,
    <path key="d" d="M18 14.5 C20.5 15.5 21.5 17.5 21.5 20" {...st(t.purple)} />,
  ],
  doc: (t: GraphicTheme) => [
    <path key="a" d="M6 3 H14 L19 8 V21 H6 Z" {...st(t.navy)} />,
    <path key="b" d="M14 3 V8 H19" {...st(t.navy)} />,
    <path key="c" d="M9 13 H16" {...st(t.purple)} />,
    <path key="d" d="M9 17 H14" {...st(t.purple)} />,
  ],
  code: (t: GraphicTheme) => [
    <path key="a" d="M9 6.5 L4 12 L9 17.5" {...st(t.purple)} />,
    <path key="b" d="M15 6.5 L20 12 L15 17.5" {...st(t.navy)} />,
    <path key="c" d="M13.2 4.5 L10.8 19.5" {...st(t.purple)} />,
  ],
} as const

export type IconName = keyof typeof ICONS

export const ICON_NAMES = Object.keys(ICONS) as IconName[]

export function isIconName(s: string | null | undefined): s is IconName {
  return ICON_NAMES.includes((s || '') as IconName)
}

/** Icons used, in order, when a row does not name one. */
const DEFAULT_CYCLE: IconName[] = ['code', 'shield', 'users', 'calendar', 'chart']

export function iconAt(index: number, named?: string | null): IconName {
  if (isIconName(named)) return named
  return DEFAULT_CYCLE[index % DEFAULT_CYCLE.length]
}

export function Icon({ name, theme, size = 50 }: IconProps & { name: IconName }) {
  return (
    <Svg w={size} h={size} vb="0 0 24 24">
      {ICONS[name](theme)}
    </Svg>
  )
}

/** A circular chip with an icon inside — the step-row and orbit motif. */
export function IconChip({
  name,
  theme,
  size = 108,
  icon = 50,
  background,
  border,
}: IconProps & { name: IconName; icon?: number; background?: string; border?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background || theme.chip,
        ...(border ? { border } : {}),
      }}
    >
      <Icon name={name} theme={theme} size={icon} />
    </div>
  )
}

export function Cross({ theme, size = 26 }: IconProps) {
  return (
    <Svg w={size} h={size} vb="0 0 24 24">
      <path d="M7 7 L17 17" {...st(theme.mute, 2.6)} />
      <path d="M17 7 L7 17" {...st(theme.mute, 2.6)} />
    </Svg>
  )
}

export function Check({ theme, size = 26 }: IconProps) {
  return (
    <Svg w={size} h={size} vb="0 0 24 24">
      <path d="M6 12.5 L10 16.5 L18 8" {...st(theme.white, 3)} />
    </Svg>
  )
}
