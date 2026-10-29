import type { NextConfig } from 'next';

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
    // Photos are never resized on this server: the loader picks the ready-made WebP copy stored in R2
    // (480 / 960 / 1600 px or the original) for each screen size. See src/lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    // Widths the browser chooses between (close to the stored copies, so little is wasted).
    deviceSizes: [480, 640, 960, 1280, 1600, 1920, 2400],
    imageSizes: [64, 128, 256, 384],
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
