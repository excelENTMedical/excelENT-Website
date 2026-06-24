import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderEmail } from './email'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: [], serverUrl: 'https://admin.x.com' }
const post: NotifyPost = {
  id: 42, title: 'Denials drop', copy: 'Cut denials <fast>', platform: 'linkedin', language: 'en',
  status: 'draft', scheduledTime: '2026-06-24T15:00:00Z',
  brand: { name: 'PS | RCM' },
}

test('subject names the event, brand, and title', () => {
  const { subject } = renderEmail('review', post, cfg)
  assert.match(subject, /Draft ready for review/)
  assert.match(subject, /PS \| RCM/)
  assert.match(subject, /Denials drop/)
})

test('html links to the admin edit page and escapes copy', () => {
  const { html } = renderEmail('review', post, cfg)
  assert.match(html, /https:\/\/admin\.x\.com\/admin\/collections\/social-posts\/42/)
  assert.match(html, /Cut denials &lt;fast&gt;/)
})

test('guardrail flags block appears only when flags are present', () => {
  assert.doesNotMatch(renderEmail('generated', post, cfg).html, /Guardrail flags/)
  const flagged = { ...post, generationMeta: { guardrailFlags: 'banned: cure' } }
  assert.match(renderEmail('generated', flagged, cfg).html, /Guardrail flags/)
})
