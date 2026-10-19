import type { NextConfig } from 'next';

// Public hostname of the Cloudflare R2 bucket (custom domain), e.g. media.brightlinkltd.com.
// "https://" or a trailing slash typed by mistake is removed (same rule as normalizeHost in src/lib/media.ts).
const r2Host = process.env.R2_PUBLIC_HOSTNAME?.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');

const config: NextConfig = {
  // Production build = a small self-contained folder (.next/standalone) that runs with `node server.js`.
  // Built on GitHub Actions and copied to the VPS (see docs/DEPLOY.md).
  output: 'standalone',
  poweredByHeader: false,
  // Keep cached pages and data on disk only, not in memory: lower RAM use on a VPS shared with other apps.
  cacheMaxMemorySize: 0,
  devIndicators: false,
  // sharp and the Prisma client are loaded from node_modules at runtime instead of being bundled.
  serverExternalPackages: ['sharp'],
  images: {
    localPatterns: [{ pathname: '/images/**' }],
    remotePatterns: r2Host ? [{ protocol: /^(localhost|127\.0\.0\.1)(:|$)/.test(r2Host) ? 'http' : 'https', hostname: r2Host.replace(/:\d+$/, '') }] : [],
    // WebP only: AVIF encoding is very CPU-heavy on a shared VPS. Phase 6 serves pre-made R2 sizes directly.
    formats: ['image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // Brand files change rarely; let browsers and CDNs keep them for a week.
        source: '/images/brand/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default config;
