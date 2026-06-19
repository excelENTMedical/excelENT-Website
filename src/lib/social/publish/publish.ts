import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayloadClient } from '@/lib/payload'
import { createLinkedInPublisher } from './linkedin/linkedinPublisher'
import type { Publisher, PublishMedia } from './types'

const ASSET_DIR = path.resolve(process.cwd(), 'public/social-assets')

interface PayloadLike {
  findByID: (a: any) => Promise<any>
  update: (a: any) => Promise<any>
}

export interface PublishPostOptions {
  publisher?: Publisher
  payload?: PayloadLike
  readFileImpl?: (p: string) => Promise<Buffer>
  now?: () => number
}

function defaultPublisher(payload: PayloadLike): Publisher {
  return createLinkedInPublisher({
    payload: payload as any,
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  })
}

export async function publishPost(postId: string | number, opts: PublishPostOptions = {}): Promise<string> {
  const payload = opts.payload || ((await getPayloadClient()) as unknown as PayloadLike)
  const publisher = opts.publisher || defaultPublisher(payload)
  const readFileImpl = opts.readFileImpl || readFile
  const now = opts.now || (() => Date.now())

  const post = await payload.findByID({ collection: 'social-posts', id: postId, depth: 1 })
  if (!post) throw new Error(`Post ${postId} not found`)
  if (post.status !== 'approved') throw new Error('Only approved posts can be published')

  const media: PublishMedia[] = []
  const asset = typeof post.asset === 'object' && post.asset ? post.asset : null
  if (asset?.filename) {
    const data = await readFileImpl(path.join(ASSET_DIR, asset.filename))
    media.push({
      filename: asset.filename,
      contentType: asset.mimeType || 'application/octet-stream',
      data,
      altText: post.graphic?.headline || post.title || undefined,
    })
  }

  const text = [post.copy, post.cta].filter(Boolean).join('\n\n')

  try {
    const { postUrn } = await publisher.publish({ text, media })
    await payload.update({
      collection: 'social-posts',
      id: postId,
      data: { publish: { state: 'sent', postUrn, sentAt: new Date(now()).toISOString(), error: '' } },
    })
    return postUrn
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const attempts = (post.publish?.attempts || 0) + 1
    await payload.update({
      collection: 'social-posts',
      id: postId,
      data: { publish: { state: 'failed', error: message, attempts } },
    })
    throw err
  }
}
