import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type FontWeight = 400 | 600 | 700 | 800

export interface LoadedFont {
  name: 'Cabin' | 'Montserrat'
  data: Buffer
  weight: FontWeight
  style: 'normal'
}

const DIR = join(process.cwd(), 'src/lib/social/graphics/fonts')

const SPECS: Array<{ name: LoadedFont['name']; file: string; weight: FontWeight }> = [
  { name: 'Cabin', file: 'Cabin-Regular.ttf', weight: 400 },
  { name: 'Cabin', file: 'Cabin-SemiBold.ttf', weight: 600 },
  { name: 'Cabin', file: 'Cabin-Bold.ttf', weight: 700 },
  { name: 'Montserrat', file: 'Montserrat-SemiBold.ttf', weight: 600 },
  { name: 'Montserrat', file: 'Montserrat-Bold.ttf', weight: 700 },
  { name: 'Montserrat', file: 'Montserrat-ExtraBold.ttf', weight: 800 },
]

let cache: LoadedFont[] | null = null

/** Read the bundled TTFs once; shaped for next/og's `fonts` option. */
export function loadFonts(): LoadedFont[] {
  if (cache) return cache
  cache = SPECS.map((s) => ({
    name: s.name,
    weight: s.weight,
    style: 'normal' as const,
    data: readFileSync(join(DIR, s.file)),
  }))
  return cache
}
