import type { Metadata } from 'next'

import { PageSections } from '@/components/sections/PageSections'
import { faqSchema, loadFixed, metadataFor, sectionContext } from '@/components/sections/live-page'
import { JsonLd } from '@/components/ui/JsonLd'
import { ui } from '@/i18n/ui'
import { getAllPosts } from '@/lib/content'
import { getRequestLocale } from '@/lib/content/request-locale'
import { absoluteUrl, breadcrumbJsonLd, getServerUrl } from '@/lib/seo'

const PATH = '/blog'

type Props = { searchParams: Promise<{ page?: string; q?: string }> }

function readSearch(raw: { page?: string; q?: string }) {
  return { q: (raw.q ?? '').trim().slice(0, 80), page: Math.max(1, Math.round(Number(raw.page) || 1)) }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const search = readSearch(await searchParams)
  const l = await loadFixed('blog', ui(await getRequestLocale()).blog)
  // search results and page 2+ are not worth indexing separately
  const meta = metadataFor(l, PATH, { noIndex: Boolean(search.q) || search.page > 1 })
  return { ...meta, alternates: { ...meta.alternates, types: { 'application/rss+xml': absoluteUrl('/blog/feed.xml') } } }
}

export default async function BlogPage({ searchParams }: Props) {
  const t = ui(await getRequestLocale())
  const [search, l, all] = await Promise.all([searchParams.then(readSearch), loadFixed('blog', t.blog), getAllPosts()])
  const { settings } = l
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${absoluteUrl(PATH, settings.locale)}#blog`,
      url: absoluteUrl(PATH, settings.locale),
      name: `${settings.companyName} Blog`,
      description: l.description,
      inLanguage: settings.locale,
      publisher: { '@id': `${getServerUrl()}/#organization` },
      blogPost: all.slice(0, 10).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: absoluteUrl(p.url, settings.locale), datePublished: p.publishedAt })),
    },
    breadcrumbJsonLd([{ name: t.home, path: '/' }, { name: t.blog, path: PATH }], settings.locale),
    ...faqSchema(l),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageSections page={l.page} title={l.title} ctx={sectionContext(l, { key: 'blog', path: PATH, crumbs: [{ label: t.home, href: '/' }, { label: t.blog }], search })} />
    </>
  )
}
