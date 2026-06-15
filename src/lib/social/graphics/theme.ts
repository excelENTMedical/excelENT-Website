export type ThemeName = 'b2b' | 'patient'

/** Tokens mirrored from src/app/tokens.css — the renderer's source of truth. */
export interface GraphicTheme {
  navy: string
  purple: string
  ink: string
  ink2: string
  surface: string
  white: string
  navyLabel: string
  navySub: string
  barHi: string
}

const SHARED = {
  navy: '#061b42',
  purple: '#89007a',
  ink: '#18181b',
  ink2: '#52525b',
  white: '#ffffff',
  navyLabel: '#9fb3d8',
  navySub: '#c7d4ea',
  barHi: '#9aa3af',
}

export const THEMES: Record<ThemeName, GraphicTheme> = {
  b2b: { ...SHARED, surface: '#fafafa' },
  patient: { ...SHARED, surface: '#ffffff' },
}

/** Pick a theme from the brand profile. Patient brands → patient, else b2b. */
export function themeForBrand(brand: { slug?: string | null }): ThemeName {
  return (brand.slug || '').includes('patient') ? 'patient' : 'b2b'
}
