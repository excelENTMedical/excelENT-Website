import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { publishPost } from '@/lib/social/publish/publish'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { postId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body.postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

  // Refuse if the scheduler (or a prior click) already claimed or published this post,
  // so a manual publish can't race the worker into a double post.
  const post = await payload.findByID({ collection: 'social-posts', id: body.postId, depth: 0, disableErrors: true })
  const state = post?.publish?.state
  if (state === 'publishing' || state === 'sent') {
    return NextResponse.json({ error: `Post is already ${state}` }, { status: 409 })
  }

  // If a scheduledTime is set and in the future, mark it scheduled for the worker.
  if (post?.scheduledTime && new Date(post.scheduledTime).getTime() > Date.now()) {
    await payload.update({
      collection: 'social-posts',
      id: body.postId,
      data: { publish: { ...(post.publish || {}), state: 'scheduled' } },
    })
    return NextResponse.json({ ok: true, scheduled: true })
  }

  try {
    const postUrn = await publishPost(body.postId)
    return NextResponse.json({ ok: true, postUrn })
  } catch (err) {
    payload.logger.error({ err }, 'social publish failed')
    return NextResponse.json({ error: 'publish failed' }, { status: 500 })
  }
}
