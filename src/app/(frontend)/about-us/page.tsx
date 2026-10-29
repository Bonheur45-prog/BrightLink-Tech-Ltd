import type { Metadata } from 'next'

import { AboutGlance } from '@/components/about/AboutGlance'
import { AboutStory } from '@/components/about/AboutStory'
import { ClosingCta } from '@/components/about/ClosingCta'
import { MissionValues } from '@/components/about/MissionValues'
import { Process } from '@/components/about/Process'
import { ServicesOffer } from '@/components/about/ServicesOffer'
import { Team } from '@/components/about/Team'
import { Clients } from '@/components/home/Clients'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { getAboutPage, getClients, getHomePage, getServices, getSiteSettings, getTeam } from '@/lib/content'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

const PATH = '/about-us'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, about] = await Promise.all([getSiteSettings(), getAboutPage()])
  return buildMetadata({
    settings,
    title: about.seo.metaTitle || 'About Us',
    description: about.seo.metaDescription || about.banner.intro,
    image: about.seo.ogImage ?? about.banner.image,
    path: PATH,
  })
}

export default async function AboutPage() {
  const [settings, about, services, team, clients, home] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getServices(),
    getTeam(),
    getClients(),
    getHomePage(),
  ])

  const org = `${getServerUrl()}/#organization`
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${absoluteUrl(PATH, settings.locale)}#webpage`,
      url: absoluteUrl(PATH, settings.locale),
      name: about.seo.metaTitle || `About ${settings.companyName}`,
      description: about.seo.metaDescription || about.banner.intro,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': org },
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'About Us', path: PATH },
    ], settings.locale),
    // People are described to search engines only when real team members have been added.
    ...team.map((m) => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: m.name,
      jobTitle: m.role,
      worksFor: { '@id': org },
      ...(m.photo ? { image: absoluteUrl(m.photo.url) } : {}),
      ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
    })),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={about.banner.eyebrow}
        title={about.banner.heading}
        intro={about.banner.intro}
        image={about.banner.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />
      <AboutStory data={about.story} />
      {about.glance.enabled && <AboutGlance heading={about.glance.heading} settings={settings} services={services} />}
      <MissionValues data={about.mission} />
      <Process data={about.process} />
      <ServicesOffer data={about.services} services={services} />
      <Team data={about.team} members={team} />
      {about.showClients && <Clients data={home.clients} clients={clients} />}
      <ClosingCta data={about.closing} />
    </>
  )
}
