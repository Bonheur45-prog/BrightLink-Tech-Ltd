import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { IconByKey } from '@/components/ui/Icons'
import type { ServiceDetail } from '@/lib/content/types'

const TILES = [
  'bg-brand-warm text-brand-navy-deep',
  'bg-brand-cool text-white',
  'bg-gradient-to-br from-brand-teal to-brand-green text-white',
  'bg-gradient-to-br from-brand-blue to-brand-navy text-white',
]

export function Offerings({ data }: { data: ServiceDetail['offerings'] }) {
  if (data.items.length === 0) return null
  return (
    <section id="what-we-offer" aria-labelledby="offerings-heading" className="relative overflow-x-clip bg-slate-50 py-20 lg:py-28">
      <div className="container-x relative">
        <SectionHeading id="offerings-heading" align="center" eyebrow="What’s included" title={data.heading} intro={data.intro} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((it, i) => (
            <Reveal as="li" key={`${it.title}-${i}`} delay={(i % 3) * 100}>
              <div className="h-full rounded-2xl bg-white p-7 shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/10">
                <span className={`grid size-14 place-items-center rounded-2xl shadow-lg ${TILES[i % TILES.length]}`}>
                  <IconByKey name={it.icon} width={26} height={26} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-brand-navy-deep">{it.title}</h3>
                {it.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{it.text}</p>}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
