'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * A background layer that drifts slowly against the scroll direction (parallax).
 * It is taller than its section so there is never a gap, and does nothing for "reduce motion".
 */
export function ParallaxBg({ children, className = '' }: { children: ReactNode; className?: string }) {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = layer.current
    const section = el?.parentElement
    if (!el || !section) return
    if (document.documentElement.dataset.parallax !== 'true') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -200 || rect.top > vh + 200) return
      const delta = rect.top + rect.height / 2 - vh / 2 // 0 when the section is centred in the viewport
      const max = rect.height * 0.12
      const shift = Math.max(-max, Math.min(max, delta * -0.14))
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={layer} aria-hidden className={`absolute inset-x-0 -inset-y-[14%] will-change-transform ${className}`}>
      {children}
    </div>
  )
}
