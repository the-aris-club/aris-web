import path from 'node:path'

import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // TypeScript 7 ships no compiler API (lib/typescript.js is gone), so Next's
    // default API-based integration aborts the build. The CLI path shells out to
    // tsc instead and is supported.
    useTypeScriptCli: true,
  },
  images: {
    unoptimized: true,
  },
  // The App Router only treats files whose extension is listed here as route
  // candidates, so the Community Terms page needs mdx added explicitly.
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  turbopack: {
    // App lives in apps/web, so the repo root (workspace root) is two levels up.
    root: path.resolve(import.meta.dirname, '../..'),
    // @next/mdx registers its own Turbopack rule keyed on a RegExp path
    // condition, which Turbopack does not match the way webpack would. The
    // explicit glob below is what makes app/**\page.mdx resolve, and
    // `as: '*.tsx'` is what lets the App Router treat it as a page file.
    rules: {
      '*.mdx': {
        as: '*.tsx',
        loaders: ['@mdx-js/loader'],
      },
    },
  },
}

// The Community Terms are authored as MDX so the Founding Group can edit the
// wording without touching TSX.
//
// No remark plugins here on purpose. remark-gfm would add tables and
// strikethrough, but the source document uses neither, and passing a plugin
// function through this loader breaks the Turbopack build with a
// non-serialisable-options error. Add it in the same commit that introduces a
// table, and expect to move the plugin config into a .mdxrc at that point.
const withMDX = createMDX({ extension: /\.mdx?$/u })

export default withMDX(nextConfig)
