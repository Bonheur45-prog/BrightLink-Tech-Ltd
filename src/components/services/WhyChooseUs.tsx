import Image from 'next/image'

import { ParallaxBg } from '@/components/ui/ParallaxBg'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { IconCard, MediaRef } from '@/lib/content/types'

/** "Why choose us" band with a large background picture that drifts while scrolling. Used per service and on the overview. */
export function WhyChooseUs({
  eyebrow = 'Why Choose Us',
  heading,
  message,
  image,
  points,
  cta,
  id = 'why-choose-us',
}: {
  eyebrow?: string
  heading: string
  message?: string
  image: MediaRef | null
  points: IconCard[]
  cta?: { label: string; url: string } | null
  id?: string
}) {
  if (!heading && points.length === 0) return null
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="relative isolate overflow-hidden py-24 text-white lg:py-28">
      <div className="absolute inset-0 -z-10 bg-brand-navy-deep">
        <ParallaxBg>
          {image ? (
            <Image src={image.url} alt="" fill sizes="100vw" quality={70} className="object-cover" />
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
      <div className="container-x">
        <SectionHeading id={`${id}-heading`} tone="dark" eyebrow={eyebrow} title={heading} intro={message} />
        {points.length > 0 && (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {points.map((p, i) => (
              <Reveal as="li" key={`${p.title}-${i}`} delay={i * 100}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition hover:bg-white/15">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">
                    <IconByKey name={p.icon} width={24} height={24} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold !text-white">{p.title}</h3>
                  {p.text && <p className="mt-1.5 text-sm leading-relaxed text-white/75">{p.text}</p>}
                </div>
              </Reveal>
            ))}
          </ul>
        )}
        {cta && (
          <Reveal delay={300} className="mt-10">
            <SmartLink href={cta.url} className="btn btn-primary">
              {cta.label}
              <ArrowRightIcon width={18} height={18} />
            </SmartLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}
