import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderGraphic } from '@/lib/social/graphics/render'
import { buildGraphicFromPost, type PostForGraphic } from '@/lib/social/graphics/fromPost'
import { renderAndAttachGraphic } from '@/lib/social/graphics/attach'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/social/graphic?postId=123 → live PNG preview. */
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('postId')
  if (!id) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({
    collection: 'social-posts', id, depth: 1, disableErrors: true,
  })) as unknown as PostForGraphic | null
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  try {
    const png = await renderGraphic(buildGraphicFromPost(post))
    return new NextResponse(png as unknown as BodyInit, {
      headers: { 'content-type': 'image/png', 'cache-control': 'no-store' },
    })
  } catch (err) {
    payload.logger.error({ err }, 'social graphic render failed')
    return NextResponse.json({ error: 'render failed' }, { status: 500 })
  }
}

/** POST /api/social/graphic { postId } → render, store as a Social Asset, link it. */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }) }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({
    collection: 'social-posts', id: body.postId, depth: 1, disableErrors: true,
  })) as any
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  try {
    const { assetId } = await renderAndAttachGraphic(payload, body.postId)
    return NextResponse.json({ ok: true, assetId })
  } catch (err) {
    payload.logger.error({ err }, 'social graphic save failed')
    return NextResponse.json({ error: 'save failed' }, { status: 500 })
  }
}
