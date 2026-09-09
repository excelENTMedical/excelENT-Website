/**
 * Map known upstream failures (Anthropic / OpenAI) to short, human-readable
 * messages safe to show in the admin UI. Anything unrecognized falls back to
 * the generic message so raw provider payloads never leak to the browser.
 */
export function friendlyApiError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err)

  // Anthropic (copy generation / revision)
  if (/credit balance is too low/i.test(msg)) {
    return 'Anthropic credit balance is too low — add credits at console.anthropic.com (Plans & Billing), then retry.'
  }
  if (/Claude API 401/.test(msg)) {
    return 'Anthropic API key was rejected — check ANTHROPIC_API_KEY on the server.'
  }
  if (/Claude API 429/.test(msg) || /overloaded/i.test(msg)) {
    return 'Anthropic API is rate-limited or overloaded — wait a minute and retry.'
  }
  if (/Claude API (\d+)/.test(msg)) {
    return `Anthropic API error (HTTP ${/Claude API (\d+)/.exec(msg)![1]}) — see server logs for detail.`
  }

  // OpenAI (image generation)
  if (/insufficient_quota|billing_hard_limit/i.test(msg)) {
    return 'OpenAI account is out of quota — check billing at platform.openai.com, then retry.'
  }
  if (/OpenAI image 401/.test(msg)) {
    return 'OpenAI API key was rejected — check OPENAI_API_KEY on the server.'
  }
  if (/OpenAI image 429/.test(msg)) {
    return 'OpenAI API is rate-limited — wait a minute and retry.'
  }
  if (/OpenAI image (\d+)/.test(msg)) {
    return `OpenAI image API error (HTTP ${/OpenAI image (\d+)/.exec(msg)![1]}) — see server logs for detail.`
  }

  // Fetch timeouts (AbortSignal.timeout throws a DOMException named TimeoutError)
  if (err instanceof Error && err.name === 'TimeoutError') {
    return 'The AI request timed out — retry, or lower OPENAI_IMAGE_QUALITY if this keeps happening.'
  }

  return fallback
}
