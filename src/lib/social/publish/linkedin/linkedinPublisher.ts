import type { Publisher } from '../types'
import { getConnection, saveConnection, type ConnectionData } from '../connection'
import { needsRefresh, refreshTokens as defaultRefreshTokens } from './oauth'
import {
  buildPostBody,
  createPost as defaultCreatePost,
  initImageUpload as defaultInitImageUpload,
  uploadImageBinary as defaultUploadImageBinary,
} from './client'

export interface LinkedInClient {
  initImageUpload: (orgUrn: string, token: string) => Promise<{ uploadUrl: string; imageUrn: string }>
  uploadImageBinary: (uploadUrl: string, bytes: Uint8Array, token: string) => Promise<void>
  createPost: (body: ReturnType<typeof buildPostBody>, token: string) => Promise<{ postUrn: string }>
}

export interface OAuthFns {
  refreshTokens: (
    input: { refreshToken: string; clientId: string; clientSecret: string },
    fetchImpl?: typeof fetch,
    now?: number,
  ) => Promise<{ accessToken: string; refreshToken: string; accessExpiresAt: string; refreshExpiresAt: string }>
}

export interface LinkedInPublisherDeps {
  payload: Parameters<typeof getConnection>[0]
  clientId: string
  clientSecret: string
  client?: LinkedInClient
  oauth?: OAuthFns
  now?: () => number
}

const defaultClient: LinkedInClient = {
  initImageUpload: defaultInitImageUpload,
  uploadImageBinary: defaultUploadImageBinary,
  createPost: defaultCreatePost,
}

export function createLinkedInPublisher(deps: LinkedInPublisherDeps): Publisher {
  const client = deps.client || defaultClient
  const oauth = deps.oauth || { refreshTokens: defaultRefreshTokens }
  const now = deps.now || (() => Date.now())

  async function validToken(): Promise<{ token: string; orgUrn: string }> {
    const conn: ConnectionData = await getConnection(deps.payload)
    if (!conn.orgUrn || !conn.accessToken || !conn.refreshToken) {
      throw new Error('Connect LinkedIn first (no stored connection).')
    }
    if (!needsRefresh(conn.accessExpiresAt || null, now())) {
      return { token: conn.accessToken, orgUrn: conn.orgUrn }
    }
    if (conn.refreshExpiresAt && new Date(conn.refreshExpiresAt).getTime() <= now()) {
      throw new Error('Reconnect LinkedIn: the refresh token has expired.')
    }
    const tokens = await oauth.refreshTokens(
      { refreshToken: conn.refreshToken, clientId: deps.clientId, clientSecret: deps.clientSecret },
      fetch,
      now(),
    )
    await saveConnection(deps.payload, tokens)
    return { token: tokens.accessToken, orgUrn: conn.orgUrn }
  }

  return {
    async publish(req) {
      const { token, orgUrn } = await validToken()
      let imageUrn: string | undefined
      let altText: string | undefined
      if (req.media.length > 0) {
        const m = req.media[0]
        const { uploadUrl, imageUrn: urn } = await client.initImageUpload(orgUrn, token)
        await client.uploadImageBinary(uploadUrl, m.data, token)
        imageUrn = urn
        altText = m.altText
      }
      const body = buildPostBody({ orgUrn, text: req.text, imageUrn, altText })
      return client.createPost(body, token)
    },
  }
}
