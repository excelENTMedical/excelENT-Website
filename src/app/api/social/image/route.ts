// src/app/api/social/image/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { buildImagePrompt } from '@/lib/social/image/prompt'
import { loadSeedImageFiles } from '@/lib/social/image/refs'
import { editImage, generateImage } from '@/lib/social/image/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/social/image { postId } → generate an on-brand image, store + attach it. */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  const post = (await payload.findByID({
    collection: 'social-posts',
    id: body.postId,
    depth: 2,
    disableErrors: true,
  })) as any
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const brand =
    typeof post.brand === 'object'
      ? post.brand
      : await payload.findByID({ collection: 'brand-profiles', id: post.brand, depth: 1, disableErrors: true })
  const brandId = typeof post.brand === 'object' ? post.brand.id : post.brand

  const prompt = buildImagePrompt(post, brand || {})

  let png: Buffer
  let usedReferences = false
  try {
    const refs = await loadSeedImageFiles(payload, brand)
    if (refs.length > 0) {
      png = await editImage({ prompt, references: refs })
      usedReferences = true
    } else {
      png = await generateImage({ prompt })
    }
  } catch (err) {
    payload.logger.error({ err }, 'social image generation failed')
    return NextResponse.json({ error: 'generation failed' }, { status: 502 })
  }

  try {
    const asset = await payload.create({
      collection: 'social-assets',
      data: { alt: `${post.title || 'post'} AI image`, brand: brandId, source: 'ai-generated' },
      file: { data: png, mimetype: 'image/png', name: `post-${body.postId}-ai.png`, size: png.length },
    })
    await payload.update({ collection: 'social-posts', id: body.postId, data: { asset: asset.id } })
    return NextResponse.json({ ok: true, assetId: asset.id, usedReferences })
  } catch (err) {
    payload.logger.error({ err }, 'social image save failed')
    return NextResponse.json({ error: 'save failed' }, { status: 500 })
  }
}
