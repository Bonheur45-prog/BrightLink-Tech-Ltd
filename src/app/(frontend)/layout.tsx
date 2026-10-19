import type { Metadata, Viewport } from 'next'
import type { CSSProperties, ReactNode } from 'react'

import '@/styles/globals.css'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { JsonLd } from '@/components/ui/JsonLd'
import { getSiteSettings } from '@/lib/content'
import { getServerUrl, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { fontVar, isFontKey } from '@/lib/fonts'
import { allFontVariables } from '@/styles/fonts'


// Content comes from the CMS and is revalidated the moment an editor saves in /admin.
export const dynamic = 'force-dynamic'

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
    openGraph: { type: 'website', siteName: settings.companyName, locale: 'en_US' },
  }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  // Site-wide fonts chosen in Site settings. Only these two are used by the page, so only their files download.
  const fonts = {
    '--font-heading': `var(${fontVar(isFontKey(settings.headingFont) ? settings.headingFont : 'outfit')})`,
    '--font-body': `var(${fontVar(isFontKey(settings.bodyFont) ? settings.bodyFont : 'inter')})`,
  } as CSSProperties

  return (
    <html lang="en" className={allFontVariables} style={fonts}>
      <body>
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-navy-deep focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
