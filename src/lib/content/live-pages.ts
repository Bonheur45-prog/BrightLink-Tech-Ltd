import 'server-only'

import type { Locale } from '@/i18n/config'
import { getPublished } from '@/lib/cms/drafts'
import { prisma } from '@/lib/db'
import { mediaUrl, photoUrl } from '@/lib/media'
import type { FixedPageKey } from '@/lib/pages/catalogue'
import { FIXED_PAGE_DEFAULTS, servicePageDefault } from '@/lib/pages/defaults'
import { pageMediaIds } from '@/lib/pages/media'
import type { PageDoc } from '@/lib/pages/model'
import { cachedPublic } from '@/lib/public-cache'
import type { MediaRef, ServiceItem } from './types'

// Pages built in /admin/pages, as visitors see them: the PUBLISHED version (drafts never show), or the
// starter page while nothing has been published. Hidden sections are removed here. Every photo and
// video the page uses is looked up in one query and returned with it, in the visitor's language.
// Rendered section by section by src/components/sections/PageSections.tsx.

export type LivePage = {
  doc: PageDoc
  /** Photos and videos used by the page, by media library id. */
  media: Record<string, MediaRef>
  /** false = nothing published yet, the starter page is shown */
  published: boolean
}

async function loadMedia(ids: string[], locale: Locale): Promise<Record<string, MediaRef>> {
  if (!ids.length) return {}
  const rows = await prisma.mediaAsset.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true, kind: true, objectKey: true, posterKey: true, mimeType: true, width: true, height: true, variants: true, translations: { select: { locale: true, alt: true } } },
  })
  const out: Record<string, MediaRef> = {}
  for (const m of rows) {
    try {
      out[m.id] = {
        url: photoUrl(m),
        alt: m.translations.find((t) => t.locale === locale)?.alt || m.translations.find((t) => t.locale === 'en')?.alt || '',
        width: m.width,
        height: m.height,
        mimeType: m.mimeType,
        ...(m.kind === 'VIDEO' && m.posterKey ? { poster: mediaUrl(m.posterKey) } : {}),
      }
    } catch {
      // R2_PUBLIC_HOSTNAME not set: no address can be built, so the section shows its built-in artwork.
    }
  }
  return out
}

async function finish(doc: PageDoc, published: boolean, locale: Locale): Promise<LivePage> {
  const visible: PageDoc = { ...doc, sections: doc.sections.filter((s) => s.visible) }
  let media: Record<string, MediaRef> = {}
  try {
    media = await loadMedia(pageMediaIds(visible), locale)
  } catch (error) {
    console.error('[pages] photos could not be loaded', error)
  }
  return { doc: visible, media, published }
}

/** Home, About us, Our services, Our projects, Blog, Contact us. */
export const loadLivePage = cachedPublic('live-page', async (key: FixedPageKey, locale: Locale): Promise<LivePage> => {
  let doc: PageDoc | null = null
  try {
    doc = await getPublished(key)
  } catch (error) {
    console.error(`[pages] "${key}" could not be loaded; showing the starter page`, error)
  }
  return finish(doc ?? FIXED_PAGE_DEFAULTS[key](), !!doc, locale)
})

/** The page of one service ("service-<id>" in the page builder), or its starter page. */
export const loadLiveServicePage = cachedPublic(
  'live-service-page',
  async (service: Pick<ServiceItem, 'id' | 'slug' | 'title' | 'shortDescription' | 'features'>, locale: Locale): Promise<LivePage> => {
    let doc: PageDoc | null = null
    try {
      // starter services (database unreachable) have no page in the database
      if (/^[a-z0-9]{10,40}$/.test(service.id)) doc = await getPublished(`service-${service.id}`)
    } catch (error) {
      console.error(`[pages] the page of service "${service.slug}" could not be loaded; showing its starter page`, error)
    }
    const { id: _id, ...forDefault } = service
    return finish(doc ?? servicePageDefault(forDefault), !!doc, locale)
  },
)
