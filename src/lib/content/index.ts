import { cache } from 'react'

import { loadFooter, loadHeader, loadSiteSettings } from './site'

import { normalizeClient, normalizeProject, normalizeProjectDetail, normalizeService, normalizeServiceDetail, normalizeTeamMember } from './normalize'
import { prisma } from '@/lib/db'
import { mediaUrl } from '@/lib/media'
import { cachedPublic } from '@/lib/public-cache'
import { loadAboutPage, loadBlogPage, loadContactPage, loadHomePage, loadProjectsPage, loadServicesPage } from './public-pages'
import { DEFAULT_BLOG_PAGE, STARTER_CATEGORIES, STARTER_POSTS } from './blogDefaults'
import { DEFAULT_CONTACT_PAGE } from './contactDefaults'
import { DEFAULT_PROJECTS_PAGE } from './projectDefaults'
import { DEFAULT_SERVICES_PAGE } from './serviceDefaults'
import {
  DEFAULT_ABOUT,
  DEFAULT_HOME,
  STARTER_CLIENTS,
  STARTER_PROJECTS,
  STARTER_PROJECTS_RAW as STARTER_RAW_PROJECTS,
  STARTER_SERVICES,
} from './defaults'
import type {
  AboutData,
  BlogCategory,
  BlogPageData,
  ContactPageData,
  BlogPost,
  BlogPostFull,
  ClientItem,
  FooterData,
  HeaderData,
  HomePageData,
  ProjectItem,
  ProjectDetail,
  ProjectsPageData,
  ServiceDetail,
  ServiceItem,
  ServicesPageData,
  SiteSettingsData,
  TeamMember,
} from './types'

export type * from './types'

/**
 * Data-access helpers used by every public page.
 *
 * Public read models over the Phase 2–5 CMS. Editors keep drafts private; these helpers only expose
 * published collection rows and published page documents, with starter content as a safe fallback.
 * Keep the function names and return types: the pages already depend on them.
 */
// Phase 2: settings, header and footer now come from the database (see ./site.ts).
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => loadSiteSettings('en'))
export const getHeader = cache(async (): Promise<HeaderData> => loadHeader('en'))
export const getHomePage = cache(async (): Promise<HomePageData> => {
  try {
    return (await loadHomePage('en')) ?? DEFAULT_HOME
  } catch (error) {
    console.error('[content] home page could not be loaded; using starter content', error)
    return DEFAULT_HOME
  }
})
export const getFooter = cache(async (): Promise<FooterData> => loadFooter('en'))

type PublicMediaRow = {
  objectKey: string
  width: number
  height: number
  mimeType: string
  translations: { locale: string; alt: string }[]
}

function publicMedia(row: PublicMediaRow | null | undefined): { url: string; alt: string; width: number; height: number; mimeType: string } | null {
  if (!row) return null
  try {
    return {
      url: mediaUrl(row.objectKey),
      alt: row.translations.find((t) => t.locale === 'en')?.alt ?? '',
      width: row.width,
      height: row.height,
      mimeType: row.mimeType,
    }
  } catch {
    return null
  }
}

const servicesFromCms = cachedPublic('public-services', async (): Promise<ServiceItem[]> => {
  const rows = await prisma.service.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { translations: true },
  })
  return rows.flatMap((row) => {
    const translation = row.translations.find((t) => t.locale === 'en')
    if (!translation) return []
    const features = Array.isArray(translation.features) ? translation.features : []
    const item = normalizeService({
      id: row.id,
      slug: row.slug,
      title: translation.title,
      shortDescription: translation.shortDescription,
      features: features.map((feature) => ({ text: String(feature) })),
      icon: row.icon,
      showOnHome: row.showOnHome,
    })
    return item ? [item] : []
  })
})

export const getServices = cache(async (): Promise<ServiceItem[]> => {
  try {
    const rows = await servicesFromCms()
    return rows.length ? rows : STARTER_SERVICES
  } catch (error) {
    console.error('[content] services could not be loaded; using starter content', error)
    return STARTER_SERVICES
  }
})

const projectsFromCms = cachedPublic('public-projects', async (): Promise<ProjectItem[]> => {
  const rows = await prisma.project.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      translations: true,
      coverMedia: { include: { translations: true } },
      service: { include: { translations: true } },
    },
  })
  return rows.flatMap((row) => {
    const translation = row.translations.find((t) => t.locale === 'en')
    if (!translation) return []
    const serviceTranslation = row.service?.translations.find((t) => t.locale === 'en')
    const item = normalizeProject({
      id: row.id,
      slug: row.slug,
      title: translation.title,
      category: translation.category,
      shortDescription: translation.shortDescription,
      featuredImage: publicMedia(row.coverMedia),
      externalUrl: row.externalUrl,
      showOnHome: row.showOnHome,
      service: row.service && serviceTranslation ? { slug: row.service.slug } : null,
      status: row.state === 'IN_PROGRESS' ? 'in-progress' : 'completed',
      progress: row.progress,
    })
    return item ? [item] : []
  })
})

export const getProjects = cache(async (limit = 50): Promise<ProjectItem[]> => {
  try {
    const rows = await projectsFromCms()
    return rows.length ? rows.slice(0, Math.max(0, limit)) : STARTER_PROJECTS.slice(0, limit)
  } catch (error) {
    console.error('[content] projects could not be loaded; using starter content', error)
    return STARTER_PROJECTS.slice(0, limit)
  }
})

const clientsFromCms = cachedPublic('public-clients', async (): Promise<ClientItem[]> => {
  const rows = await prisma.client.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { logoMedia: { include: { translations: true } } },
  })
  return rows.flatMap((row) => {
    const item = normalizeClient({
      id: row.id,
      name: row.name,
      website: row.website,
      logo: publicMedia(row.logoMedia),
    })
    return item ? [item] : []
  })
})

export const getClients = cache(async (): Promise<ClientItem[]> => {
  try {
    const rows = await clientsFromCms()
    return rows.length ? rows : STARTER_CLIENTS
  } catch (error) {
    console.error('[content] clients could not be loaded; using starter content', error)
    return STARTER_CLIENTS
  }
})
export const getAboutPage = cache(async (): Promise<AboutData> => {
  try {
    return (await loadAboutPage('en')) ?? DEFAULT_ABOUT
  } catch (error) {
    console.error('[content] about page could not be loaded; using starter content', error)
    return DEFAULT_ABOUT
  }
})
const teamFromCms = cachedPublic('public-team', async (): Promise<TeamMember[]> => {
  const rows = await prisma.teamMember.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { translations: true, photoMedia: { include: { translations: true } } },
  })
  return rows.flatMap((row) => {
    const translation = row.translations.find((t) => t.locale === 'en')
    if (!translation) return []
    const item = normalizeTeamMember({
      id: row.id,
      name: row.name,
      role: translation.role,
      bio: translation.bio,
      email: row.email,
      linkedin: row.linkedin,
      photo: publicMedia(row.photoMedia),
    })
    return item ? [item] : []
  })
})

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  try {
    return await teamFromCms()
  } catch (error) {
    console.error('[content] team could not be loaded; using empty content', error)
    return []
  }
})
export const getServicesPage = cache(async (): Promise<ServicesPageData> => {
  try {
    return (await loadServicesPage('en')) ?? DEFAULT_SERVICES_PAGE
  } catch (error) {
    console.error('[content] services page could not be loaded; using starter content', error)
    return DEFAULT_SERVICES_PAGE
  }
})
export const getProjectsPage = cache(async (): Promise<ProjectsPageData> => {
  try {
    return (await loadProjectsPage('en')) ?? DEFAULT_PROJECTS_PAGE
  } catch (error) {
    console.error('[content] projects page could not be loaded; using starter content', error)
    return DEFAULT_PROJECTS_PAGE
  }
})
export const getBlogPage = cache(async (): Promise<BlogPageData> => {
  try {
    return (await loadBlogPage('en')) ?? DEFAULT_BLOG_PAGE
  } catch (error) {
    console.error('[content] blog page could not be loaded; using starter content', error)
    return DEFAULT_BLOG_PAGE
  }
})
export const getContactPage = cache(async (): Promise<ContactPageData> => {
  try {
    return (await loadContactPage('en')) ?? DEFAULT_CONTACT_PAGE
  } catch (error) {
    console.error('[content] contact page could not be loaded; using starter content', error)
    return DEFAULT_CONTACT_PAGE
  }
})

export const getServiceBySlug = cache(async (slug: string): Promise<ServiceDetail | null> => {
  const starter = STARTER_SERVICES.find((s) => s.slug === slug)
  if (!starter) return null
  const detail = normalizeServiceDetail({ ...starter, features: starter.features.map((text) => ({ text })) })
  if (!detail) return null
  if (detail.clientsServed.length === 0 && detail.clientsServedFallback.length) {
    const clients = await getClients()
    detail.clientsServed = detail.clientsServedFallback.map((f) => {
      const match = clients.find((c) => c.name.toLowerCase() === f.name.toLowerCase())
      return { name: f.name, note: f.note, logo: match?.logo ?? null, website: match?.website ?? '' }
    })
  }
  return detail
})

/** Projects that belong to one service. */
export const getProjectsForService = cache(async (slug: string): Promise<ProjectItem[]> => {
  const all = await getProjects(100)
  return all.filter((p) => p.serviceSlug === slug)
})

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetail | null> => {
  const starter = STARTER_RAW_PROJECTS.find((p) => p.slug === slug)
  if (!starter) return null
  return normalizeProjectDetail({
    ...starter,
    featuredImage: null,
    service: STARTER_SERVICES.find((s) => s.slug === starter.service) ?? null,
  })
})

/* ------------------------------------------------------------------ blog */

const asList = (p: BlogPostFull): BlogPost => {
  const { blocks: _blocks, ...rest } = p
  return rest
}

export const getAllPosts = cache(async (): Promise<BlogPost[]> => STARTER_POSTS.map(asList))

/** Categories with the number of published articles in each; empty ones are hidden on the site. */
export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  const posts = await getAllPosts()
  return STARTER_CATEGORIES.map((c) => ({ ...c, count: posts.filter((p) => p.category?.slug === c.slug).length })).filter((c) => c.count > 0)
})

export const getPostBySlug = cache(async (slug: string): Promise<BlogPostFull | null> => STARTER_POSTS.find((p) => p.slug === slug) ?? null)
