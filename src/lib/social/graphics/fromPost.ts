import type { GraphicFields, GraphicStyle } from '@/lib/social/types'
import { THEMES, themeForBrand } from './theme'
import type { RenderArgs } from './render'

/** A social-post doc with brand populated (depth>=1). */
export interface PostForGraphic {
  graphicStyle?: GraphicStyle | null
  graphic?: GraphicFields | null
  brand: { name?: string | null; slug?: string | null } | number | string
}

export function buildGraphicFromPost(post: PostForGraphic): RenderArgs {
  const brand = (typeof post.brand === 'object' && post.brand) || {}
  return {
    style: (post.graphicStyle as GraphicStyle) || 'none',
    fields: (post.graphic as GraphicFields) || {},
    brandName: (brand.name as string) || 'excelENT',
    theme: THEMES[themeForBrand({ slug: (brand.slug as string) || null })],
  }
}
