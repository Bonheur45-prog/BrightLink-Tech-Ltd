'use client'

import { useState } from 'react'

import { SocialIcon } from '@/components/ui/Icons'
import { useUi } from '@/components/i18n/useUi'

/** Share links open the visitor's own account on each network; nothing is hard-coded to BrightLink's pages. */
export function ShareBar({ url, title, vertical = false }: { url: string; title: string; vertical?: boolean }) {
  const [copied, setCopied] = useState(false)
  const text = useUi()
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { key: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { key: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ]
  const cls = 'grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-brand-navy transition hover:border-brand-blue hover:bg-brand-blue hover:text-white'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the share links above still work */
    }
  }
  return (
    <div className={`flex items-center gap-2.5 ${vertical ? 'flex-wrap' : ''}`}>
      {links.map((l) => (
        <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l.label}`} className={cls}>
          <SocialIcon platform={l.key} width={18} height={18} />
        </a>
      ))}
      <button type="button" onClick={copy} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition hover:border-brand-blue hover:text-brand-blue">
        {copied ? text.linkCopied : text.copyLink}
      </button>
    </div>
  )
}
