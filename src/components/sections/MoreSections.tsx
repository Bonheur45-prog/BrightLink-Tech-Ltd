import Image from 'next/image'
import type { ReactNode } from 'react'

import { ArrowRightIcon, ChevronDownIcon, ClockIcon, CodeIcon, IconByKey, LightbulbIcon, MailIcon, MapPinIcon, PhoneIcon, SocialIcon, TargetIcon, UsersIcon } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SmartLink } from '@/components/ui/SmartLink'
import { getClients, getServices, getTeam } from '@/lib/content'
import type { ClientItem, TeamMember } from '@/lib/content/types'
import { Buttons, SectionShell, TILES, card, iconCards, items, link, mediaOf, muted, paragraphs, strong, text, type SectionProps, type Tone } from './shared'

const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/* ------------------------------------------------------------------ mission and vision */

export function MissionSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  const values = iconCards(d.items, locale)
  const id = `${ctx.anchor}-heading`
  if (!heading && !text(d.missionText, locale) && !text(d.visionText, locale)) return null
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
      {(tone) => (
        <div className="container-x relative">
          {heading && <SectionHeading id={id} tone={tone} align="center" eyebrow={text(d.eyebrow, locale)} title={heading} />}
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {text(d.missionText, locale) && (
              <Reveal from="left">
                <article className="relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#001a45,#00327f_70%,#0057a3)] p-8 text-white shadow-xl shadow-brand-navy/20 ring-1 ring-white/10 sm:p-10">
                  <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-brand-orange/30 blur-3xl" />
                  <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-warm text-brand-navy-deep">
                    <TargetIcon width={28} height={28} />
                  </span>
                  <h3 className="relative mt-6 font-display text-2xl font-semibold !text-white">{text(d.missionTitle, locale)}</h3>
                  <p className="relative mt-3 text-lg leading-relaxed text-white/85">{text(d.missionText, locale)}</p>
                </article>
              </Reveal>
            )}
            {text(d.visionText, locale) && (
              <Reveal from="right">
                <article className="relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-brand-navy/8 ring-1 ring-brand-navy/10 sm:p-10">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-brand-link" />
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-cool text-white">
                    <LightbulbIcon width={28} height={28} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-brand-navy-deep">{text(d.visionTitle, locale)}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-slate-600">{text(d.visionText, locale)}</p>
                </article>
              </Reveal>
            )}
          </div>
          {values.length > 0 && (
            <>
              {text(d.valuesHeading, locale) && (
                <Reveal>
                  <h3 className={`mt-20 text-center font-display text-2xl font-semibold sm:text-3xl ${strong(tone)}`}>{text(d.valuesHeading, locale)}</h3>
                </Reveal>
              )}
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {values.map((v, i) => (
                  <Reveal as="li" key={v.id} delay={i * 90}>
                    <div className={`group h-full p-6 ${card(tone)}`}>
                      <span className={`grid size-12 place-items-center rounded-xl shadow-lg ${TILES[i % TILES.length]}`}>
                        <IconByKey name={v.icon} width={24} height={24} />
                      </span>
                      <h4 className={`mt-5 font-display text-lg font-semibold ${strong(tone)}`}>{v.title}</h4>
                      {v.text && <p className={`mt-2 text-[0.95rem] leading-relaxed ${muted(tone)}`}>{v.text}</p>}
                    </div>
                  </Reveal>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ at a glance */

type Fact = { icon: ReactNode; label: string; value: string; href?: string; sub?: string }

/** Company facts taken from Site settings and Services: nothing here is typed in by hand. */
export async function GlanceSection({ section, ctx }: SectionProps) {
  const { settings, t } = ctx
  const services = await getServices()
  const place = [settings.address.city, settings.address.country].filter(Boolean).join(', ')
  const facts: Fact[] = [{ icon: <CodeIcon width={24} height={24} />, label: t.company, value: settings.legalName }]
  if (place) facts.push({ icon: <MapPinIcon width={24} height={24} />, label: t.basedIn, value: place })
  if (services.length) facts.push({ icon: <ClockIcon width={24} height={24} />, label: t.whatWeDo, value: `${services.length} ${t.coreServices}`, sub: services.map((s) => s.title).join(' · ') })
  if (settings.email) facts.push({ icon: <MailIcon width={24} height={24} />, label: t.email, value: settings.email, href: `mailto:${settings.email}` })
  const phones = [settings.phone, settings.secondaryPhone].filter(Boolean)
  if (phones.length) facts.push({ icon: <PhoneIcon width={24} height={24} />, label: t.phone, value: phones.join(' / '), href: telHref(phones[0]) })
  const heading = text(section.data.heading, ctx.locale)
  const id = `${ctx.anchor}-heading`
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id} className="py-16 lg:py-20">
      {(tone) => (
        <div className="container-x">
          <Reveal>
            <h2 id={id} className={`text-center font-display text-2xl font-semibold sm:text-3xl ${strong(tone)}`}>
              {heading}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f, i) => {
              const body = (
                <>
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">{f.icon}</span>
                  <p className={`mt-4 text-xs font-medium uppercase tracking-wider ${tone === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{f.label}</p>
                  <p className={`mt-1 break-words font-display text-lg font-semibold leading-snug ${strong(tone)}`}>{f.value}</p>
                  {f.sub && <p className={`mt-1.5 text-xs leading-relaxed ${tone === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{f.sub}</p>}
                </>
              )
              const cls = `block h-full p-5 ${card(tone)}`
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
      )}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ client logos */

function ClientTile({ client }: { client: ClientItem }) {
  const base =
    'group flex h-28 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-navy/10'
  const inner = client.logo ? (
    <Image
      src={client.logo.url}
      alt={client.logo.alt || `${client.name} logo`}
      width={client.logo.width ?? 240}
      height={client.logo.height ?? 120}
      sizes="240px"
      className="max-h-16 w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  ) : (
    <span className="text-center font-display text-lg font-semibold leading-tight text-brand-navy/80 transition group-hover:text-brand-navy">{client.name}</span>
  )
  return client.website ? (
    <a href={client.website} target="_blank" rel="noopener noreferrer" aria-label={`${client.name} (opens their website)`} className={base}>
      {inner}
    </a>
  ) : (
    <div className={base}>{inner}</div>
  )
}

export async function ClientsSection({ section, ctx }: SectionProps) {
  const clients = await getClients()
  if (!clients.length) return null
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  const id = `${ctx.anchor}-heading`
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined} className="py-20 lg:py-24">
      {(tone) => (
        <div className="container-x">
          {heading && <SectionHeading id={id} tone={tone} align="center" eyebrow={text(d.eyebrow, locale)} title={heading} intro={text(d.intro, locale)} />}
          {section.variant === 'marquee' && clients.length > 3 ? (
            <div className="marquee mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <ul className="marquee-track flex w-max gap-5">
                {[...clients, ...clients].map((c, i) => (
                  <li key={`${c.id}-${i}`} inert={i >= clients.length} className="w-56 shrink-0">
                    <ClientTile client={c} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-5">
              {clients.map((c, i) => (
                <Reveal as="li" key={c.id} delay={(i % 6) * 70} className="w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.85rem)] lg:w-[calc(25%-0.95rem)]">
                  <ClientTile client={c} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ team */

const AVATAR_BG = ['bg-[linear-gradient(135deg,#00327f,#0057a3)]', 'bg-[linear-gradient(135deg,#ff8e00,#ffc000)]', 'bg-[linear-gradient(135deg,#009b9c,#047845)]', 'bg-[linear-gradient(135deg,#001a45,#00327f)]']
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

function Avatar({ m, index, className }: { m: TeamMember; index: number; className: string }) {
  return m.photo ? (
    <Image src={m.photo.url} alt={m.photo.alt || `${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw" className={`object-cover ${className}`} />
  ) : (
    <div className={`absolute inset-0 grid place-items-center ${AVATAR_BG[index % AVATAR_BG.length]}`}>
      <span aria-hidden className="font-display text-5xl font-bold text-white/90">
        {initials(m.name)}
      </span>
    </div>
  )
}

function MemberLinks({ m, label }: { m: TeamMember; label: string }) {
  if (!m.email && !m.linkedin) return null
  const cls = 'grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-brand-navy transition hover:border-brand-blue hover:bg-brand-blue hover:text-white'
  return (
    <div className="mt-5 flex gap-2.5">
      {m.email && (
        <a href={`mailto:${m.email}`} aria-label={`${label} ${m.name}`} className={cls}>
          <MailIcon width={18} height={18} />
        </a>
      )}
      {m.linkedin && (
        <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className={cls}>
          <SocialIcon platform="linkedin" width={18} height={18} />
        </a>
      )}
    </div>
  )
}

export async function TeamSection({ section, ctx }: SectionProps) {
  const { locale, t } = ctx
  const d = section.data
  const members = await getTeam()
  const heading = text(d.heading, locale)
  const empty = text(d.emptyMessage, locale)
  // Nobody published and nothing to say about it: leave the section out rather than show an empty box.
  if (!members.length && !empty) return null
  const id = `${ctx.anchor}-heading`
  const group = mediaOf(d.groupPhoto, ctx)
  const cta = link(d.cta, locale)
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
      {(tone) => (
        <div className="container-x">
          {heading && <SectionHeading id={id} tone={tone} align="center" eyebrow={text(d.eyebrow, locale)} title={heading} intro={text(d.intro, locale)} />}
          {group && (
            <Reveal className="mt-12">
              <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-navy/15">
                <Image src={group.url} alt={group.alt} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
              </div>
            </Reveal>
          )}
          {members.length === 0 ? (
            <Reveal className="mx-auto mt-12 max-w-2xl">
              <div className={`rounded-3xl border border-dashed p-10 text-center ${tone === 'dark' ? 'border-white/25 bg-white/5' : 'border-brand-blue/30 bg-slate-50'}`}>
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-cool text-white">
                  <UsersIcon width={30} height={30} />
                </span>
                <p className={`mt-5 text-lg leading-relaxed ${muted(tone)}`}>{empty}</p>
              </div>
            </Reveal>
          ) : section.variant === 'list' ? (
            <ul className="mt-14 grid gap-5 md:grid-cols-2">
              {members.map((m, i) => (
                <Reveal as="li" key={m.id} delay={(i % 2) * 100}>
                  <article className={`flex h-full gap-5 p-5 ${card(tone)}`}>
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-brand-navy-deep">
                      <Avatar m={m} index={i} className="" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-display text-lg font-semibold ${strong(tone)}`}>{m.name}</h3>
                      {m.role && <p className={`text-sm font-semibold ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue'}`}>{m.role}</p>}
                      {m.bio && <p className={`mt-2 text-sm leading-relaxed ${muted(tone)}`}>{m.bio}</p>}
                      <MemberLinks m={m} label={t.emailPerson} />
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          ) : (
            <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((m, i) => (
                <Reveal as="li" key={m.id} delay={(i % 4) * 100}>
                  <article className="group h-full overflow-hidden rounded-3xl bg-white text-slate-700 shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-navy-deep">
                      <Avatar m={m} index={i} className="transition duration-700 group-hover:scale-105" />
                      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy-deep/60 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-brand-navy-deep">{m.name}</h3>
                      {m.role && <p className="mt-0.5 text-sm font-semibold text-brand-blue">{m.role}</p>}
                      {m.bio && <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">{m.bio}</p>}
                      <MemberLinks m={m} label={t.emailPerson} />
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}
          {cta && (
            <Reveal className="mt-12 text-center">
              <SmartLink href={cta.url} newTab={cta.newTab} className="btn btn-primary">
                {cta.label}
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            </Reveal>
          )}
        </div>
      )}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ questions and answers */

/** The questions of an FAQ section, for the page's FAQPage structured data. */
export function faqPairs(section: SectionProps['section'], locale: SectionProps['ctx']['locale']) {
  return items(section.data.items)
    .map((it) => ({ question: text(it.question, locale), answer: text(it.answer, locale) }))
    .filter((f) => f.question && f.answer)
}

/** Accordion built on native <details>: works without JavaScript and answers stay readable to search engines. */
export function FaqSection({ section, ctx }: SectionProps) {
  const { locale, t } = ctx
  const faqs = faqPairs(section, locale)
  if (!faqs.length) return null
  const heading = text(section.data.heading, locale)
  const id = `${ctx.anchor}-heading`
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
      {(tone) => (
        <div className="container-x max-w-3xl">
          {heading && <SectionHeading id={id} tone={tone} align="center" eyebrow={t.faq} title={heading} intro={text(section.data.intro, locale)} />}
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={`${f.question}-${i}`} delay={(i % 4) * 70}>
                <details className="group rounded-2xl bg-white shadow-md shadow-brand-navy/5 ring-1 ring-brand-navy/5 open:ring-brand-blue/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold text-brand-navy-deep [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDownIcon width={20} height={20} className="shrink-0 text-brand-blue transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 px-5 pb-5 leading-relaxed text-slate-600">
                    {f.answer.split(/\n\s*\n/).map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ call to action */

export function CtaSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  const primary = link(d.primaryCta, locale)
  const secondary = link(d.secondaryCta, locale)
  if (!heading) return null
  const id = `${ctx.anchor}-heading`
  const body = (tone: Tone) => (
    <>
      <Reveal>
        <h2 id={id} className={`mx-auto max-w-3xl font-display text-section font-bold ${strong(tone)}`}>
          {heading}
        </h2>
      </Reveal>
      {text(d.text, locale) && (
        <Reveal delay={100}>
          <p className={`mx-auto mt-5 max-w-2xl text-lg ${muted(tone)}`}>{text(d.text, locale)}</p>
        </Reveal>
      )}
      <Reveal delay={200}>
        <Buttons primary={primary} secondary={secondary} tone={tone} className="mt-9 justify-center" />
      </Reveal>
    </>
  )
  if (section.variant === 'card') {
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={id} className="py-16 lg:py-20">
        {(tone) => (
          <div className="container-x">
            <div className={`mx-auto max-w-4xl rounded-[2rem] p-10 text-center sm:p-14 ${tone === 'dark' ? 'border border-white/15 bg-white/10 backdrop-blur-sm' : 'bg-white shadow-2xl shadow-brand-navy/10 ring-1 ring-brand-navy/10'}`}>
              {body(tone)}
            </div>
          </div>
        )}
      </SectionShell>
    )
  }
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id} className="py-20 lg:py-24">
      {(tone) => <div className="container-x text-center">{body(tone)}</div>}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ text */

export function RichTextSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const body = paragraphs(section.data.body, locale)
  if (!body.length) return null
  const heading = text(section.data.heading, locale)
  const id = `${ctx.anchor}-heading`
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined} className="py-16 lg:py-20">
      {(tone) => (
        <div className={`container-x ${section.variant === 'wide' ? 'max-w-6xl' : 'max-w-3xl'}`}>
          {heading && (
            <h2 id={id} className={`font-display text-section font-bold ${strong(tone)}`}>
              {heading}
            </h2>
          )}
          <div className={`space-y-5 text-lg leading-relaxed ${heading ? 'mt-6' : ''} ${muted(tone)}`}>
            {body.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  )
}
