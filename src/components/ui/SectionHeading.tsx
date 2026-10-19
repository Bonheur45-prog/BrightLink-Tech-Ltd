import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

/** Heading text with the editor's highlighted words drawn in the brand gradient. */
export function Highlighted({ text, highlight, tone = 'light' }: { text: string; highlight?: string; tone?: 'light' | 'dark' }) {
  if (!highlight) return <>{text}</>
  const start = text.toLowerCase().indexOf(highlight.toLowerCase())
  if (start === -1) return <>{text}</>
  const end = start + highlight.length
  return (
    <Fragment>
      {text.slice(0, start)}
      <span className={tone === 'dark' ? 'text-gradient-warm' : 'text-gradient-cool'}>{text.slice(start, end)}</span>
      {text.slice(end)}
    </Fragment>
  )
}

type Props = {
  eyebrow?: string
  title: string
  highlight?: string
  intro?: string
  id?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  children?: ReactNode
}

export function SectionHeading({ eyebrow, title, highlight, intro, id, align = 'left', tone = 'light', children }: Props) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <Reveal>
          <p
            className={`inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] ${
              tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue'
            }`}
          >
            <span aria-hidden className="h-0.5 w-8 rounded-full bg-brand-link" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2
          id={id}
          className={`mt-4 font-display text-section font-bold ${tone === 'dark' ? '!text-white' : ''}`}
        >
          <Highlighted text={title} highlight={highlight} tone={tone} />
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={160}>
          <p className={`mt-5 text-lg leading-relaxed ${tone === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>{intro}</p>
        </Reveal>
      )}
      {children}
    </div>
  )
}
