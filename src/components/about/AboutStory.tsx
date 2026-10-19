import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, CheckIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { AboutData } from '@/lib/content/types'

function Art({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 bg-[linear-gradient(145deg,#001a45_0%,#00327f_60%,#0057a3_100%)] ${className}`}>
      <div className="absolute -left-10 top-6 size-56 rounded-full bg-brand-orange/30 blur-3xl" />
      <div className="absolute -bottom-10 right-0 size-64 rounded-full bg-brand-teal/30 blur-3xl" />
      <Image
        src="/images/brand/brightlink-mark.png"
        alt=""
        width={212}
        height={280}
        aria-hidden
        className="float-soft absolute left-1/2 top-1/2 h-[50%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
    </div>
  )
}

export function AboutStory({ data }: { data: AboutData['story'] }) {
  if (!data.enabled) return null
  return (
    <section id="story" aria-labelledby="story-heading" className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 size-[28rem] rounded-full bg-brand-yellow/15 blur-3xl" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        {/* pictures */}
        <Reveal from="left" className="relative mx-auto w-full max-w-xl pb-10 lg:col-span-6 lg:max-w-none lg:pb-12">
          <div aria-hidden className="absolute -left-5 -top-5 h-full w-4/5 rounded-[2rem] bg-brand-link opacity-90" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-2xl shadow-brand-navy/20 lg:aspect-[5/6]">
            {data.image ? (
              <Image
                src={data.image.url}
                alt={data.image.alt || 'The BrightLink Technologies team at work'}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            ) : (
              <Art />
            )}
          </div>
          {/* smaller second picture */}
          <div className="absolute -bottom-0 right-4 w-[42%] overflow-hidden rounded-3xl border-[6px] border-white bg-brand-navy shadow-2xl sm:right-[-1.5rem]">
            <div className="relative aspect-square">
              {data.secondImage ? (
                <Image src={data.secondImage.url} alt={data.secondImage.alt || ''} fill sizes="240px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#ff8e00,#ffc000)]">
                  <Image
                    src="/images/brand/brightlink-mark.png"
                    alt=""
                    width={212}
                    height={280}
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-[62%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-95"
                  />
                </div>
              )}
            </div>
          </div>
          {data.badge && (
            <div className="absolute left-5 top-5 flex items-center gap-2.5 rounded-full bg-white/95 py-2 pl-3 pr-5 text-sm font-semibold text-brand-navy-deep shadow-xl backdrop-blur">
              <span className="size-2.5 rounded-full bg-brand-link" aria-hidden />
              {data.badge}
            </div>
          )}
        </Reveal>

        {/* text */}
        <div className="lg:col-span-6">
          <SectionHeading id="story-heading" eyebrow={data.eyebrow} title={data.heading} highlight={data.highlightText} />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
            {data.paragraphs.map((p, i) => (
              <Reveal key={i} delay={160 + i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {data.points.length > 0 && (
            <ul className="mt-8 space-y-3.5">
              {data.points.map((p, i) => (
                <Reveal as="li" key={p} delay={300 + i * 90} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-warm text-brand-navy-deep">
                    <CheckIcon width={16} height={16} strokeWidth={2.4} />
                  </span>
                  <span className="font-medium text-brand-navy-deep">{p}</span>
                </Reveal>
              ))}
            </ul>
          )}
          {data.cta && (
            <Reveal delay={600} className="mt-9">
              <SmartLink href={data.cta.url} newTab={data.cta.newTab} className="btn btn-primary">
                {data.cta.label}
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
