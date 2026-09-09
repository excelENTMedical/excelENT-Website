import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reviseDraft, type ReviseTarget } from '@/lib/social/revise'
import { friendlyApiError } from '@/lib/social/apiError'
import { renderAndAttachGraphic, shouldReplaceAsset } from '@/lib/social/graphics/attach'

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

    // A revision that moves the graphic leaves the attached PNG stale, and the
    // preview shows the attachment rather than a live render — so without this
    // the reviewer asks for a change, the fields move, and nothing appears to
    // happen. Failing here must not fail the revision, which is already saved.
    let regenerated = false
    if (target !== 'copy') {
      const post = (await payload.findByID({
        collection: 'social-posts', id: body.postId, depth: 1, disableErrors: true,
      })) as Record<string, any> | null
      if (post && post.graphicStyle !== 'none' && shouldReplaceAsset(post.asset)) {
        try {
          await renderAndAttachGraphic(payload, body.postId)
          regenerated = true
        } catch (err) {
          payload.logger.error({ err }, 'social revise: graphic re-render failed')
        }
      }
    }
    return NextResponse.json({ ok: true, regenerated })
  } catch (err) {
    payload.logger.error({ err }, 'social revise failed')
    return NextResponse.json({ error: friendlyApiError(err, 'revise failed') }, { status: 500 })
  }
}
