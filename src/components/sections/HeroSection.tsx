import { HeroSlider } from '@/components/home/HeroSlider'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { HeroData, HeroSlide } from '@/lib/content/types'
import type { Section } from '@/lib/pages/model'
import { bool, items, link, mediaOf, num, str, text, type SectionCtx, type SectionProps } from './shared'

const ACCENTS = ['bg-brand-orange', 'bg-brand-teal', 'bg-brand-blue', 'bg-brand-green']
const COLUMNS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }

function heroData(section: Section, ctx: SectionCtx): HeroData {
  const d = section.data
  const { locale } = ctx
  const slides: HeroSlide[] = items(d.slides).map((s) => {
    const image = mediaOf(s.image, ctx)
    const video = mediaOf(s.video, ctx)
    const isVideo = !!video && !!video.mimeType?.startsWith('video/')
    return {
      id: s.id,
      mediaType: isVideo ? 'video' : image ? 'image' : 'none',
      image,
      video: isVideo ? video : null,
      poster: isVideo && video.poster ? { url: video.poster, alt: '' } : image,
      eyebrow: text(s.eyebrow, locale),
      heading: text(s.heading, locale),
      highlightText: text(s.highlightText, locale),
      subheading: text(s.subheading, locale),
      primaryCta: link(s.primaryCta, locale),
      secondaryCta: link(s.secondaryCta, locale),
      textAlign: str(s.textAlign) === 'center' ? 'center' : 'left',
      overlay: (['light', 'medium', 'strong'] as const).find((o) => o === s.overlay) ?? 'medium',
      durationSeconds: null,
    }
  })
  return {
    enabled: true,
    autoplay: bool(d.autoplay, true),
    intervalSeconds: num(d.intervalSeconds, 7),
    height: (['full', 'large', 'medium'] as const).find((h) => h === section.variant) ?? 'full',
    kenBurns: bool(d.kenBurns, true),
    showArrows: bool(d.showArrows, true),
    showDots: bool(d.showDots, true),
    showProgress: bool(d.autoplay, true),
    slides: slides.filter((s) => s.heading),
  }
}

type Card = { id: string; title: string; text: string; url: string; label: string; newTab: boolean }

function highlightCards(section: Section | undefined, ctx: SectionCtx): Card[] {
  if (!section) return []
  return items(section.data.items)
    .slice(0, 4)
    .map((it) => {
      const l = it.link as { url?: string; newTab?: boolean } | undefined
      return {
        id: it.id,
        title: text(it.title, ctx.locale),
        text: text(it.text, ctx.locale),
        url: l?.url ?? '',
        label: link(it.link, ctx.locale)?.label || ctx.t.learnMore,
        newTab: !!l?.newTab,
      }
    })
    .filter((c) => c.title)
}

/** Row of linked cards. Right after a hero they overlap its bottom edge. */
function CardsRow({ cards, overlap }: { cards: Card[]; overlap: boolean }) {
  if (!cards.length) return null
  return (
    <div className={overlap ? 'relative z-30 -mt-16 pb-6 lg:-mt-20' : 'py-12 lg:py-16'}>
      <div className="container-x">
        <ul className={`grid gap-4 sm:grid-cols-2 ${COLUMNS[cards.length]}`}>
          {cards.map((card, i) => {
            const body = (
              <>
                <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${ACCENTS[i % ACCENTS.length]}`} />
                <h3 className="font-display text-xl font-semibold text-brand-navy-deep">{card.title}</h3>
                {card.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{card.text}</p>}
                {card.url && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
                    {card.label}
                    <ArrowRightIcon width={16} height={16} className="transition group-hover:translate-x-1" />
                  </span>
                )}
              </>
            )
            const cls = 'group relative block h-full rounded-2xl bg-white p-6 pt-8 shadow-xl shadow-brand-navy-deep/10 ring-1 ring-brand-navy-deep/5'
            return (
              <li key={card.id}>
                {card.url ? (
                  <SmartLink href={card.url} newTab={card.newTab} className={`${cls} transition hover:-translate-y-1 hover:shadow-2xl`}>
                    {body}
                  </SmartLink>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Hero slider; highlight cards placed right after it in the page builder overlap its bottom edge. */
export function HeroSection({ section, ctx, highlights }: SectionProps & { highlights?: Section }) {
  const hero = heroData(section, ctx)
  if (!hero.slides.length) return null
  const cards = highlightCards(highlights, ctx)
  return (
    <div id={ctx.anchor}>
      <HeroSlider hero={hero} hasHighlights={cards.length > 0} firstHeading={ctx.first ? 'h1' : 'h2'} />
      <CardsRow cards={cards} overlap />
    </div>
  )
}

/** Highlight cards anywhere else on a page. */
export function HighlightsSection({ section, ctx }: SectionProps) {
  const cards = highlightCards(section, ctx)
  if (!cards.length) return null
  return (
    <section id={ctx.anchor} aria-label={cards.map((c) => c.title).join(', ')} className={section.background.style === 'tint' ? 'bg-slate-50' : 'bg-white'}>
      <CardsRow cards={cards} overlap={false} />
    </section>
  )
}
