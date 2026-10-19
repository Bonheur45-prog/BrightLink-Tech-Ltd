import { NewsletterForm } from '@/components/home/NewsletterForm'
import { Reveal } from '@/components/ui/Reveal'
import type { BlogPageData } from '@/lib/content/types'

export function SubscribeBand({ data }: { data: BlogPageData['subscribe'] }) {
  if (!data.enabled) return null
  return (
    <section aria-labelledby="subscribe-heading" className="relative isolate overflow-hidden bg-brand-navy-deep py-16 text-white lg:py-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,#001a45_0%,#00327f_60%,#0057a3_100%)]" />
      <div aria-hidden className="absolute -left-16 top-0 -z-10 size-72 rounded-full bg-brand-orange/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-16 right-0 -z-10 size-80 rounded-full bg-brand-teal/25 blur-3xl" />
      <div className="container-x grid items-center gap-8 lg:grid-cols-2">
        <Reveal>
          <h2 id="subscribe-heading" className="font-display text-3xl font-bold !text-white sm:text-4xl">
            {data.heading}
          </h2>
          <p className="mt-3 max-w-lg text-lg text-white/80">{data.text}</p>
        </Reveal>
        <Reveal delay={120}>
          <NewsletterForm buttonLabel={data.buttonLabel} />
        </Reveal>
      </div>
    </section>
  )
}
