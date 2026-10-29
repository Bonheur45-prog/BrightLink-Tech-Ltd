import Script from 'next/script'

/**
 * Google Analytics 4 on the public pages (never on /admin: it has its own layout).
 * The ID is set in CMS → Site settings; empty = nothing is loaded.
 * Loads after the page is interactive, so it does not slow the first paint.
 * Moving between pages without a reload is counted by GA4 itself ("page changes based on browser history events",
 * on by default in the data stream's Enhanced measurement).
 */
export function GoogleAnalytics({ id }: { id: string }) {
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
