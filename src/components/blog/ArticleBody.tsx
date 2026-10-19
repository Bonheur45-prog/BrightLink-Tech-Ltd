import Image from 'next/image'
import type { ReactNode } from 'react'

import type { Block, Inline } from '@/lib/content/types'

function renderInline(list: Inline[], key: string): ReactNode[] {
  return list.map((i, idx) => {
    let node: ReactNode = i.text
    if (i.code) node = <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-brand-navy">{node}</code>
    if (i.bold) node = <strong className="font-semibold text-brand-navy-deep">{node}</strong>
    if (i.italic) node = <em>{node}</em>
    if (i.href) {
      const external = /^https?:\/\//i.test(i.href)
      node = (
        <a
          href={i.href}
          {...(external || i.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-brand-blue underline decoration-brand-blue/30 underline-offset-4 transition hover:decoration-brand-blue"
        >
          {node}
        </a>
      )
    }
    return <span key={`${key}-${idx}`}>{node}</span>
  })
}

/** The article text, styled in one place. Headings carry ids so the table of contents can link to them. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[1.0625rem] leading-[1.8] text-slate-700 sm:text-lg">
      {blocks.map((b, i) => {
        const k = `b${i}`
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={k} id={b.id} className="mt-12 scroll-mt-28 font-display text-2xl font-bold leading-snug text-brand-navy-deep sm:text-[1.75rem]">
                <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-brand-link" />
                {renderInline(b.inlines, k)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={k} id={b.id} className="mt-9 scroll-mt-28 font-display text-xl font-semibold text-brand-navy-deep">
                {renderInline(b.inlines, k)}
              </h3>
            )
          case 'p':
            return (
              <p key={k} className={i === 0 ? 'text-xl leading-relaxed text-slate-800 sm:text-[1.35rem]' : 'mt-5'}>
                {renderInline(b.inlines, k)}
              </p>
            )
          case 'quote':
            return (
              <blockquote key={k} className="my-8 rounded-2xl border-l-4 border-brand-orange bg-slate-50 py-5 pl-6 pr-5 font-display text-xl italic text-brand-navy-deep">
                {renderInline(b.inlines, k)}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={k} className="mt-5 space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-[0.72em] size-2 shrink-0 rounded-full bg-brand-link" />
                    <span>{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={k} className="mt-5 space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span aria-hidden className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-brand-warm text-sm font-bold text-brand-navy-deep">
                      {j + 1}
                    </span>
                    <span>{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            )
          case 'image':
            return (
              <figure key={k} className="my-9">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={b.url} alt={b.alt} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
                </div>
                {b.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{b.caption}</figcaption>}
              </figure>
            )
          case 'hr':
            return <hr key={k} className="my-10 border-slate-200" />
        }
      })}
    </div>
  )
}

export function TableOfContents({ blocks }: { blocks: Block[] }) {
  const items = blocks.filter((b): b is Extract<Block, { type: 'h2' | 'h3' }> => b.type === 'h2' || b.type === 'h3')
  if (items.length < 2) return null
  return (
    <nav aria-label="In this article" className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-navy">In this article</p>
      <ol className="mt-3 space-y-2 text-sm">
        {items.map((h) => (
          <li key={h.id} className={h.type === 'h3' ? 'pl-4' : ''}>
            <a href={`#${h.id}`} className="text-slate-600 transition hover:text-brand-blue">
              {h.inlines.map((x) => x.text).join('')}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
