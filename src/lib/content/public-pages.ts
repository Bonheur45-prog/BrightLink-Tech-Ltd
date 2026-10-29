import 'server-only'

import type { Locale } from '@/i18n/config'
import { getPublished, type DocKey } from '@/lib/cms/drafts'
import { prisma } from '@/lib/db'
import { mediaUrl } from '@/lib/media'
import { cachedPublic } from '@/lib/public-cache'
import { normalizeBlogPage } from './normalize'
import type { BlogPageData } from './types'
import type { PageDoc, Section } from '@/lib/pages/model'

type Obj = Record<string, unknown>
type AssetRow = {
  id: string
  objectKey: string
  width: number
  height: number
  mimeType: string
  translations: { locale: string; alt: string }[]
}
type PublishedPage = { doc: PageDoc; assets: Record<string, { url: string; alt: string; width: number; height: number; mimeType: string }> }

const MEDIA_FIELDS = new Set(['image', 'video', 'poster', 'ogImage', 'backgroundImage', 'secondImage', 'groupPhoto'])
const object = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {})
const isTranslation = (v: Obj) => Object.keys(v).length > 0 && Object.keys(v).every((k) => ['en', 'fr', 'rw'].includes(k)) && Object.values(v).every((x) => typeof x === 'string')

function text(v: unknown, locale: Locale): string {
  if (typeof v === 'string') return v
  const row = object(v)
  if (isTranslation(row)) return String(row[locale] || row.en || row.fr || row.rw || '')
  return ''
}

function mediaIds(value: unknown, key = ''): string[] {
  if (typeof value === 'string') return MEDIA_FIELDS.has(key) && /^[a-z0-9]{10,40}$/.test(value) ? [value] : []
  if (Array.isArray(value)) return value.flatMap((x) => mediaIds(x))
  const row = object(value)
  return Object.entries(row).flatMap(([childKey, child]) => mediaIds(child, childKey))
}

const publicPage = cachedPublic('public-page', async (key: DocKey, locale: Locale): Promise<PublishedPage | null> => {
  const doc = await getPublished(key)
  if (!doc || key === 'header' || key === 'footer') return null
  const page = doc as PageDoc
  const ids = [...new Set([
    ...mediaIds(page.sections),
    ...page.sections.flatMap((s) => s.background.image ? [s.background.image] : []),
    ...(page.seo.ogImage ? [page.seo.ogImage] : []),
  ])]
  const rows: AssetRow[] = ids.length ? await prisma.mediaAsset.findMany({
    where: { id: { in: ids }, deletedAt: null },
    include: { translations: true },
  }) : []
  const assets: PublishedPage['assets'] = {}
  for (const row of rows) {
    try {
      assets[row.id] = {
        url: mediaUrl(row.objectKey),
        alt: row.translations.find((t) => t.locale === locale)?.alt || row.translations.find((t) => t.locale === 'en')?.alt || '',
        width: row.width,
        height: row.height,
        mimeType: row.mimeType,
      }
    } catch {
      // Missing public media configuration leaves the field empty and lets the page fallback render.
    }
  }
  return { doc: page, assets }
})

function convert(v: unknown, locale: Locale, assets: PublishedPage['assets'], key = ''): unknown {
  if (typeof v === 'string') return MEDIA_FIELDS.has(key) ? assets[v] ?? null : v
  if (Array.isArray(v)) return v.map((item) => convert(item, locale, assets))
  if (!v || typeof v !== 'object') return v
  const row = v as Obj
  if (isTranslation(row)) return text(row, locale)
  if ('label' in row && 'url' in row && ('newTab' in row || Object.keys(row).length <= 3)) {
    return { label: text(row.label, locale), url: typeof row.url === 'string' ? row.url : '', openInNewTab: row.newTab === true }
  }
  return Object.fromEntries(Object.entries(row).map(([childKey, child]) => [childKey, convert(child, locale, assets, childKey)]))
}

function fields(section: Section | undefined, locale: Locale, assets: PublishedPage['assets']): Obj {
  return section ? object(convert(section.data, locale, assets)) : {}
}
function section(doc: PageDoc, type: string, nth = 0): Section | undefined {
  return doc.sections.filter((s) => s.type === type)[nth]
}
function sectionFields(doc: PageDoc, type: string, locale: Locale, assets: PublishedPage['assets'], nth = 0) {
  return fields(section(doc, type, nth), locale, assets)
}
function visible(s: Section | undefined): boolean { return s?.visible ?? false }
function banner(doc: PageDoc, locale: Locale, assets: PublishedPage['assets']): Obj {
  return sectionFields(doc, 'banner', locale, assets)
}
function seo(doc: PageDoc, locale: Locale, assets: PublishedPage['assets']): Obj {
  return {
    metaTitle: text(doc.seo.title, locale),
    metaDescription: text(doc.seo.description, locale),
    ogImage: doc.seo.ogImage ? assets[doc.seo.ogImage] ?? null : null,
  }
}





export async function loadBlogPage(locale: Locale): Promise<BlogPageData | null> {
  const page = await publicPage('blog', locale)
  if (!page) return null
  const { doc, assets } = page
  const posts = fields(section(doc, 'posts'), locale, assets)
  const newsletterSection = section(doc, 'newsletter')
  const newsletter = fields(newsletterSection, locale, assets)
  return normalizeBlogPage({
    banner: banner(doc, locale, assets),
    postsPerPage: posts.limit,
    latestHeading: posts.heading,
    subscribe: { ...newsletter, enabled: visible(newsletterSection) },
    seo: seo(doc, locale, assets),
  })
}


