// The sticky-stack arithmetic, and the easing curve the entrances share.
//
// stackDepths was 24 lines inside a useEffect closure in
// components/stacking-agent-cards.tsx, so the only way to check it was to scroll
// the page and watch. It is now pure, and this is its first test.
//
// Run with `node --test`. The rest of the module needs a DOM and is exercised
// through the page; see docs/adr/0003-node-test-runner-without-ci-until-a-second-file.md
// for why there is still no test script or CI step.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { EASE, stackDepths } from './motion.ts'

// A sticky card parks at `80 + 16 * i` and its rect.top falls to that value as
// it sticks, so a top of 0 means fully stuck and a large top means not yet
// reached. These four are the offsets the cards actually use.
const STICKY = [80, 96, 112, 128]

// Far below every offset: nothing has stuck yet.
const UNSTUCK = [500, 400, 300, 200]

test('no cards stacked when no card has reached its sticky position', () => {
  assert.deepEqual(stackDepths(UNSTUCK, STICKY), [0, 0, 0, 0])
})

test('every card stacked when every card has reached its sticky position', () => {
  assert.deepEqual(stackDepths([80, 96, 112, 128], STICKY), [3, 2, 1, 0])
})

test('depth counts only the cards below, never the ones above', () => {
  // Card 0 is at the bottom of the stack and has three on it; the last card has
  // none, whatever the others are doing.
  assert.deepEqual(stackDepths([200, 96, 112, 128], STICKY), [3, 2, 1, 0])
  assert.equal(stackDepths([200, 96, 112, 128], STICKY).at(-1), 0)
})

test('a card part-way through the stack counts the ones that have passed it', () => {
  // Only card 3 has reached its offset, so it sits on top of all three cards
  // below it. Depth is what is stacked ON a card, not how far down it is.
  assert.deepEqual(stackDepths([500, 400, 300, 128], STICKY), [1, 1, 1, 0])
})

test('an unmeasured card is not counted as stacked', () => {
  // null means the ref has not been attached yet, which is not the same as
  // having reached the sticky offset.
  assert.deepEqual(stackDepths([500, null, 300, 200], STICKY), [0, 0, 0, 0])
  assert.deepEqual(stackDepths([500, null, null, 128], STICKY), [1, 1, 1, 0])
})

test('the tolerance absorbs a card sitting a hair above its offset', () => {
  // 129 is one pixel past card 3's own offset, so without a tolerance it reads
  // as not yet stuck and the card flickers between two depths on the scroll.
  assert.deepEqual(stackDepths([500, 400, 300, 129], STICKY), [1, 1, 1, 0])
  assert.deepEqual(stackDepths([500, 400, 300, 131], STICKY), [0, 0, 0, 0])
})

test('the tolerance is a parameter, not a constant buried in the loop', () => {
  assert.deepEqual(stackDepths([500, 400, 300, 131], STICKY), [0, 0, 0, 0])
  assert.deepEqual(stackDepths([500, 400, 300, 131], STICKY, 4), [1, 1, 1, 0])
})

test('no cards in, no depths out', () => {
  assert.deepEqual(stackDepths([], []), [])
})

test('the easing curve is defined once and typed literally nowhere else', () => {
  assert.equal(EASE, 'cubic-bezier(0.16, 1, 0.3, 1)')

  const files = [
    'components/hero.tsx',
    'components/reveal-text.tsx',
    'components/stacking-agent-cards.tsx',
  ]
  for (const file of files) {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf-8')
    assert.ok(
      src.includes("from '@/lib/motion'"),
      `${file} does not import the curve from lib/motion`
    )
  }
})
