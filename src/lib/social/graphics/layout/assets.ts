import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let logoCache: string | null = null

/**
 * The excelENT logo as a data URI. Satori cannot fetch over the network, so
 * the file is inlined. Read once and cached for the life of the process.
 */
export function logoDataUri(): string {
  if (logoCache) return logoCache
  const buf = readFileSync(join(process.cwd(), 'public/images/logo.png'))
  logoCache = `data:image/png;base64,${buf.toString('base64')}`
  return logoCache
}
