import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ServiceDetail } from '@/lib/content/types'

/** Introduction of the service: text and ticked highlights on the left, a picture space on the right. */
export function ServiceOverview({ service }: { service: ServiceDetail }) {
  const { overview, image } = { overview: service.overview, image: service.overview.image ?? service.image }
  if (!overview.heading && overview.paragraphs.length === 0) return null
  return (
    <section id="overview" aria-labelledby="overview-heading" className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 size-[26rem] rounded-full bg-brand-yellow/15 blur-3xl" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading id="overview-heading" eyebrow={overview.eyebrow} title={overview.heading} highlight={overview.highlightText} />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
            {overview.paragraphs.map((p, i) => (
              <Reveal key={i} delay={140 + i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {service.features.length > 0 && (
            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {service.features.map((f, i) => (
                <Reveal as="li" key={f} delay={300 + i * 80} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-warm text-brand-navy-deep">
                    <IconByKey name="check" width={16} height={16} strokeWidth={2.4} />
                  </span>
                  <span className="font-medium text-brand-navy-deep">{f}</span>
                </Reveal>
              ))}
            </ul>
          )}
          <Reveal delay={520} className="mt-9">
            <SmartLink href="/#get-in-touch" className="btn btn-primary">
              Start a conversation
              <ArrowRightIcon width={18} height={18} />
            </SmartLink>
          </Reveal>
        </div>

        {/* picture space */}
        <Reveal from="right" className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div aria-hidden className="absolute -right-4 -top-4 h-full w-4/5 rounded-[2rem] bg-brand-link opacity-90 sm:-right-5 sm:-top-5" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-2xl shadow-brand-navy/20">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || `${service.title} by BrightLink Technologies`}
                fill
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#001a45_0%,#00327f_60%,#0057a3_100%)]">
                <div className="absolute -left-10 top-6 size-56 rounded-full bg-brand-orange/30 blur-3xl" />
                <div className="absolute -bottom-10 right-0 size-64 rounded-full bg-brand-teal/30 blur-3xl" />
                <span className="float-soft absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-brand-warm text-brand-navy-deep shadow-2xl">
                  <IconByKey name={service.icon} width={52} height={52} />
                </span>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
