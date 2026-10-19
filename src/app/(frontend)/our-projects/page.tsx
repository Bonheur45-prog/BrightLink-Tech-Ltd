import type { Metadata } from 'next'

import { ClosingCta } from '@/components/about/ClosingCta'
import { ProjectsExplorer } from '@/components/projects/ProjectsExplorer'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { getProjects, getProjectsPage, getSiteSettings } from '@/lib/content'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

const PATH = '/our-projects'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getProjectsPage()])
  return buildMetadata({
    settings,
    title: page.seo.metaTitle || 'Our Projects',
    description: page.seo.metaDescription || page.banner.intro,
    image: page.seo.ogImage ?? page.banner.image,
    path: PATH,
  })
}

export default async function OurProjectsPage() {
  const [settings, page, projects] = await Promise.all([getSiteSettings(), getProjectsPage(), getProjects(100)])
  const completed = projects.filter((p) => p.status === 'completed')
  const inProgress = projects.filter((p) => p.status === 'in-progress')

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(PATH)}#webpage`,
      url: absoluteUrl(PATH),
      name: page.seo.metaTitle || `Projects — ${settings.companyName}`,
      description: page.seo.metaDescription || page.banner.intro,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': `${getServerUrl()}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
        url: absoluteUrl(p.url),
      })),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Our Projects', path: PATH },
    ]),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={page.banner.eyebrow}
        title={page.banner.heading}
        intro={page.banner.intro}
        image={page.banner.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Our Projects' }]}
      />
      <ProjectsExplorer completed={completed} inProgress={inProgress} page={page} />
      <ClosingCta data={page.closing} />
    </>
  )
}
