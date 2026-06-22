import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { exchangeCode, verifyState } from '@/lib/social/publish/linkedin/oauth'
import { listAdminedOrgs } from '@/lib/social/publish/linkedin/client'
import { saveConnection } from '@/lib/social/publish/connection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const secret = process.env.PAYLOAD_SECRET || ''
  const clientId = process.env.LINKEDIN_CLIENT_ID || ''
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || ''
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || ''

  if (!code || !state || !verifyState(state, secret, Date.now())) {
    return NextResponse.json({ error: 'invalid state or code' }, { status: 400 })
  }

  try {
    const tokens = await exchangeCode({ code, redirectUri, clientId, clientSecret })
    const orgs = await listAdminedOrgs(tokens.accessToken)
    if (orgs.length === 0) throw new Error('No admined LinkedIn organization found for this account')
    await saveConnection(payload as any, {
      ...tokens,
      orgUrn: orgs[0],
      connectedBy: user.id,
      connectedAt: new Date().toISOString(),
    })
    const base = process.env.NEXT_PUBLIC_SERVER_URL || url.origin
    return NextResponse.redirect(`${base}/admin/globals/linkedin-connection?connected=1`)
  } catch (err) {
    payload.logger.error({ err }, 'linkedin callback failed')
    return NextResponse.json({ error: 'linkedin connect failed' }, { status: 500 })
  }
}
