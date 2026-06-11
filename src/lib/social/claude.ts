const API_URL = 'https://api.anthropic.com/v1/messages'

export interface ClaudeResult {
  text: string
}

/** Minimal call to the Anthropic Messages API. No SDK — keeps the box lean. */
export async function callClaude(
  system: string,
  userMessage: string,
  opts: { model?: string; maxTokens?: number } = {},
): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const res = await fetch(API_URL, {
    signal: AbortSignal.timeout(30_000),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model || process.env.SOCIAL_MODEL || 'claude-sonnet-4-6',
      max_tokens: opts.maxTokens ?? 2000,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '(unreadable body)')
    throw new Error(`Claude API ${res.status}: ${detail}`)
  }

  const data = (await res.json()) as { content?: Array<{ text?: string }> }
  const text = (data?.content?.[0]?.text ?? '').trim()
  return { text }
}
