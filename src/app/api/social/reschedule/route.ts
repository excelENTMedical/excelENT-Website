import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { canReschedule } from './guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number; scheduledTime?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }) }
  if (!body.postId || !body.scheduledTime) return NextResponse.json({ error: 'missing postId or scheduledTime' }, { status: 400 })
  if (Number.isNaN(Date.parse(body.scheduledTime))) return NextResponse.json({ error: 'invalid scheduledTime' }, { status: 400 })

  const post = await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 0, disableErrors: true })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!canReschedule(post.publish?.state)) {
    return NextResponse.json({ error: `Post is ${post.publish?.state}` }, { status: 409 })
  }

  await payload.update({
    collection: 'social-posts',
    id: body.postId,
    context: { skipNotify: true },
    data: { scheduledTime: body.scheduledTime },
  })
  return NextResponse.json({ ok: true })
}
