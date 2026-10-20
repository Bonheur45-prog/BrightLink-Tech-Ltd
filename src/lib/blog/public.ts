import 'server-only';
import { getAllPosts } from '@/lib/content';
import { prisma } from '@/lib/db';
import { cachedPublic } from '@/lib/public-cache';

export type FeedItem = { title: string; url: string; publishedAt: string; category: string; excerpt: string };

/**
 * Published articles for the RSS feed (newest first). Scheduled ones appear once their date has
 * passed (within the cache's refresh time). Falls back to the starter articles if the database has none
 * or cannot be reached. Phase 6 moves the blog pages onto the same data.
 */
export const loadFeedPosts = cachedPublic('blog-feed', async (): Promise<FeedItem[]> => {
  try {
    const rows = await prisma.post.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, noIndex: false, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      include: { translations: { where: { locale: 'en' } }, category: { include: { translations: { where: { locale: 'en' } } } } },
    });
    if (rows.length) {
      return rows.map((p) => ({
        title: p.translations[0]?.title ?? p.slug,
        url: `/blog/${p.slug}`,
        publishedAt: p.publishedAt!.toISOString(),
        category: p.category.translations[0]?.name ?? '',
        excerpt: p.translations[0]?.excerpt ?? '',
      }));
    }
  } catch (error) {
    console.error('[blog] feed could not read the database; using starter articles', error);
  }
  return (await getAllPosts()).slice(0, 30).map((p) => ({ title: p.title, url: p.url, publishedAt: p.publishedAt, category: p.category?.name ?? '', excerpt: p.excerpt }));
});
