import type { Metadata } from 'next'

import { ClosingCta } from '@/components/about/ClosingCta'
import { Portfolio } from '@/components/home/Portfolio'
import { ServiceCards } from '@/components/services/ServiceCards'
import { WhyChooseUs } from '@/components/services/WhyChooseUs'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { getHomePage, getProjects, getServices, getServicesPage, getSiteSettings } from '@/lib/content'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

const PATH = '/our-services'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getServicesPage()])
  return buildMetadata({
    settings,
    title: page.seo.metaTitle || 'Our Services',
    description: page.seo.metaDescription || page.banner.intro,
    image: page.seo.ogImage ?? page.banner.image,
    path: PATH,
  })
}

export default async function OurServicesPage() {
  const [settings, page, services, projects, home] = await Promise.all([
    getSiteSettings(),
    getServicesPage(),
    getServices(),
    getProjects(12),
    getHomePage(),
  ])

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(PATH)}#webpage`,
      url: absoluteUrl(PATH),
      name: page.seo.metaTitle || `Services — ${settings.companyName}`,
      description: page.seo.metaDescription || page.banner.intro,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': `${getServerUrl()}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: services.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.title,
        url: absoluteUrl(s.url),
      })),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Our Services', path: PATH },
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
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Our Services' }]}
      />
      <ServiceCards eyebrow={page.listing.eyebrow} heading={page.listing.heading} intro={page.listing.intro} services={services} />
      {page.why.enabled && (
        <WhyChooseUs
          id="why-us"
          eyebrow={page.why.eyebrow}
          heading={page.why.heading}
          message={page.why.message}
          image={page.why.image}
          points={page.why.points}
          cta={{ label: 'Plan your project with us', url: '/#get-in-touch' }}
        />
      )}
      {page.showProjects && (
        <Portfolio
          data={{
            ...home.portfolio,
            enabled: true,
            eyebrow: 'Our Work',
            heading: 'Projects we have built',
            intro: 'A few of the systems, websites and campaigns delivered across our services.',
            limit: 6,
          }}
          projects={projects}
        />
      )}
      <ClosingCta data={page.closing} />
    </>
  )
}
