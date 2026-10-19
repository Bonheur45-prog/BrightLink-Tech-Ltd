import { cache } from 'react'

import { loadFooter, loadHeader, loadSiteSettings } from './site'

import { normalizeProjectDetail, normalizeServiceDetail } from './normalize'
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
 * PHASE 1 STATUS: Payload has been removed, and the new Prisma-backed content (phases 2–5) does not exist
 * yet, so every helper returns the built-in starter content from ./defaults. The public site therefore
 * looks the same as before but is NOT editable until Phase 6 reconnects these helpers to the database.
 * Keep the function names and return types: the pages already depend on them.
 */
// Phase 2: settings, header and footer now come from the database (see ./site.ts).
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => loadSiteSettings('en'))
export const getHeader = cache(async (): Promise<HeaderData> => loadHeader('en'))
export const getHomePage = cache(async (): Promise<HomePageData> => DEFAULT_HOME)
export const getFooter = cache(async (): Promise<FooterData> => loadFooter('en'))
export const getServices = cache(async (): Promise<ServiceItem[]> => STARTER_SERVICES)
export const getProjects = cache(async (limit = 50): Promise<ProjectItem[]> => STARTER_PROJECTS.slice(0, limit))
export const getClients = cache(async (): Promise<ClientItem[]> => STARTER_CLIENTS)
export const getAboutPage = cache(async (): Promise<AboutData> => DEFAULT_ABOUT)
/** No starter people: nothing is invented, an empty list is a valid state. */
export const getTeam = cache(async (): Promise<TeamMember[]> => [])
export const getServicesPage = cache(async (): Promise<ServicesPageData> => DEFAULT_SERVICES_PAGE)
export const getProjectsPage = cache(async (): Promise<ProjectsPageData> => DEFAULT_PROJECTS_PAGE)
export const getBlogPage = cache(async (): Promise<BlogPageData> => DEFAULT_BLOG_PAGE)
export const getContactPage = cache(async (): Promise<ContactPageData> => DEFAULT_CONTACT_PAGE)

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
