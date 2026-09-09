import type { Payload } from 'payload'
import { renderGraphic } from './render'
import { buildGraphicFromPost, type PostForGraphic } from './fromPost'

/**
 * Whether a post's attached image should be replaced when its graphic fields change.
 *
 * A machine render is a pure function of those fields, so once they move it is
 * stale by definition. A human upload is not — someone chose that picture, and a
 * revision to the graphic copy must never clobber it. `source` is the only thing
 * that distinguishes them, and the render path stamps 'ai-generated'.
 *
 * Nothing attached means nothing to refresh: the preview falls back to a live
 * render, so the reviewer already sees the revision.
 */
export function shouldReplaceAsset(
  asset: { source?: string | null } | null | undefined,
): boolean {
  return Boolean(asset && asset.source === 'ai-generated')
}

/**
 * Render a post's graphic and attach it, replacing whatever was there.
 *
 * The single owner of this sequence. It was inline in POST /api/social/graphic,
 * and a revision that changed the layout left the old PNG attached because
 * nothing else called it.
 */
export async function renderAndAttachGraphic(
  payload: Payload,
  postId: string | number,
): Promise<{ assetId: number | string; filename: string | null | undefined }> {
  const post = (await payload.findByID({
    collection: 'social-posts',
    id: postId,
    depth: 1,
  })) as unknown as PostForGraphic & Record<string, any>

  const png = await renderGraphic(buildGraphicFromPost(post))
  const rawBrand = typeof post.brand === 'object' ? post.brand?.id : post.brand
  const brandId = rawBrand == null ? null : Number(rawBrand)
  // Second-resolution stamp: regenerating twice in a day otherwise collides and
  // Payload silently suffixes the filename.
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)

  const asset = await payload.create({
    collection: 'social-assets',
    data: {
      alt: `${post.title || 'post'} graphic`,
      brand: brandId,
      source: 'ai-generated',
    },
    file: {
      data: png,
      mimetype: 'image/png',
      name: `post-${postId}-${post.graphicStyle || 'none'}-${stamp}.png`,
      size: png.length,
    },
  })

  await payload.update({ collection: 'social-posts', id: postId, data: { asset: asset.id } })
  return { assetId: asset.id, filename: asset.filename }
}
