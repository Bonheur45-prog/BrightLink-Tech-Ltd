import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getRequestLocale } from '@/lib/content/request-locale'
import { absoluteUrl, breadcrumbJsonLd, getServerUrl } from '@/lib/seo'

const PATH = '/contact-us'

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadFixed('contact', ui(await getRequestLocale()).contact), PATH)
}

export default async function ContactUsPage() {
  const t = ui(await getRequestLocale())
  const l = await loadFixed('contact', t.contact)
  const { settings } = l
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${absoluteUrl(PATH, settings.locale)}#webpage`,
      url: absoluteUrl(PATH, settings.locale),
      name: l.title,
      description: l.description,
      inLanguage: settings.locale,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': `${getServerUrl()}/#organization` },
    },
    breadcrumbJsonLd([{ name: t.home, path: '/' }, { name: t.contact, path: PATH }], settings.locale),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections page={l.page} title={l.title} ctx={sectionContext(l, { key: 'contact', path: PATH, crumbs: [{ label: t.home, href: '/' }, { label: t.contact }] })} />
    </>
  )
}
