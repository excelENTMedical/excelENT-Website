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

test('prefers a clean post over a more recent flagged one', () => {
  const c = buildCorpus(
    [
      post({ copy: 'The claim goes out — and comes back denied.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'Your coders know the payer mix before a claim goes out.', status: 'approved', updatedAt: '2026-08-01T00:00:00.000Z' }),
    ],
    { maxApproved: 1 },
  )
  assert.deepEqual(c.approved, ['Your coders know the payer mix before a claim goes out.'])
})

test('collapses repeated openers so one formula cannot fill the corpus', () => {
  const c = buildCorpus(
    [
      // The first FOUR words must match for openerKey to collapse them.
      post({ copy: 'Most practices accept denials without ever appealing them.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'Most practices accept denials as the cost of doing business.', status: 'approved', updatedAt: '2026-08-16T00:00:00.000Z' }),
      post({ copy: 'Your front desk answers the same three questions all day.', status: 'approved', updatedAt: '2026-08-15T00:00:00.000Z' }),
    ],
    { maxApproved: 3 },
  )
  assert.equal(c.approved.length, 2, 'the second "Most practices accept" post must be dropped')
  assert.ok(c.approved.some((x) => x.startsWith('Your front desk')))
})

test('falls back to flagged posts rather than returning an empty corpus', () => {
  const c = buildCorpus(
    [
      post({ copy: 'One thing — then another — then a third.', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: 'A single tic — right here.', status: 'approved', updatedAt: '2026-08-16T00:00:00.000Z' }),
    ],
    { maxApproved: 2 },
  )
  assert.equal(c.approved.length, 2, 'a brand with no clean history must still generate')
  assert.equal(c.approved[0], 'A single tic — right here.', 'fewest flags first')
})

// The brand-4 disclaimer, verbatim from brand_profiles_required_disclaimers. It carries an
// em dash AND an `X, not Y`, and by taking the last line it turns the real CTA into a
// dramaticFragment. Scored bare it costs a compliant patient post three flags it did not
// earn — enough that the "prefer clean" branch could never fire for that brand.
const patientDisclaimer =
  'This is general education, not medical advice. Symptoms and the right treatment vary from person to person — talk to a doctor about your situation.'

test('scores exemplars with the brand disclaimer excluded, like generate.ts does', () => {
  const compliant = `Sinus pressure that lingers past ten days is worth a look.\n\nBook a visit.\n\n${patientDisclaimer}`
  const tic = `One thing — then another — then a third.\n\n${patientDisclaimer}`
  const c = buildCorpus(
    [
      post({ copy: tic, status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: compliant, status: 'approved', updatedAt: '2026-08-01T00:00:00.000Z' }),
    ],
    { maxApproved: 1, requiredDisclaimers: [patientDisclaimer] },
  )
  assert.deepEqual(c.approved, [compliant], 'the clean post must outrank the more recent tic')
})

test('a mandated disclaimer alone never demotes an exemplar', () => {
  const compliant = `Sinus pressure that lingers past ten days is worth a look.\n\nBook a visit.\n\n${patientDisclaimer}`
  const c = buildCorpus([post({ copy: compliant, status: 'approved' })], {
    maxApproved: 1,
    requiredDisclaimers: [patientDisclaimer],
  })
  assert.deepEqual(c.approved, [compliant])
})

test('the edited pairs get the same disclaimer exclusion', () => {
  const after = `Sinus pressure that lingers past ten days is worth a look.\n\nBook a visit.\n\n${patientDisclaimer}`
  const tic = `A single tic — right here.\n\n${patientDisclaimer}`
  const c = buildCorpus(
    [
      post({ copy: tic, originalCopy: 'was worse', status: 'approved', updatedAt: '2026-08-17T00:00:00.000Z' }),
      post({ copy: after, originalCopy: 'was worse too', status: 'approved', updatedAt: '2026-08-01T00:00:00.000Z' }),
    ],
    { maxEdited: 1, requiredDisclaimers: [patientDisclaimer] },
  )
  assert.deepEqual(c.edited, [{ before: 'was worse too', after }])
})
