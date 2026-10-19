import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/**
 * Everything the public website reads from the database goes through this cache, so moving
 * between pages does not wait for the database (which may be far away, e.g. Neon in Europe/US).
 *
 * - Saving or publishing in the CMS calls refreshPublicSite(), which clears this tag: changes show at once.
 * - Changes made outside the CMS (Prisma Studio, scripts) show within REFRESH_SECONDS.
 * - Cached values are stored as JSON: functions wrapped here must return plain data (no Date, no Decimal).
 */
export const PUBLIC_DATA_TAG = 'public-data';
const REFRESH_SECONDS = 60;

export function cachedPublic<A extends unknown[], R>(key: string, load: (...args: A) => Promise<R>) {
  // React's cache() also shares one result between the components of a single page render.
  return cache(unstable_cache(load, [key], { tags: [PUBLIC_DATA_TAG], revalidate: REFRESH_SECONDS }));
}
