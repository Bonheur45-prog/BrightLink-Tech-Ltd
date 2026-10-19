import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PUBLIC_DATA_TAG } from '@/lib/public-cache';

/**
 * Makes the public website show a change right away instead of after its 60-second refresh.
 * The whole public site is refreshed: it is small, and one item appears on many pages
 * (home, its own page, lists, the sitemap).
 */
export function refreshPublicSite() {
  revalidateTag(PUBLIC_DATA_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}
