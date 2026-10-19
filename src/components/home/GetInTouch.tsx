import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from '@/components/ui/Icons'
import type { ContactData, SiteSettingsData } from '@/lib/content/types'
import { ContactForm } from './ContactForm'

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

type Item = { icon: ReactNode; label: string; lines: { text: string; href?: string }[] }

export function GetInTouch({
  data,
  settings,
  serviceNames,
}: {
  data: ContactData
  settings: SiteSettingsData
  serviceNames: string[]
}) {
  if (!data.enabled) return null

  const { address } = settings
  const place = [address.street, address.city, address.country].filter(Boolean).join(', ')
  const items: Item[] = []
  if (settings.email)
    items.push({
      icon: <MailIcon width={22} height={22} />,
      label: 'Email us',
      lines: [{ text: settings.email, href: `mailto:${settings.email}` }],
    })
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  if (phones.length)
    items.push({
      icon: <PhoneIcon width={22} height={22} />,
      label: 'Call us',
      lines: phones.map((p) => ({ text: p, href: telHref(p) })),
    })
  if (place) items.push({ icon: <MapPinIcon width={22} height={22} />, label: 'Visit us', lines: [{ text: place }] })
  if (settings.openingHours)
    items.push({ icon: <ClockIcon width={22} height={22} />, label: 'Opening hours', lines: [{ text: settings.openingHours }] })

  return (
    <section id="get-in-touch" aria-labelledby="contact-heading" className="relative isolate scroll-mt-20 overflow-hidden bg-brand-navy-deep py-20 text-white lg:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_70%,#0057a3_100%)]" />
      <div aria-hidden className="absolute -left-24 top-10 -z-10 size-[26rem] rounded-full bg-brand-orange/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 right-0 -z-10 size-[30rem] rounded-full bg-brand-teal/20 blur-3xl" />

      <div className="container-x grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={data.showForm ? 'lg:col-span-5' : 'lg:col-span-12 lg:max-w-3xl'}>
          <SectionHeading id="contact-heading" tone="dark" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />
          <ul className="mt-9 space-y-4">
            {items.map((item, i) => (
              <Reveal as="li" key={item.label} delay={200 + i * 100}>
                <div className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-white/60">{item.label}</p>
                    {item.lines.map((l) =>
                      l.href ? (
                        <a key={l.text} href={l.href} className="block text-lg font-semibold text-white hover:text-brand-yellow">
                          {l.text}
                        </a>
                      ) : (
                        <p key={l.text} className="text-lg font-semibold text-white">
                          {l.text}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {data.showForm && (
          <Reveal from="right" delay={150} className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-7 text-slate-700 shadow-2xl shadow-black/20 sm:p-10">
              <h3 className="font-display text-2xl font-semibold">{data.formTitle}</h3>
              <p className="mb-7 mt-1.5 text-slate-600">We usually reply within one working day.</p>
              <ContactForm services={serviceNames} />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
