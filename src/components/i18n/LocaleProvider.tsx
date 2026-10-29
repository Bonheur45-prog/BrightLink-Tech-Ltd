'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import { defaultLocale, type Locale } from '@/i18n/config'

const LocaleContext = createContext<Locale>(defaultLocale)

/** Set once by the public layout; links read it to add the language prefix (/fr, /rw). */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

/** The language of the page (English outside the public site, e.g. in the CMS). */
export const useLocale = () => useContext(LocaleContext)
