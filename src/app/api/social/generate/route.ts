import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateDrafts } from '@/lib/social/generate'
import type { Platform, Language } from '@/lib/social/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const brandId = body.brand
  if (!brandId) return NextResponse.json({ error: 'missing brand' }, { status: 400 })

  const opts = {
    theme: String(body.theme || 'General'),
    platform: (String(body.platform || 'linkedin') as Platform),
    language: (String(body.language || 'en') as Language),
    count: Math.min(Math.max(Number(body.count) || 3, 1), 10),
  }

  try {
    const created = await generateDrafts(String(brandId), opts)
    return NextResponse.json({ ok: true, created })
  } catch (err) {
    payload.logger.error({ err }, 'social generate failed')
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
