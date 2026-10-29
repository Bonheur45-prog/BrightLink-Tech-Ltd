'use client'

import { useEffect, useRef, useState } from 'react'

// Cloudflare Turnstile ("are you a person?") inside a form. It adds the hidden field
// cf-turnstile-response, which the server checks (src/lib/security/turnstile.ts). Only shown when
// the site key is set in .env.

type Api = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: Api
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loading = null
      reject(new Error('Turnstile could not load'))
    }
    document.head.appendChild(s)
  })
  return loading
}

/** `resetKey` changes after a failed send: a token can be used only once, so the check starts again. */
export function TurnstileField({ siteKey, resetKey, fallbackEmail }: { siteKey: string; resetKey: unknown; fallbackEmail?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        widget.current = window.turnstile.render(box.current, { sitekey: siteKey, 'response-field-name': 'cf-turnstile-response', size: 'flexible', theme: 'light' })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [siteKey])

  useEffect(() => {
    if (resetKey && widget.current && window.turnstile) window.turnstile.reset(widget.current)
  }, [resetKey])

  if (failed) {
    return (
      <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        {/* TODO: translate for French and Kinyarwanda */}
        The spam check could not load (a browser extension may be blocking it).{' '}
        {fallbackEmail ? (
          <>
            Please email us at{' '}
            <a className="font-semibold underline" href={`mailto:${fallbackEmail}`}>
              {fallbackEmail}
            </a>{' '}
            instead.
          </>
        ) : (
          'Please reload the page, or contact us by phone or email.'
        )}
      </p>
    )
  }
  return <div ref={box} className="min-h-[65px]" />
}
