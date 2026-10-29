import Image from 'next/image'

import { CheckIcon, IconByKey } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { MediaRef } from '@/lib/content/types'
import { BrandArt, Buttons, SectionShell, iconCards, lines, link, mediaOf, muted, paragraphs, strong, text, type SectionProps, type Tone } from './shared'

const FEATURE_TILES = ['bg-brand-warm', 'bg-brand-cool', 'bg-gradient-to-br from-brand-teal to-brand-green', 'bg-gradient-to-br from-brand-blue to-brand-navy']

function Badge({ text: label, className }: { text: string; className: string }) {
  return (
    <div className={`absolute flex items-center gap-2.5 rounded-full bg-white/95 py-2 pl-3 pr-5 text-sm font-semibold text-brand-navy-deep shadow-xl backdrop-blur ${className}`}>
      <span className="size-2.5 rounded-full bg-brand-link" aria-hidden />
      {label}
    </div>
  )
}

function Photo({ image, sizes, priority = false }: { image: MediaRef | null; sizes: string; priority?: boolean }) {
  return image ? <Image src={image.url} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" /> : <BrandArt />
}

/** A story block: heading, paragraphs, bullet points, feature cards, buttons and one or two photos. */
export function TextMediaSection({ section, ctx }: SectionProps) {
  const { locale } = ctx
  const d = section.data
  const heading = text(d.heading, locale)
  if (!heading) return null
  const id = `${ctx.anchor}-heading`
  const body = paragraphs(d.body, locale)
  const points = lines(d.points, locale)
  const features = iconCards(d.items, locale)
  const image = mediaOf(d.image, ctx) ?? ctx.page.fallbackImage ?? null
  const second = mediaOf(d.secondImage, ctx)
  const badge = text(d.badge, locale)
  const primary = link(d.primaryCta, locale)
  const secondary = link(d.secondaryCta, locale)

  const copy = (tone: Tone, center = false) => (
    <div className={center ? 'mx-auto max-w-3xl text-center' : ''}>
      <SectionHeading id={id} tone={tone} align={center ? 'center' : 'left'} eyebrow={text(d.eyebrow, locale)} title={heading} highlight={text(d.highlightText, locale)} />
      {body.length > 0 && (
        <div className={`mt-6 space-y-4 text-lg leading-relaxed ${muted(tone)}`}>
          {body.map((p, i) => (
            <Reveal key={i} delay={160 + i * 80}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      )}
      {points.length > 0 && (
        <ul className={`mt-8 space-y-3.5 ${center ? 'inline-block text-left' : ''}`}>
          {points.map((p, i) => (
            <Reveal as="li" key={`${p}-${i}`} delay={300 + i * 90} className="flex gap-3.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-warm text-brand-navy-deep">
                <CheckIcon width={16} height={16} strokeWidth={2.4} />
              </span>
              <span className={`font-medium ${strong(tone)}`}>{p}</span>
            </Reveal>
          ))}
        </ul>
      )}
      {features.length > 0 && (
        <ul className={`mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2 ${center ? 'text-left' : ''}`}>
          {features.map((f, i) => (
            <Reveal as="li" key={f.id} delay={320 + i * 110} className="flex gap-4">
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg shadow-brand-navy/10 transition duration-300 hover:-rotate-6 hover:scale-110 ${FEATURE_TILES[i % FEATURE_TILES.length]}`}>
                <IconByKey name={f.icon} width={24} height={24} />
              </span>
              <div>
                <h3 className={`font-display text-lg font-semibold ${strong(tone)}`}>{f.title}</h3>
                {f.text && <p className={`mt-1 text-[0.95rem] leading-relaxed ${muted(tone)}`}>{f.text}</p>}
              </div>
            </Reveal>
          ))}
        </ul>
      )}
      <Reveal delay={600}>
        <Buttons primary={primary} secondary={secondary} tone={tone} className={`mt-10 ${center ? 'justify-center' : ''}`} />
      </Reveal>
    </div>
  )

  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id}>
      {(tone) => {
        if (section.variant === 'stacked') {
          return (
            <div className="container-x">
              {copy(tone, true)}
              {(image || second) && (
                <Reveal delay={200} className="relative mt-14">
                  <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-xl shadow-slate-300/50">
                    <Photo image={image ?? second} sizes="(min-width: 1280px) 1200px, 100vw" />
                    {badge && <Badge text={badge} className="bottom-5 left-5" />}
                  </div>
                </Reveal>
              )}
            </div>
          )
        }

        if (section.variant === 'image-left') {
          return (
            <div className="container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
              <Reveal from="left" className="relative mx-auto w-full max-w-xl pb-10 lg:col-span-6 lg:max-w-none lg:pb-12">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-xl shadow-slate-300/50 lg:aspect-[1/1]">
                  <Photo image={image} sizes="(min-width: 1024px) 560px, 100vw" />
                </div>
                {second && (
                  <div className="absolute bottom-0 right-4 w-[42%] overflow-hidden rounded-3xl border-[6px] border-white bg-brand-navy shadow-2xl sm:right-[-1.5rem]">
                    <div className="relative aspect-square">
                      <Image src={second.url} alt={second.alt} fill sizes="240px" className="object-cover" />
                    </div>
                  </div>
                )}
                {badge && <Badge text={badge} className="left-5 top-5" />}
              </Reveal>
              <div className="lg:col-span-6">{copy(tone)}</div>
            </div>
          )
        }

        // image-right (default)
        return (
          <div className="container-x relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>{copy(tone)}</div>
            <Reveal from="right" delay={200} className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy-deep shadow-xl shadow-slate-300/50 sm:aspect-[5/4] lg:aspect-[1/1]">
                <Photo image={image} sizes="(min-width: 1024px) 560px, 100vw" />
                {badge && <Badge text={badge} className="bottom-5 left-5" />}
              </div>
              {second && (
                <div className="absolute -bottom-8 -left-6 hidden w-[38%] overflow-hidden rounded-3xl border-[6px] border-white shadow-2xl sm:block">
                  <div className="relative aspect-square">
                    <Image src={second.url} alt={second.alt} fill sizes="220px" className="object-cover" />
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        )
      }}
    </SectionShell>
  )
}
