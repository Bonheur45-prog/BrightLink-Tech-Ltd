import { Reveal } from '@/components/ui/Reveal'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { AboutData } from '@/lib/content/types'

export function ClosingCta({ data }: { data: AboutData['closing'] }) {
  if (!data.enabled) return null
  return (
    <section aria-labelledby="closing-heading" className="relative isolate overflow-hidden bg-brand-navy-deep py-20 text-white lg:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,#001a45_0%,#00327f_60%,#0057a3_100%)]" />
      <div aria-hidden className="absolute -left-20 top-0 -z-10 size-80 rounded-full bg-brand-orange/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 right-0 -z-10 size-96 rounded-full bg-brand-teal/25 blur-3xl" />
      <div className="container-x text-center">
        <Reveal>
          <h2 id="closing-heading" className="mx-auto max-w-3xl font-display text-section font-bold !text-white">
            {data.heading}
          </h2>
        </Reveal>
        {data.text && (
          <Reveal delay={100}>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">{data.text}</p>
          </Reveal>
        )}
        <Reveal delay={200} className="mt-9 flex flex-wrap justify-center gap-3">
          {data.primaryCta && (
            <SmartLink href={data.primaryCta.url} newTab={data.primaryCta.newTab} className="btn btn-primary">
              {data.primaryCta.label}
              <ArrowRightIcon width={18} height={18} />
            </SmartLink>
          )}
          {data.secondaryCta && (
            <SmartLink href={data.secondaryCta.url} newTab={data.secondaryCta.newTab} className="btn btn-ghost">
              {data.secondaryCta.label}
            </SmartLink>
          )}
        </Reveal>
      </div>
    </section>
  )
}
