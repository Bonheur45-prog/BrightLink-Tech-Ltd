'use client'

import { ui } from '@/i18n/ui'
import { useLocale } from './LocaleProvider'

/** Fixed interface text in the page's language, for client components (server code uses `ui(locale)`). */
export const useUi = () => ui(useLocale())
