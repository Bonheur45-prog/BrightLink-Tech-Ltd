import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, CheckIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ServiceItem } from '@/lib/content/types'

const TILES = [
  'bg-brand-warm text-brand-navy-deep',
  'bg-brand-cool text-white',
  'bg-gradient-to-br from-brand-teal to-brand-green text-white',
  'bg-gradient-to-br from-brand-blue to-brand-navy text-white',
]

/** Large cards for the Our Services overview — every card links to its own service page. */
export function ServiceCards({ eyebrow, heading, intro, services }: { eyebrow: string; heading: string; intro: string; services: ServiceItem[] }) {
  return (
    <section id="services" aria-labelledby="services-list-heading" className="bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading id="services-list-heading" align="center" eyebrow={eyebrow} title={heading} intro={intro} />
        <ul className="mt-14 grid gap-7 md:grid-cols-2">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 2) * 110}>
              <article className="group relative flex h-full flex-col rounded-3xl bg-white p-8 shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
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
                <h3 className="mt-6 font-display text-2xl font-semibold">{s.title}</h3>
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
                  aria-label={`Learn more about ${s.title}`}
                  className="mt-auto inline-flex items-center gap-2 pt-7 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
                >
                  Learn more
                  <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                </SmartLink>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
