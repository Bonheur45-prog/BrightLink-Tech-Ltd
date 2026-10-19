import { getHeader, getHomePage, getSiteSettings } from '@/lib/content'
import { HeaderShell } from './HeaderShell'

/** Server component: loads everything the header shows from the CMS, then hands it to the interactive shell. */
export async function Header() {
  const [settings, header, home] = await Promise.all([getSiteSettings(), getHeader(), getHomePage()])

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
      heroEnabled={home.hero.enabled}
    />
  )
}
