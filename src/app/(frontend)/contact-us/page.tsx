import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

import { ContactForm } from '@/components/home/ContactForm'
import { NewsletterForm } from '@/components/home/NewsletterForm'
import { JsonLd } from '@/components/ui/JsonLd'
import {
  ArrowUpRightIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SOCIAL_LABELS,
  SocialIcon,
} from '@/components/ui/Icons'
import { getContactPage, getServices, getSiteSettings } from '@/lib/content'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

const PATH = '/contact-us'
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export async function generateMetadata(): Promise<Metadata> {
  const [settings, contact] = await Promise.all([getSiteSettings(), getContactPage()])
  return buildMetadata({
    settings,
    title: contact.seo.metaTitle || 'Contact Us',
    description: contact.seo.metaDescription || contact.banner.intro,
    image: contact.seo.ogImage ?? contact.banner.image,
    path: PATH,
  })
}

export default async function ContactUsPage() {
  const [settings, contact, services] = await Promise.all([getSiteSettings(), getContactPage(), getServices()])
  const { address } = settings
  const place = [address.street, address.city, address.country].filter(Boolean).join(', ')
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  const whatsapp = settings.socials.find((social) => social.platform === 'whatsapp')?.url
  const mapQuery = encodeURIComponent(place || settings.companyName)
  const mapEmbed = `https://www.google.com/maps?q=${mapQuery}&output=embed`
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const contactDetails: { icon: ReactNode; label: string; lines: { text: string; href?: string }[] }[] = [
    ...(settings.email
      ? [{ icon: <MailIcon width={21} height={21} />, label: 'Email', lines: [{ text: settings.email, href: `mailto:${settings.email}` }] }]
      : []),
    ...(phones.length
      ? [{
          icon: <PhoneIcon width={21} height={21} />,
          label: 'Call us',
          lines: phones.map((phone) => ({ text: phone, href: telHref(phone) })),
        }]
      : []),
    ...(place ? [{ icon: <MapPinIcon width={21} height={21} />, label: 'Visit us', lines: [{ text: place }] }] : []),
    ...(settings.openingHours
      ? [{ icon: <ClockIcon width={21} height={21} />, label: 'Opening hours', lines: [{ text: settings.openingHours }] }]
      : []),
  ]
  const bannerStyle = contact.banner.image
    ? {
        backgroundImage: `linear-gradient(105deg, rgba(0, 18, 49, .96), rgba(0, 36, 83, .75)), url("${contact.banner.image.url}")`,
      }
    : undefined
  const formStyle = contact.form.backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(0, 20, 51, .92), rgba(0, 47, 91, .86)), url("${contact.form.backgroundImage.url}")`,
      }
    : undefined
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${absoluteUrl(PATH)}#webpage`,
      url: absoluteUrl(PATH),
      name: contact.seo.metaTitle || `Contact ${settings.companyName}`,
      description: contact.seo.metaDescription || contact.banner.intro,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
      about: { '@id': `${getServerUrl()}/#organization` },
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: PATH },
    ]),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <section
        aria-labelledby="contact-page-heading"
        className="relative isolate overflow-hidden bg-brand-navy-deep bg-cover bg-center py-24 text-white sm:py-32"
        style={bannerStyle}
      >
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(0,180,190,.24),transparent_42%)]" />
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-white/65">
            <Link href="/" className="transition hover:text-brand-yellow">Home</Link>
            <span aria-hidden className="px-2">/</span>
            <span aria-current="page" className="text-white">Contact</span>
          </nav>
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[.22em] text-brand-yellow">{contact.banner.eyebrow}</p>
            <h1 id="contact-page-heading" className="font-display text-4xl font-semibold leading-tight !text-white sm:text-5xl lg:text-6xl">
              {contact.banner.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{contact.banner.intro}</p>
            <a href="#contact-options" className="btn btn-primary mt-9">
              Talk to our team <ArrowUpRightIcon width={18} height={18} />
            </a>
          </div>
        </div>
      </section>

      <section id="contact-options" aria-labelledby="contact-options-heading" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
        <div className="container-x">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-blue">Reach us your way</p>
            <h2 id="contact-options-heading" className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Good conversations start here.</h2>
            <p className="mt-4 leading-relaxed text-slate-600">Choose the channel that works best for you. We’re ready to listen.</p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-4 lg:col-span-5">
              {contactDetails.map((item) => (
                <div key={item.label} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue">{item.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{item.label}</h3>
                    <div className="mt-1 space-y-1">
                      {item.lines.map((line) =>
                        line.href ? (
                          <a key={line.text} href={line.href} className="block break-words font-semibold text-brand-navy-deep transition hover:text-brand-blue">
                            {line.text}
                          </a>
                        ) : (
                          <p key={line.text} className="font-semibold text-brand-navy-deep">{line.text}</p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#128c7e] px-5 font-semibold text-white transition hover:bg-[#0d766a]"
                >
                  <SocialIcon platform="whatsapp" width={22} height={22} />
                  Message us on WhatsApp <ArrowUpRightIcon width={18} height={18} />
                </a>
              )}
              {settings.socials.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-lg font-semibold">Connect with us</h3>
                  <ul className="mt-4 flex flex-wrap gap-3" aria-label="BrightLink social media">
                    {settings.socials.map((social) => (
                      <li key={`${social.platform}-${social.url}`}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`BrightLink on ${SOCIAL_LABELS[social.platform] ?? social.platform}`}
                          className="grid size-11 place-items-center rounded-full border border-slate-200 text-brand-navy-deep transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                        >
                          <SocialIcon platform={social.platform} width={20} height={20} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              className="overflow-hidden rounded-3xl bg-brand-navy-deep bg-cover bg-center p-6 shadow-xl sm:p-9 lg:col-span-7"
              style={formStyle}
            >
              <div className="mb-7">
                <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-yellow">Send us a message</p>
                <h2 className="mt-2 font-display text-2xl font-semibold !text-white sm:text-3xl">{contact.form.heading}</h2>
                <p className="mt-2 max-w-xl leading-relaxed text-white/75">{contact.form.intro}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 sm:p-7">
                <ContactForm
                  services={services.map((service) => service.title)}
                  source="Contact page"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {place && (
        <section aria-labelledby="map-heading" className="bg-white py-20 sm:py-24">
          <div className="container-x">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-blue">Find us</p>
                <h2 id="map-heading" className="mt-2 font-display text-3xl font-semibold">A little closer to you.</h2>
                <p className="mt-2 text-slate-600">{place}</p>
              </div>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:text-brand-navy-deep">
                Open in Google Maps <ArrowUpRightIcon width={18} height={18} />
              </a>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
              <iframe
                title={`Map showing ${settings.companyName} in ${place}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[360px] w-full border-0 sm:h-[440px]"
              />
            </div>
          </div>
        </section>
      )}

      {contact.subscribe.enabled && (
        <section aria-labelledby="contact-newsletter-heading" className="relative isolate overflow-hidden bg-brand-navy-deep py-16 text-white sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_100%,rgba(0,180,190,.22),transparent_45%)]" />
          <div className="container-x grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-yellow">BrightLink, in your inbox</p>
              <h2 id="contact-newsletter-heading" className="mt-3 font-display text-3xl font-semibold !text-white">{contact.subscribe.heading}</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-white/70">{contact.subscribe.text}</p>
            </div>
            <NewsletterForm buttonLabel={contact.subscribe.buttonLabel} source="Contact page" />
          </div>
        </section>
      )}
    </>
  )
}
