import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { AboutData, ServiceItem } from '@/lib/content/types'

const TILES = ['bg-brand-warm text-brand-navy-deep', 'bg-brand-cool text-white', 'bg-gradient-to-br from-brand-teal to-brand-green text-white', 'bg-gradient-to-br from-brand-blue to-brand-navy text-white']

/** Compact service tiles; each links to its page under /our-services. */
export function ServicesOffer({ data, services }: { data: AboutData['services']; services: ServiceItem[] }) {
  if (!data.enabled || services.length === 0) return null
  return (
    <section id="offer" aria-labelledby="offer-heading" className="bg-slate-50 py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading id="offer-heading" align="center" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 2) * 100}>
              <SmartLink
                href={s.url}
                className="group flex h-full items-start gap-5 rounded-2xl bg-white p-6 shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-navy/10"
              >
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl shadow-lg ${TILES[i % TILES.length]}`}>
                  <IconByKey name={s.icon} width={26} height={26} />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-xl font-semibold text-brand-navy-deep">{s.title}</span>
                  <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-slate-600">{s.shortDescription}</span>
                  <span className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-blue group-hover:text-brand-navy">
                    Learn more
                    <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                  </span>
                </span>
              </SmartLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
