const API_EDITS = 'https://api.openai.com/v1/images/edits'
const API_GEN = 'https://api.openai.com/v1/images/generations'

export interface ImageRef {
  buffer: Buffer
  filename: string
  mimetype: string
}

function cfg() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return {
    apiKey,
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
    quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
  }
}

async function decode(res: Response): Promise<Buffer> {
  if (!res.ok) {
    const detail = await res.text().catch(() => '(unreadable body)')
    throw new Error(`OpenAI image ${res.status}: ${detail}`)
  }
  const data = (await res.json()) as { data?: Array<{ b64_json?: string }> }
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI image: no b64_json in response')
  return Buffer.from(b64, 'base64')
}

/** Generate a new image conditioned on reference images (gpt-image-1 edits). */
export async function editImage(args: {
  prompt: string
  references: ImageRef[]
  size?: string
  quality?: string
  model?: string
}): Promise<Buffer> {
  const c = cfg()
  const form = new FormData()
  form.append('model', args.model || c.model)
  form.append('prompt', args.prompt)
  form.append('size', args.size || c.size)
  form.append('quality', args.quality || c.quality)
  form.append('input_fidelity', 'high')
  for (const ref of args.references) {
    form.append('image[]', new Blob([ref.buffer], { type: ref.mimetype }), ref.filename)
  }
  const res = await fetch(API_EDITS, {
    method: 'POST',
    headers: { authorization: `Bearer ${c.apiKey}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  })
  return decode(res)
}

/** Generate a new image from a text prompt only (no references). */
export async function generateImage(args: {
  prompt: string
  size?: string
  quality?: string
  model?: string
}): Promise<Buffer> {
  const c = cfg()
  const res = await fetch(API_GEN, {
    method: 'POST',
    headers: { authorization: `Bearer ${c.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: args.model || c.model,
      prompt: args.prompt,
      size: args.size || c.size,
      quality: args.quality || c.quality,
      n: 1,
    }),
    signal: AbortSignal.timeout(120_000),
  })
  return decode(res)
}
