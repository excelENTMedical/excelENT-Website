import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildAuthorizeUrl, signState } from '@/lib/social/publish/linkedin/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  const secret = process.env.PAYLOAD_SECRET
  if (!clientId || !redirectUri || !secret) {
    return NextResponse.json({ error: 'LinkedIn env not configured' }, { status: 500 })
  }

  const now = Date.now()
  const state = signState(`${user.id}-${now}`, now, secret)
  const url = buildAuthorizeUrl({
    clientId,
    redirectUri,
    scope: 'w_organization_social rw_organization_admin',
    state,
  })
  return NextResponse.redirect(url)
}
