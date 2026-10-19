import { Reveal } from '@/components/ui/Reveal'
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, CodeIcon } from '@/components/ui/Icons'
import type { ReactNode } from 'react'
import type { ServiceItem, SiteSettingsData } from '@/lib/content/types'

const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Fact = { icon: ReactNode; label: string; value: string; href?: string; sub?: string }

/** Facts that come straight from Site Settings and Services — nothing here is typed in by hand. */
export function AboutGlance({
  heading,
  settings,
  services,
}: {
  heading: string
  settings: SiteSettingsData
  services: ServiceItem[]
}) {
  const place = [settings.address.city, settings.address.country].filter(Boolean).join(', ')
  const facts: Fact[] = [{ icon: <CodeIcon width={24} height={24} />, label: 'Company', value: settings.legalName }]
  if (place) facts.push({ icon: <MapPinIcon width={24} height={24} />, label: 'Based in', value: place })
  if (services.length)
    facts.push({
      icon: <ClockIcon width={24} height={24} />,
      label: 'What we do',
      value: `${services.length} core services`,
      sub: services.map((s) => s.title).join(' · '),
    })
  if (settings.email)
    facts.push({ icon: <MailIcon width={24} height={24} />, label: 'Email', value: settings.email, href: `mailto:${settings.email}` })
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  if (phones.length)
    facts.push({ icon: <PhoneIcon width={24} height={24} />, label: 'Phone', value: phones.join(' / '), href: telHref(phones[0]) })

  return (
    <section aria-labelledby="glance-heading" className="relative isolate overflow-hidden bg-brand-navy-deep py-16 text-white lg:py-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_100%)]" />
      <div aria-hidden className="absolute -right-20 -top-20 -z-10 size-80 rounded-full bg-brand-teal/20 blur-3xl" />
      <div className="container-x">
        <Reveal>
          <h2 id="glance-heading" className="text-center font-display text-2xl font-semibold !text-white sm:text-3xl">
            {heading}
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f, i) => {
            const body = (
              <>
                <span className="grid size-12 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">{f.icon}</span>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/60">{f.label}</p>
                <p className="mt-1 break-words font-display text-lg font-semibold leading-snug">{f.value}</p>
                {f.sub && <p className="mt-1.5 text-xs leading-relaxed text-white/60">{f.sub}</p>}
              </>
            )
            const cls =
              'block h-full rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition hover:bg-white/15'
            return (
              <Reveal as="li" key={f.label} delay={i * 80}>
                {f.href ? (
                  <a href={f.href} className={cls}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
