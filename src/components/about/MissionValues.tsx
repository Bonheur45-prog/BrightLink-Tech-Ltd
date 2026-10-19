import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { IconByKey, LightbulbIcon, TargetIcon } from '@/components/ui/Icons'
import type { AboutData } from '@/lib/content/types'

const VALUE_TILES = [
  'bg-brand-warm text-brand-navy-deep',
  'bg-brand-cool text-white',
  'bg-gradient-to-br from-brand-teal to-brand-green text-white',
  'bg-gradient-to-br from-brand-blue to-brand-navy text-white',
]

export function MissionValues({ data }: { data: AboutData['mission'] }) {
  if (!data.enabled) return null
  return (
    <section id="mission" aria-labelledby="mission-heading" className="relative overflow-x-clip bg-slate-50 py-20 lg:py-28">
      <div aria-hidden className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(0,50,127,0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="container-x relative">
        <SectionHeading id="mission-heading" align="center" eyebrow={data.eyebrow} title={data.heading} />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal from="left">
            <article className="relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#001a45,#00327f_70%,#0057a3)] p-8 text-white shadow-xl shadow-brand-navy/20 sm:p-10">
              <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-brand-orange/30 blur-3xl" />
              <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-warm text-brand-navy-deep">
                <TargetIcon width={28} height={28} />
              </span>
              <h3 className="relative mt-6 font-display text-2xl font-semibold !text-white">{data.missionTitle}</h3>
              <p className="relative mt-3 text-lg leading-relaxed text-white/85">{data.missionText}</p>
            </article>
          </Reveal>
          <Reveal from="right">
            <article className="relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-brand-navy/8 ring-1 ring-brand-navy/10 sm:p-10">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-brand-link" />
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-cool text-white">
                <LightbulbIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold">{data.visionTitle}</h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">{data.visionText}</p>
            </article>
          </Reveal>
        </div>

        {data.values.length > 0 && (
          <>
            <Reveal>
              <h3 className="mt-20 text-center font-display text-2xl font-semibold sm:text-3xl">{data.valuesHeading}</h3>
            </Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.values.map((v, i) => (
                <Reveal as="li" key={`${v.title}-${i}`} delay={i * 90}>
                  <div className="group h-full rounded-2xl bg-white p-6 shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/10">
                    <span className={`grid size-12 place-items-center rounded-xl shadow-lg ${VALUE_TILES[i % VALUE_TILES.length]}`}>
                      <IconByKey name={v.icon} width={24} height={24} />
                    </span>
                    <h4 className="mt-5 font-display text-lg font-semibold text-brand-navy-deep">{v.title}</h4>
                    {v.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{v.text}</p>}
                  </div>
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
