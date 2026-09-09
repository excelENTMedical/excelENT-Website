/**
 * Re-render a post's graphic through the v4 pipeline and attach it, exactly as
 * POST /api/social/graphic does. Use after a template fix, or to replace an
 * old OpenAI illustration with the layout the post's fields describe.
 *
 * Run: node --import tsx scripts/regen-graphics.mts 24 95
 */
import { readFileSync } from 'node:fs'
for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const ids = process.argv.slice(2).map(Number).filter(Boolean)
if (!ids.length) { console.error('usage: regen-graphics.mts <postId...>'); process.exit(1) }

const { getPayload } = await import('payload')
const configMod = await import('../src/payload.config')
const payload = await getPayload({ config: configMod.default })
const { buildGraphicFromPost } = await import('../src/lib/social/graphics/fromPost')
const { renderGraphic } = await import('../src/lib/social/graphics/render')

for (const id of ids) {
  const post: any = await payload.findByID({ collection: 'social-posts', id, depth: 1, disableErrors: true })
  if (!post) { console.log(`#${id}: not found`); continue }
  const png = await renderGraphic(buildGraphicFromPost(post))
  const brandId = typeof post.brand === 'object' ? post.brand?.id : post.brand
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const asset = await payload.create({
    collection: 'social-assets',
    data: { alt: `${post.title || 'post'} graphic`, brand: brandId, source: 'ai-generated' },
    file: { data: png, mimetype: 'image/png', name: `post-${id}-${post.graphicStyle}-${stamp}.png`, size: png.length },
  })
  await payload.update({ collection: 'social-posts', id, data: { asset: asset.id } })
  console.log(`#${id}: ${post.graphicStyle} -> asset ${asset.id} (${asset.filename}, ${asset.width}x${asset.height})`)
}
process.exit(0)
