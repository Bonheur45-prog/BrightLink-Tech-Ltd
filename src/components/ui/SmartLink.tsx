import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  newTab?: boolean
  children: ReactNode
}

/** Internal paths use next/link (fast client navigation); everything else is a normal, safe anchor. */
export function SmartLink({ href, newTab = false, children, ...rest }: Props) {
  const isInternal = href.startsWith('/') && !href.startsWith('//')
  if (isInternal && !newTab) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  const isWeb = /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      {...(newTab || isWeb ? { target: newTab ? '_blank' : undefined } : {})}
      rel={newTab || isWeb ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
