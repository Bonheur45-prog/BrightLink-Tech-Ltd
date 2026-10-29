import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getProjects } from '@/lib/content'
import { getRequestLocale } from '@/lib/content/request-locale'
import { absoluteUrl, breadcrumbJsonLd, getServerUrl } from '@/lib/seo'

const PATH = '/our-projects'

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadFixed('projects', ui(await getRequestLocale()).ourProjects), PATH)
}

export default async function OurProjectsPage() {
  const t = ui(await getRequestLocale())
  const [l, projects] = await Promise.all([loadFixed('projects', t.ourProjects), getProjects(200)])
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
      itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: absoluteUrl(p.url, settings.locale) })),
    },
    breadcrumbJsonLd([{ name: t.home, path: '/' }, { name: t.ourProjects, path: PATH }], settings.locale),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections page={l.page} title={l.title} ctx={sectionContext(l, { key: 'projects', path: PATH, crumbs: [{ label: t.home, href: '/' }, { label: t.ourProjects }] })} />
    </>
  )
}
