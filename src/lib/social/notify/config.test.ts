import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadNotifyConfig } from './config'

test('defaults when env is empty', () => {
  const c = loadNotifyConfig({})
  assert.equal(c.leadDays, 2)
  assert.equal(c.hourEt, 9)
  assert.equal(c.tz, 'America/New_York')
  assert.deepEqual(c.teamEmails, [])
  assert.equal(c.serverUrl, '')
})

test('parses team emails and trims serverUrl trailing slash', () => {
  const c = loadNotifyConfig({
    SOCIAL_TEAM_EMAILS: ' a@x.com, b@x.com ,',
    SOCIAL_REVIEW_LEAD_DAYS: '3',
    SOCIAL_NOTIFY_HOUR_ET: '8',
    NEXT_PUBLIC_SERVER_URL: 'https://admin.example.com/',
  })
  assert.deepEqual(c.teamEmails, ['a@x.com', 'b@x.com'])
  assert.equal(c.leadDays, 3)
  assert.equal(c.hourEt, 8)
  assert.equal(c.serverUrl, 'https://admin.example.com')
})

test('falls back to defaults on non-numeric env', () => {
  const c = loadNotifyConfig({ SOCIAL_REVIEW_LEAD_DAYS: 'abc', SOCIAL_NOTIFY_HOUR_ET: '' })
  assert.equal(c.leadDays, 2)
  assert.equal(c.hourEt, 9)
})
