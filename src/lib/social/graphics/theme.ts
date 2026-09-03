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
  /* Support ramp — type, rules, and object shading. */
  deep: string
  grey: string
  mute: string
  /* Illustration tier — DECORATION ONLY. Background ribbons, icon circles,
     object shading, chart fills. Never type, buttons, the logo, or the
     PS | PRODUCT lockup. See the `image_style_guidance` on every brand
     profile: these two lavenders are the only approved lavender use, and
     they do not appear on excelentmedical.com. */
  lav1: string
  lav2: string
  lav3: string
  chip: string
  paper: string
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
  deep: '#6d0062',
  grey: '#e4e4e7',
  mute: '#8a93a6',
  lav1: '#edeffb',
  lav2: '#c8cdf3',
  lav3: '#919be7',
  chip: '#dde2f8',
  paper: '#d5daf5',
}

export const THEMES: Record<ThemeName, GraphicTheme> = {
  b2b: { ...SHARED, surface: '#fafafa' },
  patient: { ...SHARED, surface: '#ffffff' },
}

/** Pick a theme from the brand profile. Patient brands → patient, else b2b. */
export function themeForBrand(brand: { slug?: string | null }): ThemeName {
  return (brand.slug || '').includes('patient') ? 'patient' : 'b2b'
}
