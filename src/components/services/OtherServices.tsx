import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ServiceItem } from '@/lib/content/types'

export function OtherServices({ services, heading = 'Explore our other services' }: { services: ServiceItem[]; heading?: string }) {
  if (services.length === 0) return null
  return (
    <section aria-labelledby="other-services-heading" className="bg-white py-16 lg:py-20">
      <div className="container-x">
        <SectionHeading id="other-services-heading" align="center" title={heading} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 90}>
              <SmartLink
                href={s.url}
                className="group flex h-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-navy/10"
              >
                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-warm text-brand-navy-deep">
                  {s.image ? <Image src={s.image.url} alt={s.image.alt || `${s.title} service cover`} fill sizes="48px" className="object-cover" /> : <IconByKey name={s.icon} width={24} height={24} />}
                </span>
                <span className="flex-1 font-display text-lg font-semibold text-brand-navy-deep">{s.title}</span>
                <ArrowRightIcon width={18} height={18} className="text-brand-blue transition group-hover:translate-x-1.5" />
              </SmartLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
