import Image from 'next/image'
import type { MediaRef } from '@/lib/content/types'

const BUNDLED = { url: '/images/brand/brightlink-logo.png', width: 839, height: 299 }
const BUNDLED_LIGHT = { url: '/images/brand/brightlink-logo-light.png', width: 839, height: 299 }

type Props = {
  logo: MediaRef | null
  logoLight: MediaRef | null
  companyName: string
  /** `light` = wordmark for dark backgrounds. */
  tone?: 'default' | 'light'
  priority?: boolean
  className?: string
}

/**
 * The official BrightLink logo. Editors can replace it in Site Settings; otherwise the bundled brand files are used.
 * On dark backgrounds we use the light wordmark (or, for a custom logo without a light version, a white silhouette).
 */
export function Logo({ logo, logoLight, companyName, tone = 'default', priority = false, className = '' }: Props) {
  let src: { url: string; width?: number; height?: number }
  let whiten = false

  if (tone === 'light') {
    if (logoLight) src = logoLight
    else if (logo) {
      src = logo
      whiten = true
    } else src = BUNDLED_LIGHT
  } else {
    src = logo ?? BUNDLED
  }

  return (
    <Image
      src={src.url}
      alt={`${companyName} logo`}
      width={src.width ?? BUNDLED.width}
      height={src.height ?? BUNDLED.height}
      priority={priority}
      sizes="(min-width: 1024px) 190px, 160px"
      className={`w-auto select-none ${whiten ? 'brightness-0 invert' : ''} ${className}`}
      draggable={false}
    />
  )
}
