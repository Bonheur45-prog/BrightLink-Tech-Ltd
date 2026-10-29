import { localizeHtml, type Locale } from '@/i18n/config'
import type { TocItem } from '@/lib/content/types'

/**
 * The body of an article: the HTML rendered and made safe when it was saved in the CMS
 * (src/lib/blog/render.ts allows only known tags, attributes, brand colours, curated fonts and media-library
 * photos, and escapes all text). Links to pages of this site get the visitor's language prefix.
 * Styles: `.article-html` in src/styles/globals.css.
 */
export function ArticleHtml({ html, locale }: { html: string; locale: Locale }) {
  return <div className="article-html" dangerouslySetInnerHTML={{ __html: localizeHtml(html, locale) }} />
}

/** "In this article": the article's headings (level 2 and 3), shown when there are at least two. */
export function TableOfContents({ toc, label = 'In this article' }: { toc: TocItem[]; label?: string }) {
  if (toc.length < 2) return null
  return (
    <nav aria-label={label} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-navy">{label}</p>
      <ol className="mt-3 space-y-2 text-sm">
        {toc.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a href={`#${h.id}`} className="text-slate-600 transition hover:text-brand-blue">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
