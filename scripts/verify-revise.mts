/**
 * End-to-end verification of reviseDraft against a REAL draft:
 * loads draft #12, captures its copy, runs a real revision (copy target),
 * reads it back, and prints before/after + that originalCopy was preserved.
 * Run: node --import tsx scripts/verify-revise.mts
 */
for (const line of (await import('node:fs')).readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
process.env.NODE_ENV = 'production'

const { getPayloadClient } = await import('../src/lib/payload')
const { reviseDraft } = await import('../src/lib/social/revise')

const payload = await getPayloadClient()
const before = await payload.findByID({ collection: 'social-posts', id: 12, depth: 0 }) as any
console.log('BEFORE copy:', JSON.stringify(before.copy))
console.log('BEFORE originalCopy:', JSON.stringify(before.generationMeta?.originalCopy))

await reviseDraft(12, { note: 'Make the opening line punchier and lead with the strongest number.', target: 'copy' })

const after = await payload.findByID({ collection: 'social-posts', id: 12, depth: 0 }) as any
console.log('\nAFTER copy:', JSON.stringify(after.copy))
console.log('AFTER status:', after.status, '(expect draft)')
console.log('AFTER originalCopy preserved:',
  before.generationMeta?.originalCopy === after.generationMeta?.originalCopy)
console.log('AFTER guardrailFlags:', JSON.stringify(after.generationMeta?.guardrailFlags))
console.log('\nchanged:', before.copy !== after.copy)
process.exit(0)
