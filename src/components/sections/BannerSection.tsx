import Image from 'next/image'

import { ChevronRightIcon } from '@/components/ui/Icons'
import { PageBanner, type Crumb } from '@/components/ui/PageBanner'
import { SmartLink } from '@/components/ui/SmartLink'
import { BrandArt, Buttons, link, mediaOf, text, type SectionProps } from './shared'

function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
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
  )
}

/** Title area at the top of an inner page: breadcrumb, the page's H1, intro, optional photo. */
export function BannerSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const eyebrow = text(section.data.eyebrow, locale)
  const heading = text(section.data.heading, locale)
  const intro = text(section.data.intro, locale)
  const image = mediaOf(section.data.image, ctx) ?? ctx.page.fallbackImage ?? null
  const cta = link(section.data.cta, locale)
  if (!heading) return null
  const Heading = ctx.first ? 'h1' : 'h2'

  if (section.variant === 'split') {
    return (
      <section id={ctx.anchor} className="relative isolate overflow-hidden bg-brand-navy-deep text-white">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_60%,#0057a3_100%)]">
          <div className="hero-orb absolute -left-24 -top-10 size-[24rem] rounded-full bg-brand-orange/30 blur-3xl" />
        </div>
        <div className="container-x grid items-center gap-10 pb-16 pt-14 lg:grid-cols-12 lg:gap-14 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-7">
            <Breadcrumb crumbs={ctx.page.crumbs} />
            {eyebrow && (
              <p className="hero-reveal mt-8 inline-flex lg:mt-6 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur sm:text-[0.8rem]">
                <span aria-hidden className="size-2 rounded-full bg-brand-link" />
                {eyebrow}
              </p>
            )}
            <Heading className="hero-reveal mt-5 font-display text-page font-bold !text-white [animation-delay:120ms]">{heading}</Heading>
            {intro && <p className="hero-reveal mt-6 max-w-2xl text-lg leading-relaxed text-white/85 [animation-delay:240ms] lg:mt-5">{intro}</p>}
            <Buttons primary={cta} tone="dark" className="hero-reveal mt-9 lg:mt-8 [animation-delay:320ms]" />
          </div>
          <div className="hero-reveal relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/30 [animation-delay:200ms] lg:col-span-5">
            {image ? (
              <Image src={image.url} alt={image.alt} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            ) : (
              <BrandArt />
            )}
          </div>
        </div>
        <div aria-hidden className="h-1 bg-brand-link" />
      </section>
    )
  }

  return (
    <div id={ctx.anchor}>
      <PageBanner
        as={Heading}
        eyebrow={eyebrow}
        title={heading}
        intro={intro}
        image={section.variant === 'plain' ? null : image}
        crumbs={ctx.page.crumbs}
        cta={cta}
      />
    </div>
  )
}
