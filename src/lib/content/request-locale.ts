import 'server-only'

import { headers } from 'next/headers'
import { defaultLocale, isLocale, type Locale } from '@/i18n/config'

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers()
  const value = requestHeaders.get('x-brightlink-locale')
  return value && isLocale(value) ? value : defaultLocale
}
