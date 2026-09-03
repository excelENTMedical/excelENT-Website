import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lockupForBrand, unconfirmedDescriptors } from './brands'

test('product brands carry a PS | PRODUCT wordmark', () => {
  assert.equal(lockupForBrand('ps-rcm').product, 'RCM')
  assert.equal(lockupForBrand('ps-lexi').product, 'LEXI')
  assert.equal(lockupForBrand('ps-connect').product, 'CONNECT')
})

test('umbrella brands fall back to the logo', () => {
  assert.equal(lockupForBrand('excelent-company').product, null)
  assert.equal(lockupForBrand('excelent-practice-solutions').product, null)
})

test('an unknown slug degrades instead of throwing', () => {
  const l = lockupForBrand('does-not-exist')
  assert.equal(l.product, null)
  assert.equal(l.descriptor, '')
})

test('only the RCM descriptor is client-confirmed', () => {
  // The rest are placeholders Claude wrote. This test is a standing reminder:
  // when the client supplies real wording, flip descriptorConfirmed and the
  // expected list here shrinks.
  assert.equal(lockupForBrand('ps-rcm').descriptor, 'REVENUE CYCLE MANAGEMENT')
  assert.deepEqual(unconfirmedDescriptors().sort(), [
    'excelent-company',
    'excelent-practice-solutions',
    'ps-connect',
    'ps-lexi',
  ])
})
