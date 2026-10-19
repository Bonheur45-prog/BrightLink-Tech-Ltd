import type { Metadata } from 'next'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'

export const metadata: Metadata = {
  title: { absolute: 'Page not found | BrightLink Technologies' },
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-brand-navy-deep text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_60%,#0057a3_100%)]" />
      <div className="absolute -left-20 top-10 -z-10 size-96 rounded-full bg-brand-orange/25 blur-3xl" />
      <div className="container-x pt-32 text-center">
        <p className="font-display text-7xl font-bold text-gradient-warm sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold !text-white sm:text-4xl">
          This page isn’t here (yet)
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          The page may have moved, or it’s still being built. Head back home and we’ll get you where you need to go.
        </p>
        <SmartLink href="/" className="btn btn-primary mt-8">
          Back to home <ArrowRightIcon width={18} height={18} />
        </SmartLink>
      </div>
    </section>
  )
}
