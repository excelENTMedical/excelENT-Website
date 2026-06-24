// scripts/social-notifications.mts
/**
 * Polls every 60s for scheduled posts whose review-window or 24h-approval
 * reminder is due, and emails the brand owner(s). Idempotent via notify.*
 * stamps written by notify(). Run under pm2 (see plan Task 10).
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { loadNotifyConfig } = await import('../src/lib/social/notify/config')
const { reviewDue, reminderDue } = await import('../src/lib/social/notify/due')
const { notify, withBrand } = await import('../src/lib/social/notify/send')

const POLL_MS = 60_000
const cfg = loadNotifyConfig()
const payload = await getPayloadClient()

async function tick(): Promise<void> {
  const now = new Date()
  const res = await payload.find({
    collection: 'social-posts',
    where: { and: [{ scheduledTime: { exists: true } }, { status: { not_equals: 'rejected' } }] },
    depth: 0,
    limit: 50,
  })
  for (const raw of res.docs as any[]) {
    try {
      const post = await withBrand(payload as any, raw)
      if (reviewDue(post, now, cfg)) await notify('review', post, cfg, payload as any, now.toISOString())
      if (reminderDue(post, now)) await notify('reminder', post, cfg, payload as any, now.toISOString())
    } catch (err) {
      payload.logger.error({ err }, `social-notifications: failed for post ${raw.id}`)
    }
  }
}

payload.logger.info('social-notifications: started')
// eslint-disable-next-line no-constant-condition
while (true) {
  try {
    await tick()
  } catch (err) {
    payload.logger.error({ err }, 'social-notifications: tick error')
  }
  await new Promise((r) => setTimeout(r, POLL_MS))
}
