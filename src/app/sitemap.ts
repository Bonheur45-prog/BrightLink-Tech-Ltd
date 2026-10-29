import type { MetadataRoute } from 'next'

import { getAllPosts, getBlogCategories, getProjects, getServices } from '@/lib/content'
import { loadSiteSettings } from '@/lib/content/site'
import { absoluteUrl } from '@/lib/seo'

/**
 * Pages that exist today. As each page is built (Contact) it is added here; services, projects, blog categories and articles come
 * from the CMS, so a new service is in the sitemap as soon as it is published.
 */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about-us', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/our-services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/our-projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact-us', priority: 0.7, changeFrequency: 'monthly' },
]

type Entry = { path: string; lastModified: Date; changeFrequency: 'weekly' | 'monthly'; priority: number }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [settings, services, projects, posts, categories] = await Promise.all([
    loadSiteSettings('en'),
    getServices(),
    getProjects(200),
    getAllPosts(),
    getBlogCategories(),
  ])
  const entries: Entry[] = [
    ...STATIC_ROUTES.map((r) => ({ path: r.path, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...services.map((s) => ({ path: s.url, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...projects.map((p) => ({ path: p.url, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...categories.map((c) => ({ path: c.url, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.5 })),
    // left out: articles hidden from search engines, and articles whose canonical address is another site
    ...posts
      .filter((p) => !p.seo.noIndex && !p.seo.canonicalUrl)
      .map((p) => ({ path: p.url, lastModified: new Date(p.publishedAt), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
  // Every page once per language switched on in Site settings, each listing its other language versions.
  const languages = settings.enabledLocales
  return entries.flatMap((e) =>
    languages.map((locale) => ({
      url: absoluteUrl(e.path, locale),
      lastModified: e.lastModified,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
      ...(languages.length > 1 ? { alternates: { languages: Object.fromEntries(languages.map((l) => [l, absoluteUrl(e.path, l)])) } } : {}),
    })),
  )
}
