/**
 * Exports the PS | PRODUCT lockups as standalone, reusable files.
 *
 * The lockup is normally drawn as part of a social graphic by the `Lockup`
 * primitive. This renders that same component on its own canvas through
 * satori — the identical engine next/og uses — so the exported mark is the
 * mark that ships on the graphics, not a redrawn copy.
 *
 * Text is outlined to paths, so the SVGs need no font installed to render.
 *
 * Run: node --import tsx scripts/export-lockups.tsx
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import satori from 'satori'
import sharp from 'sharp'
import { Lockup } from '../src/lib/social/graphics/layout/primitives'
import { THEMES } from '../src/lib/social/graphics/theme'
import { lockupForBrand } from '../src/lib/social/graphics/brands'
import { loadFonts } from '../src/lib/social/graphics/fonts'

/** Production draws the lockup at size 40; the descriptor metrics are fixed px,
 *  so exporting at any other size would change the proportions. */
const SIZE = 40
const CANVAS = { w: 1400, h: 400 }
const PNG_WIDTHS = [512, 1024, 2048]
const OUT = join(process.cwd(), 'brand/lockups')

const BRANDS = ['ps-rcm', 'ps-lexi', 'ps-connect'] as const

const fonts = loadFonts().map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }))
const theme = THEMES.b2b

async function render(product: string, descriptor: string | null): Promise<string> {
  const el = (
    <div
      style={{
        display: 'flex',
        width: CANVAS.w,
        height: CANVAS.h,
        padding: 40,
        alignItems: 'flex-start',
        fontFamily: 'Cabin',
      }}
    >
      <Lockup theme={theme} product={product} descriptor={descriptor} size={SIZE} />
    </div>
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = await satori(el as any, { width: CANVAS.w, height: CANVAS.h, fonts: fonts as any })
  return crop(svg)
}

/**
 * Satori sizes the SVG to the canvas, so the mark floats inside a large
 * transparent box. Rasterise once, let sharp find the ink, and rewrite the
 * viewBox to that rectangle — the path coordinates are absolute, so moving
 * the viewBox crops without touching the geometry.
 */
async function crop(svg: string): Promise<string> {
  const flat = await sharp(Buffer.from(svg)).png().toBuffer()
  const { info } = await sharp(flat).trim({ threshold: 0 }).toBuffer({ resolveWithObject: true })
  const x = -(info.trimOffsetLeft ?? 0)
  const y = -(info.trimOffsetTop ?? 0)
  return svg.replace(
    /^<svg[^>]*?>/,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}" viewBox="${x} ${y} ${info.width} ${info.height}">`,
  )
}

async function write(name: string, raw: string) {
  // Satori names its masks `satori_*`. Two of these SVGs inlined in the same
  // HTML document would collide on those ids, so namespace them per file.
  const svg = raw.replace(/satori_/g, `${name.replace(/-/g, '_')}_`)
  writeFileSync(join(OUT, `${name}.svg`), svg)
  const box = svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/)
  const [w, h] = [Number(box?.[1]), Number(box?.[2])]
  for (const target of PNG_WIDTHS) {
    const png = await sharp(Buffer.from(svg), { density: Math.round(72 * (target / w)) })
      .resize({ width: target })
      .png()
      .toBuffer()
    writeFileSync(join(OUT, `${name}-${target}w.png`), png)
  }
  console.log(`${name}  ${Math.round(w)}×${Math.round(h)}  svg + ${PNG_WIDTHS.length} png`)
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  for (const slug of BRANDS) {
    const lock = lockupForBrand(slug)
    if (!lock.product) throw new Error(`${slug} has no product wordmark`)
    await write(`${slug}-lockup`, await render(lock.product, lock.descriptor))
    await write(`${slug}-wordmark`, await render(lock.product, null))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
