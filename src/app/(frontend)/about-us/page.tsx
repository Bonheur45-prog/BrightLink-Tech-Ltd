import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getTeam } from '@/lib/content'
import { getRequestLocale } from '@/lib/content/request-locale'
import { absoluteUrl, breadcrumbJsonLd, getServerUrl } from '@/lib/seo'

const PATH = '/about-us'

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadFixed('about', ui(await getRequestLocale()).aboutUs), PATH)
}

export default async function AboutPage() {
  const t = ui(await getRequestLocale())
  const [l, team] = await Promise.all([loadFixed('about', t.aboutUs), getTeam()])
  const { settings } = l
  const org = `${getServerUrl()}/#organization`
  const hasTeam = l.page.doc.sections.some((s) => s.type === 'team')
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${absoluteUrl(PATH, settings.locale)}#webpage`,
      url: absoluteUrl(PATH, settings.locale),
      name: l.title,
      description: l.description,
      inLanguage: settings.locale,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': org },
    },
    breadcrumbJsonLd([{ name: t.home, path: '/' }, { name: t.aboutUs, path: PATH }], settings.locale),
    // People are described to search engines only when real team members are shown on the page.
    ...(hasTeam
      ? team.map((m) => ({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: m.name,
          jobTitle: m.role,
          worksFor: { '@id': org },
          ...(m.photo ? { image: absoluteUrl(m.photo.url) } : {}),
          ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
        }))
      : []),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections page={l.page} title={l.title} ctx={sectionContext(l, { key: 'about', path: PATH, crumbs: [{ label: t.home, href: '/' }, { label: t.aboutUs }] })} />
    </>
  )
}
