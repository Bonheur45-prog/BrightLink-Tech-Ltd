import 'server-only'

import type { Locale } from '@/i18n/config'
import { prisma } from '@/lib/db'
import { mediaUrl } from '@/lib/media'
import { cachedPublic } from '@/lib/public-cache'
import { safeHref } from '@/lib/blog/render'
import { normalizeBlogCategory, normalizeBlogPost } from './normalize'
import type { BlogCategory, BlogPost, BlogPostFull } from './types'

type MediaRow = {
  id: string
  objectKey: string
  width: number
  height: number
  mimeType: string
  variants: unknown
  translations: { locale: string; alt: string }[]
}
type Node = { type?: string; text?: string; attrs?: Record<string, unknown>; marks?: { type?: string; attrs?: Record<string, unknown> }[]; content?: Node[] }
type Obj = Record<string, unknown>
const obj = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {}
const translation = <T extends { locale: string }>(rows: T[], locale: Locale): T | undefined =>
  rows.find((row) => row.locale === locale) ?? rows.find((row) => row.locale === 'en')

function mediaRef(row: MediaRow | null | undefined, locale: Locale) {
  if (!row) return null
  try {
    return {
      url: mediaUrl(row.objectKey),
      alt: translation(row.translations, locale)?.alt ?? '',
      width: row.width,
      height: row.height,
      mimeType: row.mimeType,
    }
  } catch {
    return null
  }
}

function imageIds(doc: unknown): string[] {
  const ids: string[] = []
  const walk = (node: Node) => {
    if (node.type === 'image' && typeof node.attrs?.mediaId === 'string') ids.push(node.attrs.mediaId)
    ;(node.content ?? []).forEach(walk)
  }
  if (doc && typeof doc === 'object') walk(doc as Node)
  return [...new Set(ids)]
}

function inlineNodes(nodes: Node[] = []): Obj[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'text' || typeof node.text !== 'string') {
      if (node.type === 'hardBreak') return [{ type: 'linebreak', text: '\n' }]
      return (node.content ?? []).flatMap((child) => inlineNodes([child]))
    }
    let format = 0
    let link: { url: string; newTab: boolean } | null = null
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') format |= 1
      else if (mark.type === 'italic') format |= 2
      else if (mark.type === 'code') format |= 16
      else if (mark.type === 'link') {
        const href = safeHref(mark.attrs?.href)
        if (href) link = { url: href, newTab: mark.attrs?.target === '_blank' || /^https?:/i.test(href) }
      }
    }
    const textNode: Obj = { type: 'text', text: node.text, format }
    return link ? [{ type: 'link', fields: { url: link.url, newTab: link.newTab }, children: [textNode] }] : [textNode]
  })
}

function tiptapToLexical(doc: unknown, assets: Record<string, MediaRow>): unknown {
  const convert = (node: Node): Obj[] => {
    const children = (node.content ?? []).flatMap(convert)
    const plainText = (part: Node): string => part.type === 'text' ? part.text ?? '' : (part.content ?? []).map(plainText).join(' ')
    switch (node.type) {
      case 'text':
        return inlineNodes([node])
      case 'paragraph':
        return [{ type: 'paragraph', children }]
      case 'heading': {
        const level = Number(node.attrs?.level) || 2
        return [{ type: 'heading', tag: level >= 3 ? 'h3' : 'h2', children }]
      }
      case 'bulletList':
      case 'orderedList':
        return [{ type: 'list', listType: node.type === 'orderedList' ? 'number' : 'bullet', children }]
      case 'listItem':
        return [{ type: 'listitem', children }]
      case 'blockquote':
      case 'callout':
        return [{ type: 'quote', children }]
      case 'horizontalRule':
        return [{ type: 'horizontalrule' }]
      case 'image': {
        const id = typeof node.attrs?.mediaId === 'string' ? node.attrs.mediaId : ''
        const media = assets[id]
        if (!media) return []
        const alt = typeof node.attrs?.alt === 'string' && node.attrs.alt.trim() ? node.attrs.alt : media.translations.find((t) => t.locale === 'en')?.alt ?? ''
        const caption = typeof node.attrs?.title === 'string' ? node.attrs.title : ''
        return [{ type: 'upload', value: { url: mediaUrl(media.objectKey), alt, caption, mimeType: media.mimeType } }]
      }
      case 'table':
      case 'tableRow': {
        const text = plainText(node).trim()
        return text ? [{ type: 'paragraph', children: [{ type: 'text', text, format: 0 }] }] : []
      }
      case 'tableCell':
      case 'tableHeader':
        return children
      case 'codeBlock': {
        const text = (node.content ?? []).map((child) => child.text ?? '').join('')
        return text ? [{ type: 'paragraph', children: [{ type: 'text', text, format: 16 }] }] : []
      }
      case 'doc':
        return children
      default:
        return children
    }
  }
  const root = obj(doc)
  const content = Array.isArray(root.content) ? root.content as Node[] : []
  return { root: { type: 'root', children: content.flatMap(convert) } }
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

export async function loadPublicPostBySlug(slug: string, locale: Locale): Promise<{ state: 'found'; post: BlogPostFull } | { state: 'empty' | 'missing' }> {
  const result = await cachedPublic('public-blog-post', async (postSlug: string, requestLocale: Locale) => {
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
    const doc = t.doc
    const ids = imageIds(doc)
    const assets = (ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids }, deletedAt: null }, include: { translations: true } }) : [])
      .reduce<Record<string, MediaRow>>((out, media) => { out[media.id] = media; return out }, {})
    const authorT = row.author ? translation(row.author.translations, requestLocale) : undefined
    const raw = {
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
        ogImage: t.ogMediaId ? mediaRef(await prisma.mediaAsset.findFirst({ where: { id: t.ogMediaId, deletedAt: null }, include: { translations: true } }), requestLocale) : null,
        focusKeyword: row.focusKeyword,
        canonicalUrl: row.canonicalUrl,
        noIndex: row.noIndex,
      },
      content: tiptapToLexical(doc, assets),
    }
    const post = normalizeBlogPost(raw, true)
    return post ? { state: 'found' as const, post } : { state: 'missing' as const }
  })(slug, locale)
  return result
}
