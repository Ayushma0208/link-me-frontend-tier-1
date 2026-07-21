import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const API_URL = process.env.API_URL ?? 'http://localhost:4000'

// Serwist needs Webpack (not Turbopack). Production always enables PWA.
// Locally: use `npm run dev:pwa` (ENABLE_PWA=1, Webpack) or `npm run preview:pwa`.
const enablePwa =
  process.env.NODE_ENV === 'production' || process.env.ENABLE_PWA === '1'

const offlineRevision = createHash('md5')
  .update(readFileSync('./src/app/~offline/page.tsx', 'utf8'))
  .digest('hex')

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: !enablePwa,
  // Required: HTML for /~offline must be precached or the SW fallback fails
  additionalPrecacheEntries: [{ url: '/~offline', revision: offlineRevision }],
})

const nextConfig: NextConfig = {
  transpilePackages: ['@link-me/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Browser calls /api/auth/login → gateway /api/v1/auth/login
        source: '/api/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ]
  },
}

export default enablePwa ? withSerwist(nextConfig) : nextConfig
