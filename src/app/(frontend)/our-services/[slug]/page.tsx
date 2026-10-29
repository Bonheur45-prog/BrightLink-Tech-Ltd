import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadService, metadataFor, sectionContext } from '@/components/sections/live-page'
import { OtherServices } from '@/components/services/OtherServices'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getServices } from '@/lib/content'
import { getRequestLocale } from '@/lib/content/request-locale'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

/**
 * The service, from the same list the rest of the site shows (published services, or the starter
 * services while the database has none or cannot be reached). A trashed or draft service is not found.
 */
async function findService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await findService((await params).slug)
  if (!service) return { title: 'Service not found', robots: { index: false } }
  return metadataFor(await loadService(service), service.url, { fallbackImage: service.image })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const [service, all, locale] = await Promise.all([findService(slug), getServices(), getRequestLocale()])
  if (!service) notFound()
  const t = ui(locale)
  const l = await loadService(service)
  const { settings } = l

  const schema: Record<string, unknown>[] = [
    serviceJsonLd({ locale: settings.locale, name: service.title, description: l.description || service.shortDescription, path: service.url, image: service.image?.url }),
    breadcrumbJsonLd(
      [
        { name: t.home, path: '/' },
        { name: t.ourServices, path: '/our-services' },
        { name: service.title, path: service.url },
      ],
      settings.locale,
    ),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections
        page={l.page}
        title={l.title}
        ctx={sectionContext(l, {
          key: `service-${service.id}`,
          path: service.url,
          crumbs: [{ label: t.home, href: '/' }, { label: t.ourServices, href: '/our-services' }, { label: service.title }],
          serviceSlug: service.slug,
          fallbackImage: service.image ?? null,
        })}
      />
      <OtherServices services={all.filter((s) => s.slug !== slug)} heading={t.otherServices} />
    </>
  )
}
