import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthorizeUrl, needsRefresh, signState, verifyState } from './oauth'

test('buildAuthorizeUrl includes client_id, redirect, scope, state, response_type', () => {
  const url = new URL(
    buildAuthorizeUrl({
      clientId: 'cid',
      redirectUri: 'https://x.test/cb',
      scope: 'w_organization_social rw_organization_admin',
      state: 'st123',
    }),
  )
  assert.equal(url.origin + url.pathname, 'https://www.linkedin.com/oauth/v2/authorization')
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(url.searchParams.get('client_id'), 'cid')
  assert.equal(url.searchParams.get('redirect_uri'), 'https://x.test/cb')
  assert.equal(url.searchParams.get('scope'), 'w_organization_social rw_organization_admin')
  assert.equal(url.searchParams.get('state'), 'st123')
})

test('needsRefresh is true when expiry is null, past, or within the buffer', () => {
  const now = 1_000_000
  assert.equal(needsRefresh(null, now), true)
  assert.equal(needsRefresh(new Date(now - 1).toISOString(), now), true)
  assert.equal(needsRefresh(new Date(now + 60_000).toISOString(), now, 120_000), true) // inside buffer
  assert.equal(needsRefresh(new Date(now + 600_000).toISOString(), now, 120_000), false) // outside buffer
})

test('signState/verifyState round-trips and rejects tampering and staleness', () => {
  const secret = 'shh'
  const now = 5_000_000
  const state = signState('nonce-1', now, secret)
  assert.equal(verifyState(state, secret, now + 1000), true)
  assert.equal(verifyState(state + 'x', secret, now + 1000), false) // tampered
  assert.equal(verifyState(state, 'other', now + 1000), false) // wrong secret
  assert.equal(verifyState(state, secret, now + 11 * 60_000, 10 * 60_000), false) // expired
})

import { exchangeCode, refreshTokens } from './oauth'

function fakeFetch(handler: (url: string, init: any) => { status?: number; json?: any; text?: string }) {
  const calls: Array<{ url: string; init: any }> = []
  const fn = async (url: string, init: any) => {
    calls.push({ url, init })
    const r = handler(url, init)
    return {
      ok: (r.status ?? 200) >= 200 && (r.status ?? 200) < 300,
      status: r.status ?? 200,
      json: async () => r.json,
      text: async () => r.text ?? '',
    } as any
  }
  return { fn, calls }
}

test('exchangeCode posts the auth-code grant and maps expiries to absolute ISO', async () => {
  const now = 1_000_000_000_000
  const { fn, calls } = fakeFetch(() => ({
    json: { access_token: 'at', refresh_token: 'rt', expires_in: 5_184_000, refresh_token_expires_in: 31_536_000 },
  }))
  const tokens = await exchangeCode(
    { code: 'c', redirectUri: 'https://x.test/cb', clientId: 'cid', clientSecret: 'sec' },
    fn as any,
    now,
  )
  assert.equal(calls[0].url, 'https://www.linkedin.com/oauth/v2/accessToken')
  assert.equal(calls[0].init.method, 'POST')
  assert.match(calls[0].init.headers['Content-Type'], /x-www-form-urlencoded/)
  assert.match(calls[0].init.body, /grant_type=authorization_code/)
  assert.match(calls[0].init.body, /code=c/)
  assert.equal(tokens.accessToken, 'at')
  assert.equal(tokens.refreshToken, 'rt')
  assert.equal(tokens.accessExpiresAt, new Date(now + 5_184_000_000).toISOString())
  assert.equal(tokens.refreshExpiresAt, new Date(now + 31_536_000_000).toISOString())
})

test('refreshTokens posts the refresh grant', async () => {
  const { fn, calls } = fakeFetch(() => ({
    json: { access_token: 'at2', refresh_token: 'rt2', expires_in: 100, refresh_token_expires_in: 200 },
  }))
  const tokens = await refreshTokens({ refreshToken: 'rt', clientId: 'cid', clientSecret: 'sec' }, fn as any, 0)
  assert.match(calls[0].init.body, /grant_type=refresh_token/)
  assert.match(calls[0].init.body, /refresh_token=rt/)
  assert.equal(tokens.accessToken, 'at2')
})

test('a non-2xx token response throws with status and body', async () => {
  const { fn } = fakeFetch(() => ({ status: 400, text: 'invalid_grant' }))
  await assert.rejects(
    () => exchangeCode({ code: 'c', redirectUri: 'r', clientId: 'i', clientSecret: 's' }, fn as any, 0),
    /400.*invalid_grant/,
  )
})
