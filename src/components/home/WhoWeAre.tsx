import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { WhoWeAreData } from '@/lib/content/types'

const TILES = ['bg-brand-warm', 'bg-brand-cool', 'bg-gradient-to-br from-brand-teal to-brand-green', 'bg-gradient-to-br from-brand-blue to-brand-navy']

export function WhoWeAre({ data }: { data: WhoWeAreData }) {
  if (!data.enabled) return null

  return (
    <section id="who-we-are" aria-labelledby="who-heading" className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* soft decorative glow */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 size-[28rem] rounded-full bg-brand-yellow/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-brand-teal/10 blur-3xl" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ------------------------------------------------ left: animated intro */}
        <div>
          <SectionHeading id="who-heading" eyebrow={data.eyebrow} title={data.heading} highlight={data.highlightText} />

          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
            {data.paragraphs.map((p, i) => (
              <Reveal key={i} delay={160 + i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          {data.features.length > 0 && (
            <ul className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {data.features.map((f, i) => (
                <Reveal as="li" key={`${f.title}-${i}`} delay={320 + i * 110} className="flex gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg shadow-brand-navy/10 transition duration-300 hover:-rotate-6 hover:scale-110 ${TILES[i % TILES.length]}`}
                  >
                    <IconByKey name={f.icon} width={24} height={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    {f.text && <p className="mt-1 text-[0.95rem] leading-relaxed text-slate-600">{f.text}</p>}
                  </div>
                </Reveal>
              ))}
            </ul>
          )}

          {(data.primaryCta || data.secondaryCta || data.learnMore) && (
            <Reveal delay={600} className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-4">
              {data.primaryCta && (
                <SmartLink href={data.primaryCta.url} newTab={data.primaryCta.newTab} className="btn btn-primary">
                  {data.primaryCta.label}
                  <ArrowRightIcon width={18} height={18} />
                </SmartLink>
              )}
              {data.secondaryCta && (
                <SmartLink href={data.secondaryCta.url} newTab={data.secondaryCta.newTab} className="btn btn-outline">
                  {data.secondaryCta.label}
                </SmartLink>
              )}
              {data.learnMore && (
                <SmartLink
                  href={data.learnMore.url}
                  newTab={data.learnMore.newTab}
                  className="group inline-flex items-center gap-1.5 px-2 py-3 font-semibold text-brand-blue hover:text-brand-navy"
                >
                  {data.learnMore.label}
                  <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1" />
                </SmartLink>
              )}
            </Reveal>
          )}
        </div>

        {/* ------------------------------------------------ right: picture space */}
        <Reveal from="right" delay={200} className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-xl shadow-slate-300/50 sm:aspect-[5/5] lg:aspect-[4/5]">
            {data.image ? (
              <Image
                src={data.image.url}
                alt={data.image.alt || 'The BrightLink Technologies team'}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#001a45_0%,#00327f_60%,#0057a3_100%)]">
                <div className="absolute -left-10 top-6 size-64 rounded-full bg-brand-orange/30 blur-3xl" />
                <div className="absolute -bottom-10 right-0 size-72 rounded-full bg-brand-teal/30 blur-3xl" />
                <Image
                  src="/images/brand/brightlink-mark.png"
                  alt=""
                  width={212}
                  height={280}
                  aria-hidden
                  className="float-soft absolute left-1/2 top-1/2 h-[55%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-90 drop-shadow-2xl"
                />
              </div>
            )}
            {data.badge && (
              <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-full bg-white/95 py-2 pl-3 pr-5 text-sm font-semibold text-brand-navy-deep shadow-xl backdrop-blur">
                <span className="size-2.5 rounded-full bg-brand-link" aria-hidden />
                {data.badge}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
