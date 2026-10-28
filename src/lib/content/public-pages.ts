import 'server-only'

import type { Locale } from '@/i18n/config'
import { getPublished, type DocKey } from '@/lib/cms/drafts'
import { prisma } from '@/lib/db'
import { mediaUrl } from '@/lib/media'
import { cachedPublic } from '@/lib/public-cache'
import {
  normalizeAbout,
  normalizeBlogPage,
  normalizeContactPage,
  normalizeHome,
  normalizeProjectsPage,
  normalizeServicesPage,
  normalizeServiceDetail,
} from './normalize'
import type {
  AboutData,
  BlogPageData,
  ContactPageData,
  HomePageData,
  ProjectsPageData,
  ServicesPageData,
  ServiceDetail,
  ServiceItem,
} from './types'
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
const list = (v: unknown): Obj[] => Array.isArray(v) ? v.map(object) : []
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
function featureItems(v: unknown): Obj[] {
  return list(v).map((item) => ({ icon: item.icon ?? '', title: item.title ?? '', text: item.text ?? '' }))
}
function linkUrl(v: unknown): string {
  const row = object(v)
  return typeof row.url === 'string' ? row.url : ''
}

export async function loadHomePage(locale: Locale): Promise<HomePageData | null> {
  const page = await publicPage('home', locale)
  if (!page) return null
  const { doc, assets } = page
  const hero = section(doc, 'hero')
  const heroData = fields(hero, locale, assets)
  const slides = list(heroData.slides).map((slide) => ({
    ...slide,
    mediaType: slide.video ? 'video' : slide.image ? 'image' : 'none',
  }))
  const highlights = list(fields(section(doc, 'highlights'), locale, assets).items).map((item) => ({
    ...item,
    url: linkUrl(item.link),
  }))
  const textMedia = fields(section(doc, 'textMedia'), locale, assets)
  const services = fields(section(doc, 'services'), locale, assets)
  const features = fields(section(doc, 'features'), locale, assets)
  const newsletter = fields(section(doc, 'newsletter'), locale, assets)
  const projects = fields(section(doc, 'projects'), locale, assets)
  const clients = fields(section(doc, 'clients'), locale, assets)
  const contact = fields(section(doc, 'contact'), locale, assets)
  return normalizeHome({
    hero: { ...heroData, enabled: visible(hero), height: hero?.variant ?? 'large', slides },
    highlights,
    whoWeAre: {
      ...textMedia, enabled: visible(section(doc, 'textMedia')), intro: textMedia.body,
      features: featureItems(textMedia.items), learnMore: textMedia.primaryCta,
    },
    whatWeDo: { ...services, enabled: visible(section(doc, 'services')) },
    why: { ...features, enabled: visible(section(doc, 'features')), message: features.intro, points: featureItems(features.items), newsletter: { ...newsletter, enabled: visible(section(doc, 'newsletter')) } },
    portfolio: { ...projects, enabled: visible(section(doc, 'projects')) },
    clients: { ...clients, enabled: visible(section(doc, 'clients')) },
    contact: { ...contact, enabled: visible(section(doc, 'contact')) },
    seo: seo(doc, locale, assets),
  })
}

export async function loadAboutPage(locale: Locale): Promise<AboutData | null> {
  const page = await publicPage('about', locale)
  if (!page) return null
  const { doc, assets } = page
  const storySection = section(doc, 'textMedia')
  const story = fields(storySection, locale, assets)
  const mission = fields(section(doc, 'mission'), locale, assets)
  const processSection = section(doc, 'features')
  const process = fields(processSection, locale, assets)
  const services = fields(section(doc, 'services'), locale, assets)
  const team = fields(section(doc, 'team'), locale, assets)
  const closing = fields(section(doc, 'cta'), locale, assets)
  return normalizeAbout({
    banner: banner(doc, locale, assets),
    story: { ...story, enabled: visible(storySection), intro: story.body, points: String(story.points ?? '').split('\n').filter(Boolean).map((value) => ({ text: value })), cta: story.primaryCta },
    glance: { ...sectionFields(doc, 'glance', locale, assets), enabled: visible(section(doc, 'glance')) },
    mission: { ...mission, enabled: visible(section(doc, 'mission')), values: featureItems(mission.items) },
    process: { ...process, enabled: visible(processSection), steps: featureItems(process.items) },
    services: { ...services, enabled: visible(section(doc, 'services')) },
    team: { ...team, enabled: visible(section(doc, 'team')) },
    showClients: visible(section(doc, 'clients')),
    closing: { ...closing, enabled: visible(section(doc, 'cta')) },
    seo: seo(doc, locale, assets),
  })
}

export async function loadServicesPage(locale: Locale): Promise<ServicesPageData | null> {
  const page = await publicPage('services', locale)
  if (!page) return null
  const { doc, assets } = page
  const listSection = section(doc, 'services')
  const listing = fields(listSection, locale, assets)
  const whySection = section(doc, 'features')
  const why = fields(whySection, locale, assets)
  const projectSection = section(doc, 'projects')
  const closing = fields(section(doc, 'cta'), locale, assets)
  return normalizeServicesPage({
    banner: banner(doc, locale, assets),
    listing,
    why: { ...why, enabled: visible(whySection), message: why.intro, backgroundImage: why.image, points: featureItems(why.items) },
    showProjects: visible(projectSection),
    closing: { ...closing, enabled: visible(section(doc, 'cta')) },
    seo: seo(doc, locale, assets),
  })
}

export async function loadProjectsPage(locale: Locale): Promise<ProjectsPageData | null> {
  const page = await publicPage('projects', locale)
  if (!page) return null
  const { doc, assets } = page
  const completed = fields(section(doc, 'projects', 0), locale, assets)
  const inProgress = fields(section(doc, 'projects', 1), locale, assets)
  const closing = fields(section(doc, 'cta'), locale, assets)
  return normalizeProjectsPage({
    banner: banner(doc, locale, assets),
    completed,
    inProgress,
    closing: { ...closing, enabled: visible(section(doc, 'cta')) },
    seo: seo(doc, locale, assets),
  })
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

export async function loadContactPage(locale: Locale): Promise<ContactPageData | null> {
  const page = await publicPage('contact', locale)
  if (!page) return null
  const { doc, assets } = page
  const contact = fields(section(doc, 'contact'), locale, assets)
  const newsletterSection = section(doc, 'newsletter')
  const newsletter = fields(newsletterSection, locale, assets)
  return normalizeContactPage({
    banner: banner(doc, locale, assets),
    form: { ...contact, backgroundImage: contact.image },
    subscribe: { ...newsletter, enabled: visible(newsletterSection) },
    seo: seo(doc, locale, assets),
  })
}

export async function loadServiceDetailPage(key: DocKey, service: ServiceItem, locale: Locale): Promise<ServiceDetail | null> {
  const page = await publicPage(key, locale)
  if (!page) return null
  const { doc, assets } = page
  const overview = fields(section(doc, 'textMedia'), locale, assets)
  const featureSections = doc.sections.filter((s) => s.type === 'features')
  const offerings = fields(featureSections[0], locale, assets)
  const why = fields(featureSections[1], locale, assets)
  const process = fields(featureSections[2], locale, assets)
  const work = fields(section(doc, 'projects'), locale, assets)
  const faq = fields(section(doc, 'faq'), locale, assets)
  const cta = fields(section(doc, 'cta'), locale, assets)
  return normalizeServiceDetail({
    ...service,
    features: service.features.map((text) => ({ text })),
    banner: banner(doc, locale, assets),
    overview: { ...overview, text: overview.body },
    offerings,
    why: { ...why, message: why.intro, points: featureItems(why.items) },
    process: { ...process, steps: featureItems(process.items) },
    work,
    faqs: list(faq.items),
    cta,
    seo: seo(doc, locale, assets),
  })
}
