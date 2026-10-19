'use client'

import { createElement, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Milliseconds to wait before animating (use small steps to stagger a group). */
  delay?: number
  from?: 'up' | 'left' | 'right'
  as?: 'div' | 'li' | 'p' | 'h2' | 'span'
  className?: string
}

/** Fades and slides its content in the first time it scrolls into view. */
export function Reveal({ children, delay = 0, from = 'up', as = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      className: `reveal reveal-${from} ${shown ? 'is-visible' : ''} ${className}`,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  )
}
