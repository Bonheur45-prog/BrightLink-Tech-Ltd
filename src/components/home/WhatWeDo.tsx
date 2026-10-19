import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, CheckIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ServiceItem, WhatWeDoData } from '@/lib/content/types'

const ACCENT = [
  { tile: 'bg-brand-warm', bar: 'bg-brand-orange', text: 'text-brand-orange' },
  { tile: 'bg-brand-cool', bar: 'bg-brand-blue', text: 'text-brand-blue' },
  { tile: 'bg-gradient-to-br from-brand-teal to-brand-green', bar: 'bg-brand-teal', text: 'text-brand-teal' },
  { tile: 'bg-gradient-to-br from-brand-blue to-brand-navy', bar: 'bg-brand-navy', text: 'text-brand-navy' },
]

export function WhatWeDo({ data, services }: { data: WhatWeDoData; services: ServiceItem[] }) {
  const items = services.filter((s) => s.showOnHome)
  if (!data.enabled || items.length === 0) return null

  return (
    <section id="what-we-do" aria-labelledby="what-heading" className="relative bg-slate-50 py-20 lg:py-28">
      <div aria-hidden className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(0,50,127,0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="container-x relative">
        <SectionHeading id="what-heading" align="center" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((service, i) => {
            const a = ACCENT[i % ACCENT.length]
            return (
              <Reveal as="li" key={service.id} delay={(i % 4) * 110}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-navy/15">
                  <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 origin-left scale-x-[0.3] transition-transform duration-500 group-hover:scale-x-100 ${a.bar}`} />
                  <div className="flex items-start justify-between">
                    <span className={`grid size-14 place-items-center rounded-2xl text-white shadow-lg ${a.tile}`}>
                      <IconByKey name={service.icon} width={28} height={28} />
                    </span>
                    <span aria-hidden className="font-display text-4xl font-bold text-slate-100 transition group-hover:text-slate-200">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">{service.shortDescription}</p>
                  {service.features.length > 0 && (
                    <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                      {service.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex gap-2.5">
                          <CheckIcon width={18} height={18} className={`mt-0.5 shrink-0 ${a.text}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <SmartLink
                    href={service.url}
                    aria-label={`${data.learnMoreLabel}: ${service.title}`}
                    className="mt-auto inline-flex items-center gap-2 pt-7 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
                  >
                    {data.learnMoreLabel}
                    <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                  </SmartLink>
                </article>
              </Reveal>
            )
          })}
        </ul>

        {data.viewAll && (
          <Reveal className="mt-12 text-center">
            <SmartLink href={data.viewAll.url} newTab={data.viewAll.newTab} className="btn btn-outline">
              {data.viewAll.label}
            </SmartLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}
