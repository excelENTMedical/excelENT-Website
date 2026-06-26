export interface PromptPost {
  copy?: string
  theme?: string | null
  cta?: string | null
  title?: string | null
}
export interface PromptBrand {
  name?: string | null
  imageStyleGuidance?: string | null
}

/** Build a descriptive prompt for an on-brand social post image. Pure. */
export function buildImagePrompt(post: PromptPost, brand: PromptBrand): string {
  const lines: string[] = []
  lines.push('Create a single social media post image for a healthcare / medical-technology brand.')
  if (brand?.name) lines.push(`Brand: ${brand.name}.`)
  if (post?.theme) lines.push(`Topic / theme: ${post.theme}.`)
  const intent = (post?.copy || '').trim().replace(/\s+/g, ' ').slice(0, 400)
  if (intent) lines.push(`The post is about: ${intent}`)
  if (brand?.imageStyleGuidance) lines.push(`Visual style guidance: ${brand.imageStyleGuidance.trim()}`)
  lines.push('Match the visual style, palette, and composition of the reference images provided.')
  lines.push('Clean, professional, on-brand. No text overlays, no logos, no watermarks, no real-person likenesses.')
  return lines.join('\n')
}
