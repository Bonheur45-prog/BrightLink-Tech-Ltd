import { Logo } from '@/components/ui/Logo'
import { MailIcon, MapPinIcon, PhoneIcon, SOCIAL_LABELS, SocialIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import { getFooter, getServices, getSiteSettings } from '@/lib/content'
import type { FooterData, ServiceItem, SiteSettingsData } from '@/lib/content/types'

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** Loads the footer's content from the CMS, then renders it. */
export async function Footer() {
  const [settings, footer, services] = await Promise.all([getSiteSettings(), getFooter(), getServices()])
  return <FooterView settings={settings} footer={footer} services={services} />
}

export function FooterView({
  settings,
  footer,
  services,
}: {
  settings: SiteSettingsData
  footer: FooterData
  services: ServiceItem[]
}) {
  const year = new Date().getFullYear()
  const copyright = footer.copyrightText || `© ${year} ${settings.legalName}. All rights reserved.`
  const place = [settings.address.street, settings.address.city, settings.address.country].filter(Boolean).join(', ')
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  const heading = 'font-display text-lg font-semibold !text-white'
  const link = 'text-white/70 transition hover:text-brand-yellow'

  return (
    <footer className="relative bg-brand-navy-deep text-white/75">
      <div aria-hidden className="h-1 bg-brand-link" />
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
        {/* brand */}
        <div className="lg:col-span-4">
          <SmartLink href="/" aria-label={`${settings.companyName} — home`} className="inline-block rounded-lg">
            <Logo logo={settings.logo} logoLight={settings.logoLight} companyName={settings.companyName} tone="light" className="h-12" />
          </SmartLink>
          <p className="mt-5 max-w-sm leading-relaxed">{settings.footerDescription || settings.tagline}</p>
          {settings.socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Social media">
              {settings.socials.map((s) => (
                <li key={`${s.platform}-${s.url}`}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[s.platform] ?? s.platform}
                    className="grid size-11 place-items-center rounded-full border border-white/20 transition hover:border-brand-yellow hover:text-brand-yellow"
                  >
                    <SocialIcon platform={s.platform} width={20} height={20} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* quick links */}
        <nav aria-label="Footer" className="lg:col-span-2">
          <h2 className={heading}>Quick links</h2>
          <ul className="mt-5 space-y-3">
            {footer.quickLinks.map((l) => (
              <li key={`${l.label}-${l.url}`}>
                <SmartLink href={l.url} newTab={l.newTab} className={link}>
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* services */}
        {footer.showServices && services.length > 0 && (
          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className={heading}>Our services</h2>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <SmartLink href={s.url} className={link}>
                    {s.title}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* contact */}
        <div className={footer.showServices && services.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <h2 className={heading}>Contact us</h2>
          <ul className="mt-5 space-y-4">
            {settings.email && (
              <li className="flex gap-3">
                <MailIcon width={20} height={20} className="mt-0.5 shrink-0 text-brand-yellow" />
                <a href={`mailto:${settings.email}`} className={`${link} break-all`}>
                  {settings.email}
                </a>
              </li>
            )}
            {phones.length > 0 && (
              <li className="flex gap-3">
                <PhoneIcon width={20} height={20} className="mt-0.5 shrink-0 text-brand-yellow" />
                <span className="flex flex-col gap-1">
                  {phones.map((p) => (
                    <a key={p} href={telHref(p)} className={link}>
                      {p}
                    </a>
                  ))}
                </span>
              </li>
            )}
            {place && (
              <li className="flex gap-3">
                <MapPinIcon width={20} height={20} className="mt-0.5 shrink-0 text-brand-yellow" />
                <span>{place}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row">
          <p>{copyright}</p>
          {footer.legalLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footer.legalLinks.map((l) => (
                <li key={`${l.label}-${l.url}`}>
                  <SmartLink href={l.url} className={link}>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
