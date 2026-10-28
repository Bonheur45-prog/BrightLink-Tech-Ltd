import { getHeader, getHomePage, getSiteSettings } from '@/lib/content'
import { HeaderShell } from './HeaderShell'
import { getRequestLocale } from '@/lib/content/request-locale'

/** Server component: loads everything the header shows from the CMS, then hands it to the interactive shell. */
export async function Header() {
  const [settings, header, home, locale] = await Promise.all([getSiteSettings(), getHeader(), getHomePage(), getRequestLocale()])

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
      heroEnabled={home.hero.enabled}
    />
  )
}
