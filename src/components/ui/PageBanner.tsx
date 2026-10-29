import Image from 'next/image'

import { Reveal } from './Reveal'
import { Highlighted } from './SectionHeading'
import { SmartLink } from './SmartLink'
import { ArrowRightIcon, ChevronRightIcon } from './Icons'
import type { MediaRef } from '@/lib/content/types'

export type Crumb = { label: string; href?: string }

/** Banner at the top of every inner page: breadcrumb, H1, intro and an optional background picture. */
export function PageBanner({
  eyebrow,
  title,
  highlight,
  intro,
  crumbs,
  image,
  as: Heading = 'h1',
  cta,
}: {
  eyebrow?: string
  title: string
  highlight?: string
  intro?: string
  crumbs: Crumb[]
  image?: MediaRef | null
  /** h1 (default) when the banner holds the page title; h2 if a page builder section comes before it. */
  as?: 'h1' | 'h2'
  /** optional button under the intro */
  cta?: { label: string; url: string; newTab: boolean } | null
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy-deep text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        {image ? (
          <>
            <Image src={image.url} alt="" fill priority sizes="100vw" quality={70} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep/95 via-brand-navy-deep/80 to-brand-navy-deep/55" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#001a45_0%,#00327f_60%,#0057a3_100%)]">
            <div className="hero-orb absolute -left-24 -top-10 size-[24rem] rounded-full bg-brand-orange/30 blur-3xl" />
            <div className="hero-orb absolute -bottom-24 right-10 size-[28rem] rounded-full bg-brand-teal/30 blur-3xl [animation-delay:-6s]" />
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_75%_40%,black,transparent_70%)]" />
            <Image
              src="/images/brand/brightlink-mark.webp#w=~212"
              alt=""
              width={212}
              height={280}
              className="absolute -right-6 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 opacity-[0.09] md:block lg:right-[6%]"
            />
          </div>
        )}
      </div>

      <div className="container-x pb-16 pt-14 lg:pb-24 lg:pt-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon width={14} height={14} className="text-white/40" />}
                {c.href ? (
                  <SmartLink href={c.href} className="hover:text-brand-yellow">
                    {c.label}
                  </SmartLink>
                ) : (
                  <span aria-current="page" className="font-medium text-white">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow && (
          <p className="hero-reveal mt-8 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur sm:text-[0.8rem]">
            <span aria-hidden className="size-2 rounded-full bg-brand-link" />
            {eyebrow}
          </p>
        )}
        <Heading className="hero-reveal mt-5 max-w-4xl font-display text-page font-bold !text-white [animation-delay:120ms]">
          <Highlighted text={title} highlight={highlight} tone="dark" />
        </Heading>
        {intro && (
          <p className="hero-reveal mt-6 max-w-2xl text-lg leading-relaxed text-white/85 [animation-delay:240ms] lg:text-xl">
            {intro}
          </p>
        )}
        {cta && (
          <SmartLink href={cta.url} newTab={cta.newTab} className="btn btn-primary hero-reveal mt-9 [animation-delay:320ms]">
            {cta.label}
            <ArrowRightIcon width={18} height={18} />
          </SmartLink>
        )}
      </div>
      <div aria-hidden className="h-1 bg-brand-link" />
    </section>
  )
}

export { Reveal }
