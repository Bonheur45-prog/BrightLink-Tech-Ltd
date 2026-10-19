import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { HeroData, Highlight } from '@/lib/content/types'
import { HeroSlider } from './HeroSlider'

const ACCENTS = ['bg-brand-orange', 'bg-brand-teal', 'bg-brand-blue', 'bg-brand-green']
const COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

/** The home page hero: slider + optional highlight cards that overlap its bottom edge. */
export function Hero({ hero, highlights }: { hero: HeroData; highlights: Highlight[] }) {
  if (!hero.enabled) return null
  const cards = highlights.slice(0, 4)

  return (
    <>
      <HeroSlider hero={hero} hasHighlights={cards.length > 0} />
      {cards.length > 0 && (
        <div className="relative z-30 -mt-16 pb-6 lg:-mt-20">
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
                        Learn more
                        <ArrowRightIcon width={16} height={16} className="transition group-hover:translate-x-1" />
                      </span>
                    )}
                  </>
                )
                const cardClass =
                  'group relative block h-full rounded-2xl bg-white p-6 pt-8 shadow-xl shadow-brand-navy-deep/10 ring-1 ring-brand-navy-deep/5'
                return (
                  <li key={`${card.title}-${i}`}>
                    {card.url ? (
                      <SmartLink href={card.url} className={`${cardClass} transition hover:-translate-y-1 hover:shadow-2xl`}>
                        {body}
                      </SmartLink>
                    ) : (
                      <div className={cardClass}>{body}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
