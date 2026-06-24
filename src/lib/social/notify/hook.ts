// src/lib/social/notify/hook.ts
import { loadNotifyConfig } from './config'
import { immediateEvents } from './due'
import { notify, withBrand } from './send'
import type { NotifyPost } from './types'

interface AfterChangeArgs {
  doc: NotifyPost
  previousDoc?: NotifyPost | null
  operation: 'create' | 'update'
  req: { payload: any }
  context?: { skipNotify?: boolean }
  env?: NodeJS.ProcessEnv
}

export async function socialPostsAfterChange(args: AfterChangeArgs): Promise<NotifyPost> {
  const { doc, previousDoc, operation, req, context, env } = args
  if (context?.skipNotify) return doc

  const events = immediateEvents({ operation, doc, previousDoc })
  if (events.length === 0) return doc

  const cfg = loadNotifyConfig(env ?? process.env)
  const nowIso = new Date().toISOString()
  // Owner-routed events need a populated brand; published (team-routed) does not.
  const post = events.some((e) => e !== 'published') ? await withBrand(req.payload, doc) : doc

  for (const event of events) {
    try {
      await notify(event, post, cfg, req.payload, nowIso)
    } catch (err) {
      req.payload.logger?.error({ err }, `social-notify: ${event} email failed for post ${doc.id}`)
    }
  }
  return doc
}
