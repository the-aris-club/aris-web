import path from 'node:path'

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
  turbopack: {
    // App lives in apps/web, so the repo root (workspace root) is two levels up.
    root: path.resolve(import.meta.dirname, '../..'),
  },
}

export default nextConfig
