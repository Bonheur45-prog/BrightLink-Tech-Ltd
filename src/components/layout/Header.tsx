import { getHeader, getSiteSettings } from '@/lib/content'
import { loadLivePage } from '@/lib/content/live-pages'
import { HeaderShell } from './HeaderShell'
import { getRequestLocale } from '@/lib/content/request-locale'

/** Server component: loads everything the header shows from the CMS, then hands it to the interactive shell. */
export async function Header() {
  const locale = await getRequestLocale()
  const [settings, header, home] = await Promise.all([getSiteSettings(), getHeader(), loadLivePage('home', locale)])
  // The header can float over the home page's hero only when that page opens with one.
  const heroEnabled = home.doc.sections[0]?.type === 'hero'

  return (
    <HeaderShell
      company={{
        name: settings.companyName,
        logo: settings.logo,
        logoLight: settings.logoLight,
        phone: settings.phone,
        email: settings.email,
        socials: settings.socials,
      }}
      header={header}
      locale={locale}
      enabledLocales={settings.enabledLocales}
      heroEnabled={heroEnabled}
    />
  )
}
