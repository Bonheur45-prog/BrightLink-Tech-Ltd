import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ClosingCta } from '@/components/about/ClosingCta'
import { Process } from '@/components/about/Process'
import { Faq } from '@/components/services/Faq'
import { Offerings } from '@/components/services/Offerings'
import { OtherServices } from '@/components/services/OtherServices'
import { ServiceOverview } from '@/components/services/ServiceOverview'
import { ServiceWork } from '@/components/services/ServiceWork'
import { WhyChooseUs } from '@/components/services/WhyChooseUs'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { getProjectsForService, getServiceBySlug, getServices, getServicesPage, getSiteSettings } from '@/lib/content'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, serviceJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [settings, service] = await Promise.all([getSiteSettings(), getServiceBySlug(slug)])
  if (!service) return { title: 'Service not found', robots: { index: false } }
  return buildMetadata({
    settings,
    title: service.seo.metaTitle || service.title,
    description: service.seo.metaDescription || service.shortDescription,
    image: service.seo.ogImage ?? service.banner.image ?? service.overview.image ?? service.image,
    path: service.url,
  })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const [projects, all, shared, settings] = await Promise.all([getProjectsForService(slug), getServices(), getServicesPage(), getSiteSettings()])
  const others = all.filter((s) => s.slug !== slug)
  // A service can have its own "Why choose us"; otherwise the shared one from Pages → Our Services Page is used.
  const why = service.why ?? (shared.why.enabled ? shared.why : null)

  const schema: Record<string, unknown>[] = [
    serviceJsonLd({
      locale: settings.locale,
      name: service.title,
      description: service.seo.metaDescription || service.shortDescription,
      path: service.url,
      image: (service.banner.image ?? service.overview.image ?? service.image)?.url,
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Our Services', path: '/our-services' },
      { name: service.title, path: service.url },
    ], settings.locale),
    ...(service.faqs.length ? [faqJsonLd(service.faqs)] : []),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={service.title}
        title={service.banner.heading}
        intro={service.banner.intro}
        image={service.banner.image ?? service.image}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Our Services', href: '/our-services' },
          { label: service.title },
        ]}
      />
      <ServiceOverview service={service} />
      <Offerings data={service.offerings} />
      {why && (
        <WhyChooseUs
          heading={why.heading}
          message={why.message}
          image={why.image}
          points={why.points}
          cta={{ label: service.cta.primaryCta?.label || 'Talk to us', url: service.cta.primaryCta?.url || '/#get-in-touch' }}
        />
      )}
      <Process data={{ enabled: true, eyebrow: 'How We Work', ...service.process }} />
      <ServiceWork service={service} projects={projects} />
      <Faq faqs={service.faqs} title={`${service.title}: common questions`} />
      <ClosingCta data={{ enabled: true, ...service.cta }} />
      <OtherServices services={others} />
    </>
  )
}
