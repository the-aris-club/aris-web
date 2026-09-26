import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    // App lives in apps/web, so the repo root (workspace root) is two levels up.
    root: path.resolve(import.meta.dirname, '../..'),
  },
}

export default nextConfig
