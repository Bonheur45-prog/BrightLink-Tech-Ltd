import type { ReactNode } from 'react'

import { ContactForm } from '@/components/home/ContactForm'
import { ArrowUpRightIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon, SOCIAL_LABELS, SocialIcon } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getServices } from '@/lib/content'
import { turnstileSiteKey } from '@/lib/security/turnstile'
import { SectionShell, bool, strong, text, type SectionProps, type Tone } from './shared'

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
type Detail = { icon: ReactNode; label: string; lines: { text: string; href?: string }[] }

/** Contact details from Site settings, with the contact form. */
export async function ContactSection({ section, ctx }: SectionProps) {
  const { locale, settings, t } = ctx
  const d = section.data
  const services = await getServices()
  const { address } = settings
  const place = [address.street, address.city, address.country].filter(Boolean).join(', ')
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  const details: Detail[] = []
  if (settings.email) details.push({ icon: <MailIcon width={22} height={22} />, label: t.emailUs, lines: [{ text: settings.email, href: `mailto:${settings.email}` }] })
  if (phones.length) details.push({ icon: <PhoneIcon width={22} height={22} />, label: t.callUs, lines: phones.map((p) => ({ text: p, href: telHref(p) })) })
  if (place) details.push({ icon: <MapPinIcon width={22} height={22} />, label: t.visitUs, lines: [{ text: place }] })
  if (settings.openingHours) details.push({ icon: <ClockIcon width={22} height={22} />, label: t.openingHours, lines: [{ text: settings.openingHours }] })

  const showForm = bool(d.showForm, true)
  const heading = text(d.heading, locale)
  const formTitle = text(d.formTitle, locale)
  const id = `${ctx.anchor}-heading`
  const pageName = ctx.page.key.startsWith('service-') ? `Service (${ctx.page.crumbs.at(-1)?.label ?? ''})` : ctx.page.key.charAt(0).toUpperCase() + ctx.page.key.slice(1)
  const source = `${pageName} page — contact form`
  const whatsapp = settings.socials.find((s) => s.platform === 'whatsapp')?.url

  const detailList = (tone: Tone, grid = false) => (
    <ul className={grid ? 'grid items-start gap-4 sm:grid-cols-2' : 'space-y-4'}>
      {details.map((item, i) => (
        <Reveal as="li" key={item.label} delay={200 + i * 100}>
          <div className={`flex items-start gap-4 rounded-2xl p-5 ${tone === 'dark' ? 'border border-white/15 bg-white/10 backdrop-blur-sm' : 'border border-slate-200 bg-white shadow-sm'}`}>
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone === 'dark' ? 'bg-brand-warm text-brand-navy-deep' : 'bg-brand-blue/10 text-brand-blue'}`}>{item.icon}</span>
            <div className="min-w-0">
              <p className={`text-sm font-medium uppercase tracking-wider ${tone === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{item.label}</p>
              {item.lines.map((l) =>
                l.href ? (
                  <a key={l.text} href={l.href} className={`block break-words text-lg font-semibold ${tone === 'dark' ? 'text-white hover:text-brand-yellow' : 'text-brand-navy-deep hover:text-brand-blue'}`}>
                    {l.text}
                  </a>
                ) : (
                  <p key={l.text} className={`text-lg font-semibold ${strong(tone)}`}>
                    {l.text}
                  </p>
                ),
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  )

  const form = (
    <div className="rounded-3xl bg-white p-7 text-slate-700 shadow-2xl shadow-black/20 sm:p-10">
      {formTitle && <h3 className="font-display text-2xl font-semibold text-brand-navy-deep">{formTitle}</h3>}
      <p className={`${formTitle ? 'mt-1.5' : ''} mb-7 text-slate-600`}>{t.replyTime}</p>
      <ContactForm services={services.map((s) => s.title)} source={source} turnstileSiteKey={turnstileSiteKey()} fallbackEmail={settings.email} />
    </div>
  )

  if (section.variant === 'page') {
    const mapQuery = encodeURIComponent(place || settings.companyName)
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined} className="py-20 sm:py-24">
        {(tone) => (
          <div className="container-x">
            {heading && <SectionHeading id={id} tone={tone} eyebrow={text(d.eyebrow, locale)} title={heading} intro={text(d.intro, locale)} />}
            <div className={`grid items-start gap-8 lg:grid-cols-12 lg:gap-10 ${heading ? 'mt-12' : ''}`}>
              <div className="space-y-4 lg:col-span-5">
                {detailList(tone)}
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#128c7e] px-5 font-semibold text-white transition hover:bg-[#0d766a]">
                    <SocialIcon platform="whatsapp" width={22} height={22} />
                    {t.whatsapp} <ArrowUpRightIcon width={18} height={18} />
                  </a>
                )}
                {settings.socials.length > 0 && (
                  <div className={`rounded-2xl p-5 ${tone === 'dark' ? 'border border-white/15 bg-white/10' : 'border border-slate-200 bg-white shadow-sm'}`}>
                    <h3 className={`font-display text-lg font-semibold ${strong(tone)}`}>{t.connect}</h3>
                    <ul className="mt-4 flex flex-wrap gap-3" aria-label={`${settings.companyName} social media`}>
                      {settings.socials.map((s) => (
                        <li key={`${s.platform}-${s.url}`}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${settings.companyName} on ${SOCIAL_LABELS[s.platform] ?? s.platform}`}
                            className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-brand-navy-deep transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                          >
                            <SocialIcon platform={s.platform} width={20} height={20} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {showForm && (
                <div className="overflow-hidden rounded-3xl bg-brand-navy-deep p-6 shadow-xl sm:p-9 lg:col-span-7">
                  <div className="mb-7">
                    <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-yellow">{t.sendMessage}</p>
                    {formTitle && <h3 className="mt-2 font-display text-2xl font-semibold !text-white sm:text-3xl">{formTitle}</h3>}
                    <p className="mt-2 max-w-xl leading-relaxed text-white/75">{t.replyTime}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 sm:p-7">
                    <ContactForm services={services.map((s) => s.title)} source={source} turnstileSiteKey={turnstileSiteKey()} fallbackEmail={settings.email} />
                  </div>
                </div>
              )}
            </div>
            {place && (
              <div className="mt-16">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-[.2em] ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue'}`}>{t.findUs}</p>
                    <h3 className={`mt-2 font-display text-3xl font-semibold ${strong(tone)}`}>{t.closerToYou}</h3>
                    <p className={`mt-2 ${tone === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>{place}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 font-semibold ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue hover:text-brand-navy-deep'}`}>
                    {t.openMap} <ArrowUpRightIcon width={18} height={18} />
                  </a>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
                  <iframe
                    title={`Map: ${settings.companyName}, ${place}`}
                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[360px] w-full border-0 sm:h-[440px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </SectionShell>
    )
  }

  if (section.variant === 'stacked') {
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
        {(tone) => (
          <div className="container-x max-w-4xl">
            {heading && <SectionHeading id={id} tone={tone} align="center" eyebrow={text(d.eyebrow, locale)} title={heading} intro={text(d.intro, locale)} />}
            <div className="mt-10">{detailList(tone, true)}</div>
            {showForm && <Reveal className="mt-10">{form}</Reveal>}
          </div>
        )}
      </SectionShell>
    )
  }

  // split (default): details left, form right
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
      {(tone) => (
        <div className="container-x grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className={showForm ? 'lg:col-span-5' : 'lg:col-span-12 lg:max-w-3xl'}>
            {heading && <SectionHeading id={id} tone={tone} eyebrow={text(d.eyebrow, locale)} title={heading} intro={text(d.intro, locale)} />}
            <div className="mt-9">{detailList(tone)}</div>
          </div>
          {showForm && (
            <Reveal from="right" delay={150} className="lg:col-span-7">
              {form}
            </Reveal>
          )}
        </div>
      )}
    </SectionShell>
  )
}
