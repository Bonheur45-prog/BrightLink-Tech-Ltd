import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { AboutData } from '@/lib/content/types'

export function Process({ data }: { data: AboutData['process'] }) {
  if (!data.enabled || data.steps.length === 0) return null
  const cols: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3' }
  return (
    <section id="how-we-work" aria-labelledby="process-heading" className="bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading id="process-heading" align="center" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />
        <ol className={`relative mt-16 grid gap-10 sm:grid-cols-2 ${cols[data.steps.length] ?? 'lg:grid-cols-4'}`}>
          {/* connecting line (desktop) */}
          <div aria-hidden className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-gradient-to-r from-brand-orange via-brand-teal to-brand-blue opacity-40 lg:block" />
          {data.steps.map((s, i) => (
            <Reveal as="li" key={`${s.title}-${i}`} delay={i * 120} className="relative text-center">
              <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-brand-warm font-display text-2xl font-bold text-brand-navy-deep shadow-lg shadow-brand-orange/30 ring-8 ring-white">
                {i + 1}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
              {s.text && <p className="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-slate-600">{s.text}</p>}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
