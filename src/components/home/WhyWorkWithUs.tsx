import Image from 'next/image'

import { ParallaxBg } from '@/components/ui/ParallaxBg'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { WhyData } from '@/lib/content/types'
import { NewsletterForm } from './NewsletterForm'

export function WhyWorkWithUs({ data }: { data: WhyData }) {
  if (!data.enabled) return null
  const { newsletter } = data

  return (
    <section id="why-us" aria-labelledby="why-heading" className="relative isolate overflow-hidden py-24 text-white lg:py-32">
      {/* large background picture that drifts as the page scrolls */}
      <div className="absolute inset-0 -z-10 bg-brand-navy-deep">
        <ParallaxBg>
          {data.backgroundImage ? (
            <Image src={data.backgroundImage.url} alt="" fill sizes="100vw" quality={70} className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#001a45_0%,#00327f_55%,#0057a3_100%)]">
              <div className="absolute -left-20 top-1/4 size-[30rem] rounded-full bg-brand-orange/25 blur-3xl" />
              <div className="absolute -right-10 bottom-0 size-[34rem] rounded-full bg-brand-teal/25 blur-3xl" />
              <Image
                src="/images/brand/brightlink-mark.png"
                alt=""
                width={212}
                height={280}
                aria-hidden
                className="absolute right-[6%] top-1/2 hidden h-[70%] w-auto -translate-y-1/2 opacity-[0.07] md:block"
              />
            </div>
          )}
        </ParallaxBg>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep/95 via-brand-navy-deep/80 to-brand-navy-deep/60" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading id="why-heading" tone="dark" eyebrow={data.eyebrow} title={data.heading} intro={data.message} />

          {data.points.length > 0 && (
            <ul className="mt-9 grid gap-4 sm:grid-cols-3">
              {data.points.map((p, i) => (
                <Reveal as="li" key={`${p.title}-${i}`} delay={200 + i * 110}>
                  <div className="h-full rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition hover:bg-white/15">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">
                      <IconByKey name={p.icon} width={22} height={22} />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold !text-white">{p.title}</h3>
                    {p.text && <p className="mt-1.5 text-sm leading-relaxed text-white/75">{p.text}</p>}
                  </div>
                </Reveal>
              ))}
            </ul>
          )}

          {data.cta && (
            <Reveal delay={550} className="mt-10">
              <SmartLink href={data.cta.url} newTab={data.cta.newTab} className="btn btn-primary">
                {data.cta.label}
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            </Reveal>
          )}
        </div>

        {newsletter.enabled && (
          <Reveal from="right" delay={250} className="lg:col-span-5">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-md sm:p-9">
              <h3 className="font-display text-2xl font-semibold !text-white">{newsletter.heading}</h3>
              {newsletter.text && <p className="mb-6 mt-2 text-white/75">{newsletter.text}</p>}
              <NewsletterForm buttonLabel={newsletter.buttonLabel} />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
