import path from 'node:path'
import { readFile } from 'node:fs/promises'

export interface SeedFile {
  buffer: Buffer
  filename: string
  mimetype: string
}

const DEFAULT_BASE = path.join(process.cwd(), 'public', 'social-assets')

/**
 * Resolve a brand's seedImages to on-disk reference files for the image model.
 * Accepts populated relationship objects or raw ids. Caps at `max`. Never throws
 * on a single unreadable file — it logs and skips.
 */
export async function loadSeedImageFiles(
  payload: any,
  brand: any,
  opts: { max?: number; baseDir?: string } = {},
): Promise<SeedFile[]> {
  const max = opts.max ?? (Number(process.env.OPENAI_IMAGE_MAX_REFS) || 4)
  const baseDir = opts.baseDir ?? DEFAULT_BASE
  const seeds = Array.isArray(brand?.seedImages) ? brand.seedImages : []
  const out: SeedFile[] = []
  for (const s of seeds) {
    if (out.length >= max) break
    let asset: any = s
    if (typeof s !== 'object' || s == null) {
      asset = await payload.findByID({ collection: 'social-assets', id: s, disableErrors: true })
    }
    const filename = asset?.filename
    if (!filename) continue
    try {
      const buffer = await readFile(path.join(baseDir, filename))
      out.push({ buffer, filename, mimetype: asset.mimeType || 'image/png' })
    } catch (err) {
      payload?.logger?.warn?.({ err, filename }, 'seed image file unreadable')
    }
  }
  return out
}
