import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadSeedImageFiles } from './refs'

const payload = { logger: { warn() {} } } as any

test('loadSeedImageFiles reads files, caps at max, skips unreadable', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'seed-'))
  await writeFile(path.join(dir, 'a.png'), Buffer.from('AAA'))
  await writeFile(path.join(dir, 'b.png'), Buffer.from('BBB'))
  const brand = {
    seedImages: [
      { filename: 'a.png', mimeType: 'image/png' },
      { filename: 'b.png', mimeType: 'image/png' },
      { filename: 'missing.png', mimeType: 'image/png' },
    ],
  }
  const all = await loadSeedImageFiles(payload, brand, { baseDir: dir })
  assert.equal(all.length, 2)
  assert.equal(all[0].buffer.toString(), 'AAA')
  assert.equal(all[0].mimetype, 'image/png')

  const capped = await loadSeedImageFiles(payload, brand, { baseDir: dir, max: 1 })
  assert.equal(capped.length, 1)
})

test('loadSeedImageFiles returns [] when brand has no seedImages', async () => {
  assert.deepEqual(await loadSeedImageFiles(payload, {}, { baseDir: '/nope' }), [])
})
