import { test } from 'node:test'
import assert from 'node:assert/strict'
import { editImage } from './openai'

test('editImage decodes b64_json into a Buffer and calls the edits endpoint', async () => {
  const prevKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'test-key'
  const png = Buffer.from('hello-png')
  const orig = globalThis.fetch
  let calledUrl = ''
  let auth = ''
  globalThis.fetch = (async (url: any, init: any) => {
    calledUrl = String(url)
    auth = init?.headers?.authorization || ''
    return new Response(JSON.stringify({ data: [{ b64_json: png.toString('base64') }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as any
  try {
    const out = await editImage({
      prompt: 'p',
      references: [{ buffer: Buffer.from('ref'), filename: 'r.png', mimetype: 'image/png' }],
    })
    assert.equal(out.toString(), 'hello-png')
    assert.match(calledUrl, /\/v1\/images\/edits$/)
    assert.equal(auth, 'Bearer test-key')
  } finally {
    globalThis.fetch = orig
    if (prevKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = prevKey
  }
})

test('editImage throws when OPENAI_API_KEY is missing', async () => {
  const prev = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    await assert.rejects(() => editImage({ prompt: 'p', references: [] }), /OPENAI_API_KEY/)
  } finally {
    if (prev) process.env.OPENAI_API_KEY = prev
  }
})
