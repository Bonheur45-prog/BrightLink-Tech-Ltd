import 'server-only'

import type { Metadata } from 'next'

import type { Crumb } from '@/components/ui/PageBanner'
import { getSiteSettings } from '@/lib/content'
import { loadLivePage, loadLiveServicePage, type LivePage } from '@/lib/content/live-pages'
import { getRequestLocale } from '@/lib/content/request-locale'
import type { ServiceItem, SiteSettingsData } from '@/lib/content/types'
import { tr } from '@/lib/cms/globals-model'
import type { FixedPageKey } from '@/lib/pages/catalogue'
import { buildMetadata, faqJsonLd } from '@/lib/seo'
import { faqPairs } from './MoreSections'
import type { SectionCtx } from './shared'

// What every page built in /admin/pages needs around its sections: the page itself in the visitor's
// language, its title, its metadata (SEO panel), and the context handed to each section.

export type Loaded = { page: LivePage; settings: SiteSettingsData; title: string; description: string }

/** The page title: the SEO title from the page builder, else the page's name. */
function titleOf(page: LivePage, locale: SiteSettingsData['locale'], fallback: string): string {
  return tr(page.doc.seo.title, locale) || fallback
}

function descriptionOf(page: LivePage, locale: SiteSettingsData['locale'], fallback: string): string {
  const seo = tr(page.doc.seo.description, locale)
  if (seo) return seo
  const banner = page.doc.sections.find((s) => s.type === 'banner')
  return (banner && tr((banner.data.intro as Record<string, string>) ?? {}, locale)) || fallback
}

async function loaded(page: LivePage, fallbackTitle: string): Promise<Loaded> {
  const settings = await getSiteSettings()
  return {
    page,
    settings,
    title: titleOf(page, settings.locale, fallbackTitle),
    description: descriptionOf(page, settings.locale, settings.seo.defaultDescription),
  }
}

export async function loadFixed(key: FixedPageKey, fallbackTitle: string): Promise<Loaded> {
  return loaded(await loadLivePage(key, await getRequestLocale()), fallbackTitle)
}

export async function loadService(service: ServiceItem): Promise<Loaded> {
  const page = await loadLiveServicePage(
    { id: service.id, slug: service.slug, title: service.title, shortDescription: service.shortDescription, features: service.features },
    await getRequestLocale(),
  )
  return loaded(page, service.title)
}

/** Metadata from the page's SEO panel. `home` = the site's default title is used when no SEO title is set. */
export function metadataFor(l: Loaded, path: string, opts: { home?: boolean; fallbackImage?: Loaded['page']['media'][string] | null; noIndex?: boolean } = {}): Metadata {
  const { page, settings } = l
  const seoTitle = tr(page.doc.seo.title, settings.locale)
  const share = page.doc.seo.ogImage ? (page.media[page.doc.seo.ogImage] ?? null) : null
  const firstImage = page.doc.sections.map((s) => (typeof s.data.image === 'string' ? page.media[s.data.image] : undefined)).find((m) => m && !m.mimeType?.startsWith('video/'))
  return buildMetadata({
    settings,
    title: opts.home ? seoTitle || undefined : l.title,
    description: l.description,
    image: share ?? firstImage ?? opts.fallbackImage ?? null,
    path,
    noIndex: page.doc.seo.noIndex || opts.noIndex,
  })
}

/** FAQPage structured data for the questions in the page's FAQ sections (none → nothing). */
export function faqSchema(l: Loaded): Record<string, unknown>[] {
  const faqs = l.page.doc.sections.filter((s) => s.type === 'faq').flatMap((s) => faqPairs(s, l.settings.locale))
  return faqs.length ? [faqJsonLd(faqs)] : []
}

/** The context handed to every section of the page. */
export function sectionContext(l: Loaded, page: { key: string; path: string; crumbs: Crumb[]; serviceSlug?: string; search?: { q: string; page: number }; fallbackImage?: SectionCtx['page']['fallbackImage'] }) {
  return { locale: l.settings.locale, settings: l.settings, page }
}
