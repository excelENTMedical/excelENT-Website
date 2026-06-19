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
