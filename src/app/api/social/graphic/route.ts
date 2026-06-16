import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderGraphic, GRAPHIC_SIZE } from '@/lib/social/graphics/render'
import { buildGraphicFromPost, type PostForGraphic } from '@/lib/social/graphics/fromPost'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/social/graphic?postId=123 → live PNG preview. */
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('postId')
  if (!id) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({ collection: 'social-posts', id, depth: 1 })) as unknown as PostForGraphic
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const png = await renderGraphic(buildGraphicFromPost(post))
  return new NextResponse(png as unknown as BodyInit, {
    headers: { 'content-type': 'image/png', 'cache-control': 'no-store' },
  })
}

/** POST /api/social/graphic { postId } → render, store as a Social Asset, link it. */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }) }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 1 })) as any
  const png = await renderGraphic(buildGraphicFromPost(post as PostForGraphic))
  const brandId = typeof post.brand === 'object' ? post.brand.id : post.brand

  const asset = await payload.create({
    collection: 'social-assets',
    data: { alt: `${post.title || 'post'} graphic`, brand: brandId, source: 'ai-generated' },
    file: { data: png, mimetype: 'image/png', name: `post-${body.postId}-${post.graphicStyle || 'none'}.png`, size: png.length },
  })

  await payload.update({ collection: 'social-posts', id: body.postId, data: { asset: asset.id } })
  return NextResponse.json({ ok: true, assetId: asset.id })
}
