import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'

import '@/styles/globals.css'
import { Footer } from '@/components/layout/Footer'
import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics'
import { Header } from '@/components/layout/Header'
import { LocaleProvider } from '@/components/i18n/LocaleProvider'
import { ogLocale } from '@/i18n/config'
import { JsonLd } from '@/components/ui/JsonLd'
import { getSiteSettings } from '@/lib/content'
import { getServerUrl, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { fontVar, isFontKey } from '@/lib/fonts'
import { allFontVariables } from '@/styles/fonts'
import { getRequestLocale, getRequestPath } from '@/lib/content/request-locale'
import { ui } from '@/i18n/ui'


export const viewport: Viewport = {
  themeColor: '#001a45',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(getServerUrl()),
    title: { default: settings.seo.defaultTitle, template: settings.seo.titleTemplate },
    description: settings.seo.defaultDescription,
    applicationName: settings.companyName,
    authors: [{ name: settings.legalName }],
    creator: settings.legalName,
    publisher: settings.legalName,
    formatDetection: { telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    verification: settings.seo.googleSiteVerification
      ? { google: settings.seo.googleSiteVerification }
      : undefined,
    openGraph: { type: 'website', siteName: settings.companyName, locale: ogLocale[settings.locale] },
  }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getRequestLocale()])
  // A language that is switched off in Site settings has no pages: send the visitor to the English one.
  // Temporary (307), because the language may be switched on later.
  if (!settings.enabledLocales.includes(locale)) redirect(await getRequestPath())
  // Site-wide fonts chosen in Site settings. Only these two are used by the page, so only their files download.
  const fonts = {
    '--font-heading': `var(${fontVar(isFontKey(settings.headingFont) ? settings.headingFont : 'outfit')})`,
    '--font-body': `var(${fontVar(isFontKey(settings.bodyFont) ? settings.bodyFont : 'inter')})`,
  } as CSSProperties

  return (
    <html lang={locale} data-parallax={settings.parallax ? 'true' : 'false'} className={allFontVariables + (settings.smoothScroll ? ' scroll-smooth' : '')} style={fonts}>
      <body>
        <LocaleProvider locale={locale}>
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-navy-deep focus:px-5 focus:py-3 focus:text-white"
        >
          {ui(locale).skipToContent}
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        </LocaleProvider>
        <GoogleAnalytics id={settings.seo.googleAnalyticsId} />
      </body>
    </html>
  )
}
