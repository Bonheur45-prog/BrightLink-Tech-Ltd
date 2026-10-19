'use client'

import { useEffect, useRef } from 'react'

/** A thin brand-coloured bar at the top of the window that fills as the article is read. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = document.getElementById(targetId)
    const b = bar.current
    if (!el || !b) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      const done = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.2) / Math.max(total, 1)))
      b.style.transform = `scaleX(${done.toFixed(3)})`
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
  }, [targetId])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-brand-link" />
    </div>
  )
}
