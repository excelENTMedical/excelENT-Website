import { getPayloadClient } from '@/lib/payload'
import { buildCorpus } from './corpus'
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from './prompt'
import { checkGuardrails, norm } from './guardrails'
import { callClaude } from './claude'
import type { BrandConfigForPrompt, CorpusPost, GenerateOptions } from './types'

interface ParsedDraft {
  copy: string
  cta?: string
}

/** Tolerate stray prose or ```json fences around the JSON array. */
export function parseDrafts(text: string): ParsedDraft[] {
  const start = text.indexOf('[')
  if (start === -1) throw new Error('No JSON array in model output')
  let depth = 0
  let end = -1
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) throw new Error('No JSON array in model output')
  const arr = JSON.parse(text.slice(start, end + 1))
  if (!Array.isArray(arr)) throw new Error('Model output was not an array')
  return arr
    .filter((d: unknown): d is { copy: string; cta?: unknown } =>
      Boolean(d) && typeof (d as { copy?: unknown }).copy === 'string')
    .map((d) => ({ copy: String(d.copy).trim(), cta: d.cta ? String(d.cta).trim() : undefined }))
}

export async function generateDrafts(brandId: string, opts: GenerateOptions): Promise<string[]> {
  const payload = await getPayloadClient()

  const brand = await payload.findByID({ collection: 'brand-profiles', id: brandId })
  if (!brand) throw new Error(`Brand ${brandId} not found`)

  const recent = await payload.find({
    collection: 'social-posts',
    where: { brand: { equals: brandId } },
    sort: '-updatedAt',
    limit: 50,
    depth: 0,
  })

  const corpusPosts: CorpusPost[] = recent.docs.map((d: Record<string, any>) => ({
    copy: d.copy,
    cta: d.cta,
    status: d.status,
    reviewerFeedback: d.reviewerFeedback,
    originalCopy: d.generationMeta?.originalCopy,
    theme: d.theme,
    updatedAt: d.updatedAt,
  }))
  const corpus = buildCorpus(corpusPosts)

  const b = brand as Record<string, any>
  const brandConfig: BrandConfigForPrompt = {
    name: b.name,
    voice: b.voice,
    audience: b.audience,
    themes: (b.themes || []).map((t: any) => ({ theme: t.theme, description: t.description })),
    defaultCtas: (b.defaultCtas || []).map((c: any) => c.cta).filter(Boolean),
    bannedTerms: (b.bannedTerms || []).map((x: any) => x.term).filter(Boolean),
    requiredDisclaimers: (b.requiredDisclaimers || []).map((r: any) => r.text).filter(Boolean),
    seedExamples: (b.seedExamples || []).map((s: any) => s.text).filter(Boolean),
  }

  const system = buildSystemPrompt(brandConfig)
  const user = buildUserPrompt(brandConfig, corpus, opts)
  const { text } = await callClaude(system, user)
  const drafts = parseDrafts(text)

  const assetRes = await payload.find({
    collection: 'social-assets',
    where: { brand: { equals: brandId } },
    limit: 50,
    depth: 0,
  })
  const assets = assetRes.docs as Array<Record<string, any>>
  const pickAsset = (): string | number | undefined => {
    const themed = assets.find((a) => (a.tags || []).some((t: any) => norm(t.tag) === norm(opts.theme)))
    return (themed || assets[0])?.id
  }

  const model = process.env.SOCIAL_MODEL || 'claude-sonnet-4-6'
  const created: string[] = []
  for (const d of drafts) {
    const g = checkGuardrails(d.copy, brandConfig.bannedTerms, brandConfig.requiredDisclaimers)
    const assetId = pickAsset()
    const doc = await payload.create({
      collection: 'social-posts',
      data: {
        title: `[${brandConfig.name} · ${opts.platform}] ${[...d.copy].slice(0, 50).join('')}`,
        brand: Number(brandId),
        platform: opts.platform,
        language: opts.language,
        theme: opts.theme,
        copy: d.copy,
        cta: d.cta,
        asset: assetId != null ? Number(assetId) : undefined,
        status: 'draft',
        generationMeta: {
          model,
          promptVersion: PROMPT_VERSION,
          originalCopy: d.copy,
          guardrailFlags: g.ok
            ? ''
            : `banned: ${g.bannedHits.join(', ')}; missing disclaimers: ${g.missingDisclaimers.join(' | ')}`,
        },
      },
    })
    created.push(String(doc.id))
  }
  return created
}
