/**
 * Polls for approved posts whose scheduledTime is due and publishes them via
 * publishPost. Claims each post (publish.state='publishing') before sending so a
 * post is never double-published. Run under pm2 (see Task 13).
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { publishPost } = await import('../src/lib/social/publish/publish')
const { dueWhere, isClaimable } = await import('../src/lib/social/publish/scheduler')
const { runPlanner } = await import('../src/lib/social/calendar/planner')

const POLL_MS = 60_000
const PLAN_MS = 3_600_000 // hourly
const payload = await getPayloadClient()

async function planTick(): Promise<void> {
  const n = await runPlanner({ payload: payload as any })
  if (n > 0) payload.logger.info(`social-scheduler: planner created ${n} drafts`)
}

void (async () => {
  // run once at startup, then hourly
  for (;;) {
    try { await planTick() } catch (err) { payload.logger.error({ err }, 'social-scheduler: planTick error') }
    await new Promise((r) => setTimeout(r, PLAN_MS))
  }
})()

async function tick(): Promise<void> {
  const nowIso = new Date().toISOString()
  const due = await payload.find({ collection: 'social-posts', where: dueWhere(nowIso), depth: 0, limit: 20 })
  for (const post of due.docs as any[]) {
    if (!isClaimable(post)) continue
    try {
      // Claim: flip to 'publishing' so a concurrent/next tick won't re-send it.
      await payload.update({ collection: 'social-posts', id: post.id, data: { publish: { ...(post.publish || {}), state: 'publishing' } } })
      await publishPost(post.id)
      payload.logger.info(`social-scheduler: published post ${post.id}`)
    } catch (err) {
      payload.logger.error({ err }, `social-scheduler: failed to publish post ${post.id}`)
    }
  }
}

payload.logger.info('social-scheduler: started')
// eslint-disable-next-line no-constant-condition
while (true) {
  try {
    await tick()
  } catch (err) {
    payload.logger.error({ err }, 'social-scheduler: tick error')
  }
  await new Promise((r) => setTimeout(r, POLL_MS))
}
