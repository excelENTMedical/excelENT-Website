import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ownerEmails, recipientsFor } from './recipients'
import type { NotifyConfig, NotifyPost } from './types'

const cfg: NotifyConfig = { leadDays: 2, hourEt: 9, tz: 'America/New_York', teamEmails: ['team@x.com'], serverUrl: '' }
const post: NotifyPost = {
  id: 1, copy: 'x', platform: 'linkedin', status: 'draft',
  brand: { name: 'Company', reviewers: [{ email: ' eric@x.com ' }, { email: 'zack@x.com' }, { email: '' }] },
}

test('ownerEmails extracts + trims + drops blanks', () => {
  assert.deepEqual(ownerEmails(post.brand), ['eric@x.com', 'zack@x.com'])
})

test('ownerEmails is empty when brand is an unpopulated id', () => {
  assert.deepEqual(ownerEmails(5), [])
  assert.deepEqual(ownerEmails(null), [])
})

test('recipientsFor routes published to team, others to owners', () => {
  assert.deepEqual(recipientsFor('published', post, cfg), ['team@x.com'])
  assert.deepEqual(recipientsFor('generated', post, cfg), ['eric@x.com', 'zack@x.com'])
  assert.deepEqual(recipientsFor('review', post, cfg), ['eric@x.com', 'zack@x.com'])
  assert.deepEqual(recipientsFor('reminder', post, cfg), ['eric@x.com', 'zack@x.com'])
})
