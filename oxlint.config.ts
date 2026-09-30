import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import react from 'ultracite/oxlint/react'

export default defineConfig({
  extends: [core, next, react],
  overrides: [
    {
      // A frame callback is not a promise. requestAnimationFrame fires on the
      // next paint whether or not anything awaits it, and the callers here are a
      // mousemove and a scroll listener, neither of which has anything to await.
      // Making the wrapper async would mean awaiting a paint before writing, and
      // that is a frame of latency added to work whose whole point is to write
      // once per frame.
      //
      // The rule is right about the case it was written for — a callback
      // standing in for an async operation — and useFrameCallback is not that.
      // Scoped to this file so it still applies to every other promise in the
      // repository.
      files: ['apps/web/lib/motion.ts'],
      rules: {
        'promise/prefer-await-to-callbacks': 'off',
      },
    },
  ],
})
