import type { MetadataRoute } from 'next'

import { getAllPosts, getBlogCategories, getProjects, getServices } from '@/lib/content'
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
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [services, projects, posts, categories] = await Promise.all([getServices(), getProjects(200), getAllPosts(), getBlogCategories()])
  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...services.map((s) => ({
      url: absoluteUrl(s.url),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: absoluteUrl(p.url),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(c.url),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    // articles marked "hide from search engines" are left out
    ...posts
      .filter((p) => !p.seo.noIndex)
      .map((p) => ({
        url: absoluteUrl(p.url),
        lastModified: new Date(p.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ]
}
