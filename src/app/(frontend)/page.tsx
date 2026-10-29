import type { Metadata } from 'next'

import { Clients } from '@/components/home/Clients'
import { GetInTouch } from '@/components/home/GetInTouch'
import { Hero } from '@/components/home/Hero'
import { Portfolio } from '@/components/home/Portfolio'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { WhoWeAre } from '@/components/home/WhoWeAre'
import { WhyWorkWithUs } from '@/components/home/WhyWorkWithUs'
import { JsonLd } from '@/components/ui/JsonLd'
import { getClients, getHomePage, getProjects, getServices, getSiteSettings } from '@/lib/content'
import { absoluteUrl, buildMetadata, getServerUrl, webPageJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, home] = await Promise.all([getSiteSettings(), getHomePage()])
  return buildMetadata({
    settings,
    title: home.seo.metaTitle || undefined, // empty → the site default title
    description: home.seo.metaDescription || undefined,
    image: home.seo.ogImage,
    path: '/',
  })
}

export default async function HomePage() {
  const [settings, home, services, projects, clients] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getServices(),
    getProjects(),
    getClients(),
  ])

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
      <JsonLd
        data={[
          webPageJsonLd({
            locale: settings.locale,
            name: home.seo.metaTitle || settings.seo.defaultTitle,
            description: home.seo.metaDescription || settings.seo.defaultDescription,
            path: '/',
          }),
          ...serviceSchema,
        ]}
      />
      {/* If the hero is switched off in the CMS the page still needs exactly one H1. */}
      {!home.hero.enabled && <h1 className="sr-only">{settings.companyName}</h1>}
      <Hero hero={home.hero} highlights={home.highlights} />
      <WhoWeAre data={home.whoWeAre} />
      <WhatWeDo data={home.whatWeDo} services={services} />
      <WhyWorkWithUs data={home.why} />
      <Portfolio data={home.portfolio} projects={projects} />
      <Clients data={home.clients} clients={clients} />
      <GetInTouch data={home.contact} settings={settings} serviceNames={services.map((s) => s.title)} />
    </>
  )
}
