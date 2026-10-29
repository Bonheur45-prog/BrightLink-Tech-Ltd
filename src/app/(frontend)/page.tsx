import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { getServices } from '@/lib/content'
import { absoluteUrl, getServerUrl, webPageJsonLd } from '@/lib/seo'

const PATH = '/'

export async function generateMetadata(): Promise<Metadata> {
  // no SEO title set → the site's default title (Site settings)
  return metadataFor(await loadFixed('home', ''), PATH, { home: true })
}

export default async function HomePage() {
  const [l, services] = await Promise.all([loadFixed('home', ''), getServices()])
  const { settings } = l
  const name = l.title || settings.seo.defaultTitle

  // Each service is described to search engines as a Service offered by the organisation.
  const serviceSchema = services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.shortDescription,
    url: absoluteUrl(s.url, settings.locale),
    provider: { '@id': `${getServerUrl()}/#organization` },
    areaServed: settings.address.country || 'Rwanda',
  }))

  return (
    <>
      <JsonLd data={[webPageJsonLd({ locale: settings.locale, name, description: l.description, path: PATH }), ...serviceSchema, ...faqSchema(l)]} />
      <PageSections page={l.page} title={settings.companyName} ctx={sectionContext(l, { key: 'home', path: PATH, crumbs: [] })} />
    </>
  )
}
