import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCorpus } from './corpus'
import type { CorpusPost } from './types'

const post = (p: Partial<CorpusPost>): CorpusPost => ({
  copy: 'x',
  status: 'draft',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...p,
})

test('collects approved copy as exemplars', () => {
  const c = buildCorpus([
    post({ copy: 'good one', status: 'approved' }),
    post({ copy: 'still a draft', status: 'draft' }),
  ])
  assert.deepEqual(c.approved, ['good one'])
})

test('detects a human edit when final copy differs from generated', () => {
  const c = buildCorpus([
    post({ copy: 'final edited text', originalCopy: 'raw model text', status: 'approved' }),
  ])
  assert.equal(c.edited.length, 1)
  assert.deepEqual(c.edited[0], { before: 'raw model text', after: 'final edited text' })
})

test('does not treat an unchanged approved post as an edit', () => {
  const c = buildCorpus([
    post({ copy: 'same', originalCopy: 'same', status: 'approved' }),
  ])
  assert.equal(c.edited.length, 0)
})

test('collects rejections/needs-changes that have feedback', () => {
  const c = buildCorpus([
    post({ copy: 'bad', status: 'rejected', reviewerFeedback: 'too salesy' }),
    post({ copy: 'meh', status: 'needs-changes', reviewerFeedback: 'tighten it' }),
    post({ copy: 'no reason', status: 'rejected', reviewerFeedback: '' }),
  ])
  assert.deepEqual(c.rejections, [
    { copy: 'bad', reason: 'too salesy' },
    { copy: 'meh', reason: 'tighten it' },
  ])
})

test('respects the max caps and prefers newest', () => {
  const many: CorpusPost[] = Array.from({ length: 10 }, (_, i) =>
    post({ copy: `a${i}`, status: 'approved', updatedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
  )
  const c = buildCorpus(many, { maxApproved: 3 })
  assert.equal(c.approved.length, 3)
  assert.equal(c.approved[0], 'a9') // newest first
})

test('an edited post is not duplicated into approved exemplars', () => {
  const c = buildCorpus([
    post({ copy: 'edited final', originalCopy: 'raw', status: 'approved' }),
    post({ copy: 'plain approved', status: 'approved' }),
  ])
  assert.deepEqual(c.edited.map((e) => e.after), ['edited final'])
  assert.deepEqual(c.approved, ['plain approved']) // the edited post is NOT here
})

test('respects the maxEdited cap', () => {
  const many: CorpusPost[] = Array.from({ length: 8 }, (_, i) =>
    post({ copy: `after${i}`, originalCopy: `before${i}`, status: 'approved', updatedAt: `2026-02-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
  )
  const c = buildCorpus(many, { maxEdited: 2 })
  assert.equal(c.edited.length, 2)
})
