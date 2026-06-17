import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reviseDraft, type ReviseTarget } from '@/lib/social/revise'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TARGETS: ReviseTarget[] = ['copy', 'graphic', 'both']

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number; note?: string; target?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })
  const note = String(body.note || '').trim()
  if (!note) return NextResponse.json({ error: 'missing note' }, { status: 400 })
  const target = (TARGETS.includes(body.target as ReviseTarget) ? body.target : 'both') as ReviseTarget

  try {
    await reviseDraft(body.postId, { note, target })
    return NextResponse.json({ ok: true })
  } catch (err) {
    payload.logger.error({ err }, 'social revise failed')
    return NextResponse.json({ error: 'revise failed' }, { status: 500 })
  }
}
