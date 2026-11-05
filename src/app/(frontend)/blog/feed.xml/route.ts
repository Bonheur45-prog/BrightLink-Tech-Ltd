import { getSiteSettings } from '@/lib/content'
import { loadFeedPosts } from '@/lib/blog/public'
import { absoluteUrl, getServerUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const mime = (url: string) => (/\.png$/i.test(url) ? 'image/png' : /\.jpe?g$/i.test(url) ? 'image/jpeg' : 'image/webp')
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** RSS feed of the latest articles, for feed readers and as an extra signal to search engines. */
export async function GET() {
  const [settings, posts] = await Promise.all([getSiteSettings(), loadFeedPosts()])
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${absoluteUrl(p.url)}</link>
      <guid isPermaLink="true">${absoluteUrl(p.url)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
${p.category ? `      <category>${esc(p.category)}</category>\n` : ''}      <description>${esc(p.excerpt)}</description>
${p.image ? `      <media:content url="${esc(absoluteUrl(p.image))}" medium="image" type="${mime(p.image)}" />\n      <enclosure url="${esc(absoluteUrl(p.image))}" length="0" type="${mime(p.image)}" />\n` : ''}    </item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(settings.companyName)} Blog</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>${esc(settings.seo.defaultDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(posts[0]?.publishedAt ?? Date.now()).toUTCString()}</lastBuildDate>
    <image>
      <url>${absoluteUrl('/images/brand/brightlink-mark.png')}</url>
      <title>${esc(settings.companyName)} Blog</title>
      <link>${absoluteUrl('/blog')}</link>
    </image>
    <atom:link href="${getServerUrl()}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } })
}
