import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...ultracite.ignorePatterns,
    'pnpm-lock.yaml',
    '**/.next/**',
    '**/node_modules/**',
  ],
  singleQuote: true,
  semi: false,
})
