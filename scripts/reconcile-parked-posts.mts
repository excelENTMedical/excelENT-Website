/**
 * Reconcile posts the stale-claim sweeper parked, after a human has checked the Page.
 *
 * The sweeper parks rather than retries because a claim abandoned mid-publish may
 * already be live and the app cannot read its own feed back: `GET /rest/posts?q=author`
 * answers 403 ACCESS_DENIED without the `r_organization_social` scope, which lives
 * behind LinkedIn's Community Management partner program (re-confirmed 2026-09-10).
 * So the verdict has to come from a person looking at the Page.
 *
 * Order matters — get it wrong and you double-post publicly. Terminal states are written
 * only while the scheduler is stopped, so a post cannot become due again mid-edit.
 *
 *   pm2 stop social-scheduler
 *   node --import tsx scripts/reconcile-parked-posts.mts --list
 *   node --import tsx scripts/reconcile-parked-posts.mts --live 54,62 --abandon 58 --apply
 *   pm2 start social-scheduler
 *
 * Verdicts:
 *   --live      it IS on the Page. Records it as sent so nothing republishes it.
 *   --abandon   it is NOT on the Page and is too old to post now. Back to draft, off the queue.
 *   --requeue   it is NOT on the Page and should go out again, at a NEW time:
 *               --requeue 64:2026-09-25T13:00
 *
 * Without --apply this prints the plan and changes nothing.
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

type Verdict =
  | { kind: 'live'; id: number }
  | { kind: 'abandon'; id: number }
  | { kind: 'requeue'; id: number; at: string }

/** Parse the CLI verdict flags. Exported shape kept simple so it stays readable. */
function parseArgs(argv: string[]): { verdicts: Verdict[]; apply: boolean; list: boolean; force: boolean } {
  const verdicts: Verdict[] = []
  let apply = false
  let list = false
  let force = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--apply') { apply = true; continue }
    if (a === '--list') { list = true; continue }
    if (a === '--force') { force = true; continue }
    const val = argv[++i]
    if (!val) throw new Error(`${a} needs a value`)
    if (a === '--live' || a === '--abandon') {
      for (const raw of val.split(',')) {
        const id = Number(raw.trim())
        if (!id) throw new Error(`bad id in ${a}: ${raw}`)
        verdicts.push({ kind: a === '--live' ? 'live' : 'abandon', id })
      }
    } else if (a === '--requeue') {
      for (const raw of val.split(',')) {
        const [idPart, ...rest] = raw.trim().split(':')
        const at = rest.join(':')
        const id = Number(idPart)
        if (!id || !at) throw new Error(`--requeue wants id:ISO-time, got "${raw}"`)
        if (Number.isNaN(Date.parse(at))) throw new Error(`--requeue: unparseable time "${at}"`)
        verdicts.push({ kind: 'requeue', id, at })
      }
    } else {
      throw new Error(`unknown flag ${a}`)
    }
  }
  const seen = new Set<number>()
  for (const v of verdicts) {
    if (seen.has(v.id)) throw new Error(`post ${v.id} given two verdicts`)
    seen.add(v.id)
  }
  return { verdicts, apply, list, force }
}

function schedulerRunning(): boolean {
  try {
    const out = execSync('pm2 jlist', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const procs = JSON.parse(out) as any[]
    return procs.some((p) => p.name === 'social-scheduler' && p.pm2_env?.status === 'online')
  } catch {
    return false // pm2 unavailable: nothing to race with
  }
}

const { verdicts, apply, list, force } = parseArgs(process.argv.slice(2))

const { getPayload } = await import('payload')
const configMod = await import('../src/payload.config')
const payload = await getPayload({ config: configMod.default })

const parked = await payload.find({
  collection: 'social-posts',
  where: { 'publish.state': { equals: 'failed' } },
  sort: 'scheduledTime',
  depth: 1,
  limit: 200,
})

if (list || verdicts.length === 0) {
  console.log(`\n${parked.docs.length} parked post(s) awaiting a verdict:\n`)
  for (const d of parked.docs as any[]) {
    const when = d.scheduledTime ? new Date(d.scheduledTime).toISOString().slice(0, 10) : '(unscheduled)'
    const brand = typeof d.brand === 'object' ? d.brand?.slug : d.brand
    console.log(`  #${String(d.id).padEnd(3)} ${when}  ${String(brand).padEnd(28)} ${String(d.copy).replace(/\s+/g, ' ').slice(0, 70)}`)
  }
  console.log('\nCheck each against the LinkedIn Page, then pass --live / --abandon / --requeue.')
  process.exit(0)
}

if (apply && !force && schedulerRunning()) {
  console.error('\nRefusing to write while social-scheduler is online — a re-queued post could')
  console.error('become due mid-edit and publish twice. Run: pm2 stop social-scheduler\n')
  process.exit(1)
}

const byId = new Map((parked.docs as any[]).map((d) => [Number(d.id), d]))
let applied = 0

for (const v of verdicts) {
  const doc = byId.get(v.id)
  if (!doc) {
    console.log(`#${v.id}: SKIP — not currently parked (state is not 'failed')`)
    continue
  }
  let data: Record<string, any>
  let label: string
  if (v.kind === 'live') {
    // No URN to record: the update that would have stored it is the one that hung.
    // `sent` is still the honest state — it stops anything republishing it.
    data = {
      publish: {
        ...doc.publish,
        state: 'sent',
        sentAt: doc.publish?.sentAt || doc.scheduledTime || new Date().toISOString(),
        error: 'Confirmed live on the Page by hand; the URN was lost when the recording update hung.',
      },
    }
    label = 'live on the Page -> sent'
  } else if (v.kind === 'abandon') {
    data = {
      status: 'draft',
      publish: { ...doc.publish, state: 'pending', attempts: 0, error: 'Verified NOT on the Page; retired rather than reposted.' },
    }
    label = 'not live -> back to draft, off the queue'
  } else {
    data = {
      status: 'approved',
      scheduledTime: new Date(v.at).toISOString(),
      publish: { ...doc.publish, state: 'pending', attempts: 0, error: '' },
    }
    label = `not live -> re-queued for ${new Date(v.at).toISOString()}`
  }

  if (!apply) {
    console.log(`#${v.id}: WOULD SET ${label}`)
    continue
  }
  await payload.update({ collection: 'social-posts', id: v.id, data })
  console.log(`#${v.id}: ${label}`)
  applied++
}

if (!apply) console.log('\nDry run. Re-run with --apply to write.\n')
else console.log(`\n${applied} post(s) updated. Now: pm2 start social-scheduler\n`)
process.exit(0)
