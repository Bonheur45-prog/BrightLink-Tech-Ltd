import Image from 'next/image'
import type { ReactNode } from 'react'

import { ArrowRightIcon } from '@/components/ui/Icons'
import { ParallaxBg } from '@/components/ui/ParallaxBg'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Crumb } from '@/components/ui/PageBanner'
import type { Locale } from '@/i18n/config'
import { ui, type UiText } from '@/i18n/ui'
import { tr, type T } from '@/lib/cms/globals-model'
import type { Cta, MediaRef, SiteSettingsData } from '@/lib/content/types'
import type { Item, LinkValue, Section, Value } from '@/lib/pages/model'

/* ------------------------------------------------------------------ context */

/** Everything a section needs besides its own data. */
export type SectionCtx = {
  locale: Locale
  t: UiText
  settings: SiteSettingsData
  /** Photos and videos used by the page, by media id. */
  media: Record<string, MediaRef>
  page: {
    key: string
    /** Address of the page without the language prefix, e.g. "/about-us". */
    path: string
    crumbs: Crumb[]
    /** On a service page: that service (for "this service's projects"). */
    serviceSlug?: string
    /** On the blog page: the search words and page number from the address. */
    search?: { q: string; page: number }
    /** On a service page: the service's cover photo, used where the page has no photo of its own. */
    fallbackImage?: MediaRef | null
  }
  /** Anchor for the section ("#get-in-touch"), unique on the page. */
  anchor: string
  /** The section directly follows a hero (highlight cards then overlap it). */
  afterHero: boolean
  /** The first section of the page: it holds the page's only <h1>. */
  first: boolean
}

export type SectionProps = { section: Section; ctx: SectionCtx }

export function makeCtx(base: Omit<SectionCtx, 't' | 'anchor' | 'afterHero' | 'first'>): Omit<SectionCtx, 'anchor' | 'afterHero' | 'first'> {
  return { ...base, t: ui(base.locale) }
}

/* ------------------------------------------------------------------ reading section data */

/** Text in the visitor's language (English when not translated). */
export const text = (v: Value | undefined, locale: Locale): string => (v && typeof v === 'object' && !Array.isArray(v) ? tr(v as T, locale) : '')

/** Long text → paragraphs (a blank line starts a new one). */
export const paragraphs = (v: Value | undefined, locale: Locale): string[] =>
  text(v, locale)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

/** Long text → one item per line. */
export const lines = (v: Value | undefined, locale: Locale): string[] =>
  text(v, locale)
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)

/** A button: only when it has both words and an address. */
export function link(v: Value | undefined, locale: Locale): Cta | null {
  const l = v as LinkValue | undefined
  if (!l || typeof l !== 'object' || !('url' in l) || !l.url) return null
  const label = tr(l.label, locale)
  return label ? { label, url: l.url, newTab: l.newTab } : null
}

export const mediaOf = (v: Value | undefined, ctx: SectionCtx): MediaRef | null => (typeof v === 'string' ? (ctx.media[v] ?? null) : null)
export const items = (v: Value | undefined): Item[] => (Array.isArray(v) ? v : [])
export const num = (v: Value | undefined, fallback: number) => (typeof v === 'number' ? v : fallback)
export const bool = (v: Value | undefined, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
export const str = (v: Value | undefined, fallback = '') => (typeof v === 'string' ? v : fallback)

/** Icon cards (features, values, steps) in the visitor's language. */
export const iconCards = (v: Value | undefined, locale: Locale) =>
  items(v)
    .map((it) => ({ id: it.id, icon: str(it.icon), title: text(it.title, locale), text: text(it.text, locale) }))
    .filter((c) => c.title)

/* ------------------------------------------------------------------ shell */

export type Tone = 'light' | 'dark'

const OVERLAY = {
  light: 'from-brand-navy-deep/80 via-brand-navy-deep/55 to-brand-navy-deep/30',
  medium: 'from-brand-navy-deep/95 via-brand-navy-deep/80 to-brand-navy-deep/60',
  strong: 'from-brand-navy-deep/[0.97] via-brand-navy-deep/90 to-brand-navy-deep/80',
} as const

const DOTS =
  'absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(0,50,127,0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]'

/**
 * The outside of every section: the background chosen in the page builder (page colour, light tint,
 * dark navy, or a photo that drifts while scrolling, with darkening), spacing, and the anchor.
 * Content is drawn by `children`, which is told whether it sits on a light or a dark background.
 */
export function SectionShell({
  section,
  ctx,
  labelledBy,
  className = 'py-20 lg:py-24',
  children,
}: {
  section: Section
  ctx: SectionCtx
  labelledBy?: string
  className?: string
  children: (tone: Tone) => ReactNode
}) {
  const bg = section.background
  const photo = bg.style === 'image' && bg.image ? (ctx.media[bg.image] ?? null) : null
  const style = bg.style === 'image' && !photo ? 'dark' : bg.style // photo missing → dark navy
  const tone: Tone = style === 'dark' || style === 'image' ? 'dark' : 'light'
  const drift = bg.parallax && ctx.settings.parallax

  return (
    <section
      id={ctx.anchor}
      aria-labelledby={labelledBy}
      className={`relative isolate scroll-mt-24 overflow-hidden ${tone === 'dark' ? 'bg-brand-navy-deep text-white' : style === 'tint' ? 'bg-slate-50' : 'bg-white'} ${className}`}
    >
      {style === 'tint' && <div aria-hidden className={`-z-10 ${DOTS}`} />}
      {style === 'dark' && (
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_60%,#0057a3_100%)]">
          <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-brand-orange/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 size-[30rem] rounded-full bg-brand-teal/20 blur-3xl" />
        </div>
      )}
      {style === 'image' && photo && (
        <div aria-hidden className="absolute inset-0 -z-10">
          {drift ? (
            <ParallaxBg>
              <Image src={photo.url} alt="" fill sizes="100vw" className="object-cover" />
            </ParallaxBg>
          ) : (
            <Image src={photo.url} alt="" fill sizes="100vw" className="object-cover" />
          )}
          <div className={`absolute inset-0 bg-gradient-to-r ${OVERLAY[bg.overlay]}`} />
        </div>
      )}
      {children(tone)}
    </section>
  )
}

/* ------------------------------------------------------------------ small shared pieces */

/** Main and second button of a section. */
export function Buttons({ primary, secondary, tone, className = '' }: { primary?: Cta | null; secondary?: Cta | null; tone: Tone; className?: string }) {
  if (!primary && !secondary) return null
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {primary && (
        <SmartLink href={primary.url} newTab={primary.newTab} className="btn btn-primary">
          {primary.label}
          <ArrowRightIcon width={18} height={18} />
        </SmartLink>
      )}
      {secondary && (
        <SmartLink href={secondary.url} newTab={secondary.newTab} className={tone === 'dark' ? 'btn btn-ghost' : 'btn btn-outline'}>
          {secondary.label}
        </SmartLink>
      )}
    </div>
  )
}

/** Brand artwork shown where a photo has not been chosen yet (never a broken image). */
export function BrandArt({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 bg-[linear-gradient(145deg,#001a45_0%,#00327f_60%,#0057a3_100%)] ${className}`}>
      <div className="absolute -left-10 top-6 size-56 rounded-full bg-brand-orange/30 blur-3xl" />
      <div className="absolute -bottom-10 right-0 size-64 rounded-full bg-brand-teal/30 blur-3xl" />
      <Image
        src="/images/brand/brightlink-mark.webp#w=~212"
        alt=""
        width={212}
        height={280}
        aria-hidden
        className="float-soft absolute left-1/2 top-1/2 h-[50%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
    </div>
  )
}

/** Colours for the icon tiles of cards, in turn. */
export const TILES = [
  'bg-brand-warm text-brand-navy-deep',
  'bg-brand-cool text-white',
  'bg-gradient-to-br from-brand-teal to-brand-green text-white',
  'bg-gradient-to-br from-brand-blue to-brand-navy text-white',
]

/** Card surface on a light or a dark background. */
export const card = (tone: Tone) =>
  tone === 'dark'
    ? 'rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm transition hover:bg-white/15'
    : 'rounded-2xl bg-white shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/10'

export const muted = (tone: Tone) => (tone === 'dark' ? 'text-white/75' : 'text-slate-600')
export const strong = (tone: Tone) => (tone === 'dark' ? '!text-white' : 'text-brand-navy-deep')
