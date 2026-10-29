import 'server-only'

import { headers } from 'next/headers'
import { LOCALE_HEADER, PATH_HEADER, defaultLocale, isLocale, type Locale } from '@/i18n/config'

/** The language of the page being rendered, from its address (set by src/middleware.ts). */
export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers()
  const value = requestHeaders.get(LOCALE_HEADER)
  return value && isLocale(value) ? value : defaultLocale
}

/** The page's address without the language prefix, with its query string ("/blog?q=web"). */
export async function getRequestPath(): Promise<string> {
  const value = (await headers()).get(PATH_HEADER)
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}
