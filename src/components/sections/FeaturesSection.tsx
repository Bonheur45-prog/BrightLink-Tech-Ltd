import Image from 'next/image'

import { NewsletterForm } from '@/components/home/NewsletterForm'
import { IconByKey } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Section } from '@/lib/pages/model'
import { Buttons, SectionShell, TILES, card, iconCards, link, mediaOf, muted, strong, text, type SectionCtx, type SectionProps } from './shared'

const STEP_COLS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3' }

/** The newsletter box shown beside a "list" of icon cards when a newsletter section directly follows it. */
function NewsletterCard({ section, ctx }: { section: Section; ctx: SectionCtx }) {
  const d = section.data
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-md sm:p-9">
      <h3 className="font-display text-2xl font-semibold !text-white">{text(d.heading, ctx.locale)}</h3>
      {text(d.text, ctx.locale) && <p className="mb-6 mt-2 text-white/75">{text(d.text, ctx.locale)}</p>}
      <NewsletterForm buttonLabel={text(d.buttonLabel, ctx.locale) || 'Subscribe'} source={`${ctx.page.key.charAt(0).toUpperCase() + ctx.page.key.slice(1)} page — newsletter`} />
    </div>
  )
}

/** Reasons, values, offerings or steps, each with an icon: cards, a list beside a photo, or numbered steps. */
export function FeaturesSection({ section, ctx, newsletter }: SectionProps & { newsletter?: Section }) {
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  const cards = iconCards(d.items, locale)
  if (!heading && !cards.length) return null
  const id = `${ctx.anchor}-heading`
  const eyebrow = text(d.eyebrow, locale)
  const intro = text(d.intro, locale)
  const cta = link(d.cta, locale)
  const image = mediaOf(d.image, ctx)

  if (section.variant === 'steps') {
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={id}>
        {(tone) => (
          <div className="container-x">
            <SectionHeading id={id} tone={tone} align="center" eyebrow={eyebrow} title={heading} intro={intro} />
            <ol className={`relative mt-16 grid gap-10 sm:grid-cols-2 ${STEP_COLS[cards.length] ?? 'lg:grid-cols-4'}`}>
              <div aria-hidden className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-gradient-to-r from-brand-orange via-brand-teal to-brand-blue opacity-40 lg:block" />
              {cards.map((s, i) => (
                <Reveal as="li" key={s.id} delay={i * 120} className="relative text-center">
                  <span className={`relative mx-auto grid size-16 place-items-center rounded-full bg-brand-warm font-display text-2xl font-bold text-brand-navy-deep shadow-lg shadow-brand-orange/30 ring-8 ${tone === 'dark' ? 'ring-brand-navy-deep' : 'ring-white'}`}>
                    {i + 1}
                  </span>
                  <h3 className={`mt-6 font-display text-xl font-semibold ${strong(tone)}`}>{s.title}</h3>
                  {s.text && <p className={`mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed ${muted(tone)}`}>{s.text}</p>}
                </Reveal>
              ))}
            </ol>
            <Buttons primary={cta} tone={tone} className="mt-12 justify-center" />
          </div>
        )}
      </SectionShell>
    )
  }

  if (section.variant === 'list') {
    const side = newsletter ?? null
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={id} className="py-24">
        {(tone) => (
          <div className={`container-x grid items-center gap-12 lg:gap-16 ${side || image ? 'lg:grid-cols-12' : ''}`}>
            <div className={side || image ? 'lg:col-span-7' : ''}>
              <SectionHeading id={id} tone={tone} eyebrow={eyebrow} title={heading} intro={intro} />
              {cards.length > 0 && (
                <ul className={`mt-9 grid gap-4 sm:grid-cols-2 ${side || image ? 'xl:grid-cols-3' : 'lg:grid-cols-4'}`}>
                  {cards.map((p, i) => (
                    <Reveal as="li" key={p.id} delay={200 + i * 110}>
                      <div className={`h-full p-5 ${card(tone)}`}>
                        <span className="grid size-11 place-items-center rounded-xl bg-brand-warm text-brand-navy-deep">
                          <IconByKey name={p.icon} width={22} height={22} />
                        </span>
                        <h3 className={`mt-4 font-display text-lg font-semibold ${strong(tone)}`}>{p.title}</h3>
                        {p.text && <p className={`mt-1.5 text-sm leading-relaxed ${muted(tone)}`}>{p.text}</p>}
                      </div>
                    </Reveal>
                  ))}
                </ul>
              )}
              <Reveal delay={550}>
                <Buttons primary={cta} tone={tone} className="mt-10" />
              </Reveal>
            </div>
            {side ? (
              <Reveal from="right" delay={250} className="lg:col-span-5">
                {tone === 'dark' ? (
                  <NewsletterCard section={side} ctx={ctx} />
                ) : (
                  <div className="rounded-3xl bg-brand-navy-deep p-1">
                    <NewsletterCard section={side} ctx={ctx} />
                  </div>
                )}
              </Reveal>
            ) : image ? (
              <Reveal from="right" delay={250} className="relative lg:col-span-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-navy/20">
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                </div>
              </Reveal>
            ) : null}
          </div>
        )}
      </SectionShell>
    )
  }

  // cards (default)
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id}>
      {(tone) => (
        <div className="container-x relative">
          <SectionHeading id={id} tone={tone} align="center" eyebrow={eyebrow} title={heading} intro={intro} />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((it, i) => (
              <Reveal as="li" key={it.id} delay={(i % 3) * 100}>
                <div className={`h-full p-7 ${card(tone)}`}>
                  <span className={`grid size-14 place-items-center rounded-2xl shadow-lg ${TILES[i % TILES.length]}`}>
                    <IconByKey name={it.icon} width={26} height={26} />
                  </span>
                  <h3 className={`mt-5 font-display text-xl font-semibold ${strong(tone)}`}>{it.title}</h3>
                  {it.text && <p className={`mt-2 text-[0.95rem] leading-relaxed ${muted(tone)}`}>{it.text}</p>}
                </div>
              </Reveal>
            ))}
          </ul>
          <Buttons primary={cta} tone={tone} className="mt-12 justify-center" />
        </div>
      )}
    </SectionShell>
  )
}

/** Email box that adds people to Subscribers (a band of its own). */
export function NewsletterSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  if (!heading) return null
  const id = `${ctx.anchor}-heading`
  // A band on the page colour would hide the form's white text, so this band is always dark unless a photo is chosen.
  const shown: Section = section.background.style === 'image' ? section : { ...section, background: { ...section.background, style: 'dark' } }
  return (
    <SectionShell section={shown} ctx={ctx} labelledBy={id} className="py-16 lg:py-20">
      {() => (
        <div className="container-x grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 id={id} className="font-display text-3xl font-semibold !text-white">
              {heading}
            </h2>
            {text(d.text, locale) && <p className="mt-3 max-w-xl leading-relaxed text-white/75">{text(d.text, locale)}</p>}
          </div>
          <NewsletterForm buttonLabel={text(d.buttonLabel, locale) || 'Subscribe'} source={`${ctx.page.key.charAt(0).toUpperCase() + ctx.page.key.slice(1)} page — newsletter`} />
        </div>
      )}
    </SectionShell>
  )
}
