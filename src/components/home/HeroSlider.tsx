'use client'

import Image from 'next/image'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode, TouchEvent } from 'react'

import { useUi } from '@/components/i18n/useUi'
import { SmartLink } from '@/components/ui/SmartLink'
import { fill } from '@/i18n/ui'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@/components/ui/Icons'
import type { HeroData, HeroSlide } from '@/lib/content/types'

/* ------------------------------------------------------------------ helpers */

const HEIGHT_CLASS: Record<HeroData['height'], string> = {
  full: 'min-h-[100svh]',
  large: 'min-h-[88svh]',
  medium: 'min-h-[70svh]',
}

// Darkness over photos/videos, tuned so white text stays readable (WCAG AA) on bright images.
const OVERLAY_LEFT: Record<HeroSlide['overlay'], string> = {
  light: 'from-brand-navy-deep/70 via-brand-navy-deep/35 to-brand-navy-deep/10',
  medium: 'from-brand-navy-deep/90 via-brand-navy-deep/55 to-brand-navy-deep/20',
  strong: 'from-brand-navy-deep/95 via-brand-navy-deep/78 to-brand-navy-deep/45',
}
const OVERLAY_CENTER: Record<HeroSlide['overlay'], string> = {
  light: 'bg-brand-navy-deep/50',
  medium: 'bg-brand-navy-deep/65',
  strong: 'bg-brand-navy-deep/80',
}

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` })

/** Wraps the editor's "highlight" words in the brand gradient (matched case-insensitively). */
function renderHeading(heading: string, highlight: string): ReactNode {
  if (!highlight) return heading
  const start = heading.toLowerCase().indexOf(highlight.toLowerCase())
  if (start === -1) return heading
  const end = start + highlight.length
  return (
    <Fragment>
      {heading.slice(0, start)}
      <span className="text-gradient-warm">{heading.slice(start, end)}</span>
      {heading.slice(end)}
    </Fragment>
  )
}

/* ------------------------------------------------------------------ media layers */

function BrandBackground() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#001a45_0%,#00327f_58%,#0057a3_100%)]">
      <div className="hero-orb absolute -left-24 top-0 size-[26rem] rounded-full bg-brand-orange/30 blur-3xl" />
      <div className="hero-orb absolute -bottom-24 right-0 size-[32rem] rounded-full bg-brand-teal/30 blur-3xl [animation-delay:-6s]" />
      <div
        className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_72%)]"
        aria-hidden
      />
      {/* the BrightLink link-mark, very faint, as a brand watermark */}
      <Image
        src="/images/brand/brightlink-mark.webp#w=~212"
        alt=""
        width={212}
        height={280}
        aria-hidden
        className="absolute right-[-6%] top-1/2 hidden h-[78%] w-auto -translate-y-1/2 opacity-[0.1] sm:block lg:right-[3%]"
      />
    </div>
  )
}

function HeroVideo({
  slide,
  playing,
  reduced,
  eager,
}: {
  slide: HeroSlide
  playing: boolean
  reduced: boolean
  eager: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const video = slide.video

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (playing) {
      el.play().catch(() => {
        /* autoplay can be blocked (e.g. data-saver); the poster stays visible */
      })
    } else {
      el.pause()
    }
  }, [playing])

  if (!video) return null

  // Visitors who prefer reduced motion get the still poster instead of a moving video.
  if (reduced) {
    return slide.poster ? (
      <Image src={slide.poster.url} alt="" fill sizes="100vw" className="object-cover" priority={eager} />
    ) : null
  }

  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover"
      muted
      loop
      playsInline
      autoPlay={eager}
      preload={eager ? 'auto' : 'metadata'}
      poster={slide.poster?.url.replace(/#w=[\d.]*~\d+$/, '')}
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
    >
      <source src={video.url} type={video.mimeType || 'video/mp4'} />
    </video>
  )
}

function SlideMedia({
  slide,
  index,
  active,
  playing,
  reduced,
  kenBurns,
}: {
  slide: HeroSlide
  index: number
  active: boolean
  playing: boolean
  reduced: boolean
  kenBurns: boolean
}) {
  const first = index === 0
  const isMedia = slide.mediaType !== 'none'

  return (
    <div
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-[1100ms] ease-in-out ${
        active ? 'z-[1] opacity-100' : 'z-0 opacity-0'
      }`}
    >
      {slide.mediaType === 'image' && slide.image && (
        <Image
          src={slide.image.url}
          alt={slide.image.alt || slide.heading}
          fill
          sizes="100vw"
          quality={75}
          priority={first}
          loading={first ? undefined : 'lazy'}
          className={`object-cover motion-reduce:!scale-100 motion-reduce:!transition-none ${
            kenBurns && active
              ? 'scale-[1.12] [transition:transform_14s_ease-out]'
              : 'scale-100 [transition:transform_0s_linear_1.2s]'
          }`}
        />
      )}
      {slide.mediaType === 'video' && (
        <HeroVideo slide={slide} playing={playing && active} reduced={reduced} eager={first} />
      )}
      {slide.mediaType === 'none' && <BrandBackground />}

      {isMedia && (
        <>
          {slide.textAlign === 'center' ? (
            <div className={`absolute inset-0 ${OVERLAY_CENTER[slide.overlay]}`} />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${OVERLAY_LEFT[slide.overlay]}`} />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy-deep/70 to-transparent" />
        </>
      )}
      {/* keeps the floating header readable on any picture */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-brand-navy-deep/65 to-transparent" />
    </div>
  )
}

/* ------------------------------------------------------------------ slider */

type Props = { hero: HeroData; hasHighlights: boolean; /** h1 when the hero opens the page (default) */ firstHeading?: 'h1' | 'h2' }

export function HeroSlider({ hero, hasHighlights, firstHeading = 'h1' }: Props) {
  const t = useUi()
  const { slides } = hero
  const count = slides.length
  const multiple = count > 1

  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  /* ---- user preferences & page visibility */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      mq.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count])
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count])
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count])

  // If an editor removes slides while the page is open, never point past the end.
  const safeActive = Math.min(active, count - 1)

  const autoplayAllowed = hero.autoplay && multiple && !reduced && !userPaused
  const running = autoplayAllowed && !hovered && !focused && !tabHidden
  const current = slides[safeActive]
  const duration = current.durationSeconds ?? hero.intervalSeconds

  /* ---- touch swipe */
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || !multiple) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!multiple) return
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  const controlsOffset = hasHighlights ? 'bottom-24' : 'bottom-6 lg:bottom-8'
  const glassBtn =
    'grid size-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:border-white/70 hover:bg-white/25'

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.featuredHighlights}
      className={`relative isolate flex flex-col justify-center overflow-hidden bg-brand-navy-deep text-white ${HEIGHT_CLASS[hero.height]}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      {/* ---------------- background media (all slides stacked, cross-faded) */}
      <div className="absolute inset-0 -z-10">
        {slides.map((slide, i) => (
          <SlideMedia
            key={slide.id}
            slide={slide}
            index={i}
            active={i === safeActive}
            playing={!userPaused}
            reduced={reduced}
            kenBurns={hero.kenBurns}
          />
        ))}
      </div>

      {/* ---------------- text (all slides stacked in one grid cell so the tallest sets the height) */}
      <div
        className={`container-x relative z-10 grid pt-36 lg:pt-[clamp(8.75rem,19vh,11rem)] ${hasHighlights ? 'pb-48 lg:pb-[clamp(10rem,23vh,13rem)]' : 'pb-36 lg:pb-[clamp(6.5rem,15vh,9rem)]'}`}
        aria-live={running ? 'off' : 'polite'}
      >
        {slides.map((slide, i) => {
          const isActive = i === safeActive
          const Heading = i === 0 ? firstHeading : 'h2' // one H1 per page: the first slide
          const centered = slide.textAlign === 'center'
          const animate = isActive ? 'hero-reveal' : ''
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(t.slideOf, { n: String(i + 1), count: String(count) })}
              inert={!isActive}
              className={`col-start-1 row-start-1 flex flex-col justify-center transition-opacity duration-500 ${
                centered ? 'items-center text-center' : 'items-start text-left'
              } ${isActive ? 'opacity-100 delay-300' : 'pointer-events-none opacity-0'}`}
            >
              {slide.eyebrow && (
                <p
                  className={`${animate} mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-[0.8rem]`}
                  style={delay(0.1)}
                >
                  <span className="size-2 rounded-full bg-brand-link" aria-hidden />
                  {slide.eyebrow}
                </p>
              )}
              <Heading
                className={`${animate} max-w-4xl font-display text-hero font-bold text-white`}
                style={delay(0.2)}
              >
                {renderHeading(slide.heading, slide.highlightText)}
              </Heading>
              {slide.subheading && (
                <p
                  className={`${animate} mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg lg:mt-5`}
                  style={delay(0.35)}
                >
                  {slide.subheading}
                </p>
              )}
              {(slide.primaryCta || slide.secondaryCta) && (
                <div
                  className={`${animate} mt-9 flex flex-wrap gap-3 lg:mt-8 ${centered ? 'justify-center' : ''}`}
                  style={delay(0.5)}
                >
                  {slide.primaryCta && (
                    <SmartLink href={slide.primaryCta.url} newTab={slide.primaryCta.newTab} className="btn btn-primary">
                      {slide.primaryCta.label}
                      <ArrowRightIcon width={18} height={18} />
                    </SmartLink>
                  )}
                  {slide.secondaryCta && (
                    <SmartLink href={slide.secondaryCta.url} newTab={slide.secondaryCta.newTab} className="btn btn-ghost">
                      {slide.secondaryCta.label}
                    </SmartLink>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ---------------- controls */}
      {multiple && (
        <div className={`absolute inset-x-0 z-20 ${controlsOffset}`}>
          <div className="container-x flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <p className="font-display text-sm tabular-nums text-white/70" aria-hidden>
                <span className="text-3xl font-semibold text-white">{String(safeActive + 1).padStart(2, '0')}</span>
                <span className="mx-1.5">/</span>
                {String(count).padStart(2, '0')}
              </p>
              {hero.showDots && (
                <ul className="flex items-center gap-2" aria-label={t.chooseSlide}>
                  {slides.map((slide, i) => (
                    <li key={slide.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={fill(t.goToSlide, { n: String(i + 1), name: slide.heading })}
                        aria-current={i === safeActive ? 'true' : undefined}
                        className="group grid h-6 place-items-center px-0.5"
                      >
                        <span
                          className={`block h-2 rounded-full transition-all duration-300 ${
                            i === safeActive ? 'w-9 bg-brand-warm' : 'w-2 bg-white/45 group-hover:bg-white/80'
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {hero.autoplay && !reduced && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? t.playSlideshow : t.pauseSlideshow}
                  className={glassBtn}
                >
                  {userPaused ? <PlayIcon width={16} height={16} /> : <PauseIcon width={18} height={18} />}
                </button>
              )}
              {hero.showArrows && (
                <>
                  <button type="button" onClick={prev} aria-label={t.previousSlide} className={glassBtn}>
                    <ChevronLeftIcon width={22} height={22} />
                  </button>
                  <button type="button" onClick={next} aria-label={t.nextSlide} className={glassBtn}>
                    <ChevronRightIcon width={22} height={22} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- progress bar: its animation end is what advances the slide */}
      {multiple && (
        <div
          aria-hidden
          className={`absolute inset-x-0 bottom-0 z-20 h-1 bg-white/10 transition-opacity ${
            hero.showProgress ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            key={`${safeActive}-${autoplayAllowed}`}
            className={`h-full origin-left bg-brand-link ${autoplayAllowed ? 'animate-hero-progress' : 'scale-x-0'}`}
            style={{
              animationDuration: `${duration}s`,
              animationPlayState: running ? 'running' : 'paused',
            }}
            onAnimationEnd={next}
          />
        </div>
      )}
    </section>
  )
}
