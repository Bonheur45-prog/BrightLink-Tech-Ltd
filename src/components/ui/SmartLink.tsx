'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { useLocale } from '@/components/i18n/LocaleProvider'
import { localizeHref } from '@/i18n/config'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  newTab?: boolean
  children: ReactNode
}

/**
 * Internal paths use next/link (fast client navigation) and keep the visitor's language
 * ("/about-us" → "/fr/about-us" on the French site); everything else is a normal, safe anchor.
 */
export function SmartLink({ href, newTab = false, children, ...rest }: Props) {
  const locale = useLocale()
  const isInternal = href.startsWith('/') && !href.startsWith('//')
  const target = isInternal ? localizeHref(href, locale) : href
  if (isInternal && !newTab) {
    return (
      <Link href={target} {...rest}>
        {children}
      </Link>
    )
  }
  const isWeb = /^https?:\/\//i.test(href)
  return (
    <a
      href={target}
      {...(newTab || isWeb ? { target: newTab ? '_blank' : undefined } : {})}
      rel={newTab || isWeb ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
