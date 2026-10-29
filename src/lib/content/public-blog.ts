import 'server-only'

import type { Locale } from '@/i18n/config'
import { prisma } from '@/lib/db'
import { photoUrl } from '@/lib/media'
import { cachedPublic } from '@/lib/public-cache'
import { normalizeBlogCategory, normalizeBlogPost } from './normalize'
import type { BlogArticle, BlogCategory, BlogPost, TocItem } from './types'

type MediaRow = {
  id: string
  objectKey: string
  width: number
  height: number
  mimeType: string
  variants: unknown
  translations: { locale: string; alt: string }[]
}
const translation = <T extends { locale: string }>(rows: T[], locale: Locale): T | undefined =>
  rows.find((row) => row.locale === locale) ?? rows.find((row) => row.locale === 'en')

function mediaRef(row: MediaRow | null | undefined, locale: Locale) {
  if (!row) return null
  try {
    return {
      url: photoUrl(row),
      alt: translation(row.translations, locale)?.alt || row.translations.find((t) => t.locale === 'en')?.alt || '',
      width: row.width,
      height: row.height,
      mimeType: row.mimeType,
    }
  } catch {
    return null
  }
}

const publishedWhere = (now: Date) => ({
  status: 'PUBLISHED' as const,
  deletedAt: null,
  publishedAt: { lte: now },
})

// `_locale` is not used by the query: it keeps one cache entry per language.
const listRows = cachedPublic('public-blog-post-list', async (_locale: Locale) => {
  const now = new Date()
  return prisma.post.findMany({
    where: publishedWhere(now),
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      translations: { select: { locale: true, title: true, excerpt: true, metaTitle: true, metaDescription: true, ogMediaId: true } },
      category: { include: { translations: true } },
      author: { include: { translations: true, photoMedia: { include: { translations: true } } } },
      coverMedia: { include: { translations: true } },
    },
  })
})

function postFromRow(row: Awaited<ReturnType<typeof listRows>>[number], locale: Locale): BlogPost | null {
  const t = translation(row.translations, locale)
  const categoryT = translation(row.category.translations, locale)
  if (!t || !categoryT) return null
  const authorT = row.author ? translation(row.author.translations, locale) : undefined
  const category = {
    id: row.category.id,
    slug: row.category.slug,
    icon: row.category.icon,
    color: row.category.color,
    name: categoryT.name,
    description: categoryT.description,
    seo: { metaTitle: categoryT.metaTitle, metaDescription: categoryT.metaDescription },
  }
  const normalized = normalizeBlogPost({
    id: row.id,
    slug: row.slug,
    title: t.title,
    excerpt: t.excerpt,
    featuredImage: mediaRef(row.coverMedia, locale),
    category,
    tags: row.tags.map((tag) => ({ tag })),
    author: row.author ? {
      name: row.author.name,
      role: authorT?.role ?? '',
      photo: mediaRef(row.author.photoMedia, locale),
    } : null,
    publishedAt: row.publishedAt?.toISOString() ?? row.createdAt.toISOString(),
    readingMinutes: row.readingMinutes,
    featured: row.featured,
    seo: {
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      ogImage: null,
      focusKeyword: row.focusKeyword,
      canonicalUrl: row.canonicalUrl,
      noIndex: row.noIndex,
    },
  })
  return normalized
}

export const loadPublicPosts = cachedPublic('public-posts', async (locale: Locale): Promise<BlogPost[]> => {
  const rows = await listRows(locale)
  return rows.map((row) => postFromRow(row, locale)).filter((post): post is BlogPost => !!post)
})

export const loadPublicCategories = cachedPublic('public-blog-categories', async (locale: Locale): Promise<BlogCategory[]> => {
  const now = new Date()
  const [categories, published] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
      include: { translations: true },
    }),
    prisma.post.findMany({
      where: publishedWhere(now),
      select: { categoryId: true },
    }),
  ])
  const counts = new Map<string, number>()
  for (const post of published) counts.set(post.categoryId, (counts.get(post.categoryId) ?? 0) + 1)
  return categories.flatMap((row) => {
    const t = translation(row.translations, locale)
    const count = counts.get(row.id) ?? 0
    if (!t || !count) return []
    const category = normalizeBlogCategory({
      id: row.id,
      slug: row.slug,
      icon: row.icon,
      color: row.color,
      name: t.name,
      description: t.description,
      seo: { metaTitle: t.metaTitle, metaDescription: t.metaDescription },
    })
    return category ? [{ ...category, count }] : []
  })
})

const tocOf = (v: unknown): TocItem[] =>
  (Array.isArray(v) ? v : [])
    .filter((x): x is { id: string; text: string; level?: number } => !!x && typeof x === 'object' && typeof (x as TocItem).id === 'string' && typeof (x as TocItem).text === 'string')
    .map((x) => ({ id: x.id, text: x.text, level: x.level === 3 ? 3 : 2 }))

/** One published article with its saved HTML, in the visitor's language (English when not translated). */
export async function loadPublicPostBySlug(slug: string, locale: Locale): Promise<{ state: 'found'; post: BlogArticle } | { state: 'empty' | 'missing' }> {
  return cachedPublic('public-blog-article', async (postSlug: string, requestLocale: Locale) => {
    const now = new Date()
    const row = await prisma.post.findFirst({
      where: { ...publishedWhere(now), slug: postSlug },
      include: {
        translations: true,
        category: { include: { translations: true } },
        author: { include: { translations: true, photoMedia: { include: { translations: true } } } },
        coverMedia: { include: { translations: true } },
      },
    })
    if (!row) {
      const any = await prisma.post.findFirst({ where: publishedWhere(now), select: { id: true } })
      return any ? { state: 'missing' as const } : { state: 'empty' as const }
    }
    const t = translation(row.translations, requestLocale)
    const categoryT = translation(row.category.translations, requestLocale)
    if (!t || !categoryT) return { state: 'missing' as const }
    // the body in the visitor's language, or the English one when that language has no text yet
    const body = t.html ? t : (row.translations.find((x) => x.locale === 'en') ?? t)
    const authorT = row.author ? translation(row.author.translations, requestLocale) : undefined
    const ogMedia = t.ogMediaId ? await prisma.mediaAsset.findFirst({ where: { id: t.ogMediaId, deletedAt: null }, include: { translations: true } }) : null
    const post = normalizeBlogPost({
      id: row.id,
      slug: row.slug,
      title: t.title,
      excerpt: t.excerpt,
      featuredImage: mediaRef(row.coverMedia, requestLocale),
      category: {
        id: row.category.id,
        slug: row.category.slug,
        icon: row.category.icon,
        color: row.category.color,
        name: categoryT.name,
        description: categoryT.description,
        seo: { metaTitle: categoryT.metaTitle, metaDescription: categoryT.metaDescription },
      },
      tags: row.tags.map((tag) => ({ tag })),
      author: row.author ? { name: row.author.name, role: authorT?.role ?? '', photo: mediaRef(row.author.photoMedia, requestLocale) } : null,
      publishedAt: row.publishedAt?.toISOString() ?? row.createdAt.toISOString(),
      readingMinutes: row.readingMinutes,
      featured: row.featured,
      seo: {
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        ogImage: mediaRef(ogMedia, requestLocale),
        focusKeyword: row.focusKeyword,
        canonicalUrl: row.canonicalUrl,
        noIndex: row.noIndex,
      },
    })
    return post ? { state: 'found' as const, post: { ...post, html: body.html, toc: tocOf(body.toc) } } : { state: 'missing' as const }
  })(slug, locale)
}
