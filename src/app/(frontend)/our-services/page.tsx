import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getServices } from '@/lib/content'
import { getRequestLocale } from '@/lib/content/request-locale'
import { absoluteUrl, breadcrumbJsonLd, getServerUrl } from '@/lib/seo'

const PATH = '/our-services'

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadFixed('services', ui(await getRequestLocale()).ourServices), PATH)
}

export default async function OurServicesPage() {
  const t = ui(await getRequestLocale())
  const [l, services] = await Promise.all([loadFixed('services', t.ourServices), getServices()])
  const { settings } = l
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(PATH, settings.locale)}#webpage`,
      url: absoluteUrl(PATH, settings.locale),
      name: l.title,
      description: l.description,
      inLanguage: settings.locale,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': `${getServerUrl()}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: absoluteUrl(s.url, settings.locale) })),
    },
    breadcrumbJsonLd([{ name: t.home, path: '/' }, { name: t.ourServices, path: PATH }], settings.locale),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections page={l.page} title={l.title} ctx={sectionContext(l, { key: 'services', path: PATH, crumbs: [{ label: t.home, href: '/' }, { label: t.ourServices }] })} />
    </>
  )
}
