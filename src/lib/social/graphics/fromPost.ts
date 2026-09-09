import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import { THEMES, themeForBrand } from './theme'
import type { RenderArgs } from './render'

/** A social-post doc with brand populated (depth>=1). */
export interface PostForGraphic {
  graphicStyle?: GraphicStyle | null
  graphic?: GraphicFields | null
  cta?: string | null
  // A depth:1 relationship comes back populated, id included; depth:0 leaves the id itself.
  brand: { id?: number | string; name?: string | null; slug?: string | null } | number | string
}

export function buildGraphicFromPost(post: PostForGraphic): RenderArgs {
  const brand = (typeof post.brand === 'object' && post.brand) || {}
  const slug = (brand.slug as string) || null
  return {
    style: (post.graphicStyle as GraphicStyle) || 'none',
    fields: (post.graphic as GraphicFields) || {},
    brandName: (brand.name as string) || 'excelENT',
    brandSlug: slug,
    cta: post.cta || null,
    theme: THEMES[themeForBrand({ slug })],
  }
}
