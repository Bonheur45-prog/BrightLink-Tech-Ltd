import type { Metadata } from 'next'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import { ui } from '@/i18n/ui'
import { getRequestLocale } from '@/lib/content/request-locale'

export async function generateMetadata(): Promise<Metadata> {
  const t = ui(await getRequestLocale())
  return { title: { absolute: `${t.pageNotFound} | BrightLink Technologies` }, robots: { index: false, follow: false } }
}

export default async function NotFound() {
  const t = ui(await getRequestLocale())
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-brand-navy-deep text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#001a45_0%,#00327f_60%,#0057a3_100%)]" />
      <div className="absolute -left-20 top-10 -z-10 size-96 rounded-full bg-brand-orange/25 blur-3xl" />
      <div className="container-x pt-32 text-center">
        <p className="font-display text-7xl font-bold text-gradient-warm sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold !text-white sm:text-4xl">
          {t.notFoundTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          {t.notFoundText}
        </p>
        <SmartLink href="/" className="btn btn-primary mt-8">
          {t.backHome} <ArrowRightIcon width={18} height={18} />
        </SmartLink>
      </div>
    </section>
  )
}
