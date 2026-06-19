import { createHmac } from 'node:crypto'

export const LINKEDIN_AUTHORIZE_URL = 'https://www.linkedin.com/oauth/v2/authorization'
export const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const DEFAULT_REFRESH_BUFFER_MS = 5 * 60_000
const DEFAULT_STATE_MAX_AGE_MS = 10 * 60_000

export function buildAuthorizeUrl(input: {
  clientId: string
  redirectUri: string
  scope: string
  state: string
}): string {
  const u = new URL(LINKEDIN_AUTHORIZE_URL)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', input.clientId)
  u.searchParams.set('redirect_uri', input.redirectUri)
  u.searchParams.set('scope', input.scope)
  u.searchParams.set('state', input.state)
  return u.toString()
}

export function needsRefresh(
  accessExpiresAt: string | null,
  now: number,
  bufferMs: number = DEFAULT_REFRESH_BUFFER_MS,
): boolean {
  if (!accessExpiresAt) return true
  const expiry = new Date(accessExpiresAt).getTime()
  if (Number.isNaN(expiry)) return true
  return expiry - bufferMs <= now
}

export function signState(nonce: string, issuedAtMs: number, secret: string): string {
  const payload = `${nonce}.${issuedAtMs}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyState(
  state: string,
  secret: string,
  now: number,
  maxAgeMs: number = DEFAULT_STATE_MAX_AGE_MS,
): boolean {
  const dot = state.lastIndexOf('.')
  if (dot === -1) return false
  const payloadB64 = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  let payload: string
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return false
  }
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  if (sig !== expected) return false
  const issuedAt = Number(payload.split('.')[1])
  if (!Number.isFinite(issuedAt)) return false
  return now - issuedAt <= maxAgeMs && now >= issuedAt
}
