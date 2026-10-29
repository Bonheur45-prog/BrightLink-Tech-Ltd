import Image from 'next/image'

import { ArrowRightIcon, CheckIcon, IconByKey } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SmartLink } from '@/components/ui/SmartLink'
import { getServices } from '@/lib/content'
import { SectionShell, TILES, bool, link, muted, num, strong, text, type SectionProps } from './shared'

const ACCENT = [
  { tile: 'bg-brand-warm', bar: 'bg-brand-orange', text: 'text-brand-orange' },
  { tile: 'bg-brand-cool', bar: 'bg-brand-blue', text: 'text-brand-blue' },
  { tile: 'bg-gradient-to-br from-brand-teal to-brand-green', bar: 'bg-brand-teal', text: 'text-brand-teal' },
  { tile: 'bg-gradient-to-br from-brand-blue to-brand-navy', bar: 'bg-brand-navy', text: 'text-brand-navy' },
]

/** Cards for the published services (edited under Services). */
export async function ServicesSection({ section, ctx }: SectionProps) {
  const { locale, t } = ctx
  const d = section.data
  const all = await getServices()
  const services = (bool(d.homeOnly, false) ? all.filter((s) => s.showOnHome) : all).slice(0, num(d.limit, 12))
  if (!services.length) return null
  const id = `${ctx.anchor}-heading`
  const more = text(d.learnMoreLabel, locale) || t.learnMore
  const viewAll = link(d.viewAll, locale)

  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id}>
      {(tone) => (
        <div className="container-x relative">
          <SectionHeading id={id} tone={tone} align="center" eyebrow={text(d.eyebrow, locale)} title={text(d.heading, locale)} intro={text(d.intro, locale)} />

          {section.variant === 'list' && (
            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              {services.map((s, i) => (
                <Reveal as="li" key={s.id} delay={(i % 2) * 100}>
                  <SmartLink
                    href={s.url}
                    className={`group flex h-full items-start gap-5 p-6 ${tone === 'dark' ? 'rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm transition hover:bg-white/15' : 'rounded-2xl bg-white shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-navy/10'}`}
                  >
                    <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
                      {s.image ? (
                        <Image src={s.image.url} alt={s.image.alt || `${s.title} service cover`} fill sizes="56px" className="object-cover" />
                      ) : (
                        <span className={`grid size-full place-items-center ${TILES[i % TILES.length]}`}>
                          <IconByKey name={s.icon} width={26} height={26} />
                        </span>
                      )}
                    </span>
                    <span className="flex-1">
                      <span className={`block font-display text-xl font-semibold ${strong(tone)}`}>{s.title}</span>
                      <span className={`mt-1.5 block text-[0.95rem] leading-relaxed ${muted(tone)}`}>{s.shortDescription}</span>
                      <span className={`mt-3 inline-flex items-center gap-2 font-semibold ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue group-hover:text-brand-navy'}`}>
                        {more}
                        <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                      </span>
                    </span>
                  </SmartLink>
                </Reveal>
              ))}
            </ul>
          )}

          {section.variant === 'large' && (
            <ul className="mt-14 grid gap-7 md:grid-cols-2">
              {services.map((s, i) => (
                <Reveal as="li" key={s.id} delay={(i % 2) * 110}>
                  <article className="group relative flex h-full flex-col rounded-3xl bg-white p-8 text-slate-700 shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
                    <span aria-hidden className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-brand-link opacity-0 transition group-hover:opacity-100" />
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                      {s.image ? (
                        <Image src={s.image.url} alt={s.image.alt || `${s.title} service cover`} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <span className={`absolute inset-0 grid place-items-center ${TILES[i % TILES.length]}`}>
                          <IconByKey name={s.icon} width={38} height={38} />
                        </span>
                      )}
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold text-brand-navy-deep">{s.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{s.shortDescription}</p>
                    {s.features.length > 0 && (
                      <ul className="mt-5 space-y-2">
                        {s.features.map((f) => (
                          <li key={f} className="flex gap-2.5 text-[0.95rem] text-slate-700">
                            <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand-green" strokeWidth={2.4} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <SmartLink
                      href={s.url}
                      aria-label={`${more}: ${s.title}`}
                      className="mt-auto inline-flex items-center gap-2 pt-7 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
                    >
                      {more}
                      <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                    </SmartLink>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}

          {section.variant === 'cards' && (
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {services.map((s, i) => {
                const a = ACCENT[i % ACCENT.length]
                return (
                  <Reveal as="li" key={s.id} delay={(i % 4) * 110}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 text-slate-700 shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-navy/15">
                      <span aria-hidden className={`absolute inset-x-0 top-0 z-10 h-1.5 origin-left scale-x-[0.3] transition-transform duration-500 group-hover:scale-x-100 ${a.bar}`} />
                      {s.image && (
                        <div className="relative -mx-7 -mt-7 mb-6 aspect-[16/10] overflow-hidden bg-slate-100">
                          <Image src={s.image.url} alt={s.image.alt || `${s.title} service cover`} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <span className={`grid size-14 place-items-center rounded-2xl text-white shadow-lg ${a.tile}`}>
                          <IconByKey name={s.icon} width={28} height={28} />
                        </span>
                        <span aria-hidden className="font-display text-4xl font-bold text-slate-100 transition group-hover:text-slate-200">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="mt-6 font-display text-xl font-semibold text-brand-navy-deep">{s.title}</h3>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">{s.shortDescription}</p>
                      {s.features.length > 0 && (
                        <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                          {s.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex gap-2.5">
                              <CheckIcon width={18} height={18} className={`mt-0.5 shrink-0 ${a.text}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <SmartLink
                        href={s.url}
                        aria-label={`${more}: ${s.title}`}
                        className="mt-auto inline-flex items-center gap-2 pt-7 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
                      >
                        {more}
                        <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                      </SmartLink>
                    </article>
                  </Reveal>
                )
              })}
            </ul>
          )}

          {viewAll && (
            <Reveal className="mt-12 text-center">
              <SmartLink href={viewAll.url} newTab={viewAll.newTab} className={tone === 'dark' ? 'btn btn-ghost' : 'btn btn-outline'}>
                {viewAll.label}
              </SmartLink>
            </Reveal>
          )}
        </div>
      )}
    </SectionShell>
  )
}
