'use client'

import { Reveal } from '@/components/ui/Reveal'
import { IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { BlogCategory } from '@/lib/content/types'
import { CAT } from './theme'
import { useUi } from '@/components/i18n/useUi'

/** "Browse by topic" tiles. The current category (if any) is highlighted. */
export function CategoryNav({ categories, active, total }: { categories: BlogCategory[]; active?: string; total: number }) {
  const t = useUi()
  if (categories.length === 0) return null
  const base = 'group flex items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 shadow-md shadow-brand-navy/5 ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl'
  return (
    <nav aria-label={t.blogCategories}>
      <ul className="flex flex-wrap justify-center gap-3">
        <Reveal as="li">
          <SmartLink
            href="/blog"
            aria-current={!active ? 'page' : undefined}
            className={`${base} ${!active ? 'ring-2 ring-brand-navy' : 'ring-slate-200 hover:ring-brand-blue/40'}`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-brand-navy font-display text-sm font-bold text-white">All</span>
            <span>
              <span className="block font-display font-semibold text-brand-navy-deep">{t.allArticles}</span>
              <span className="block text-xs text-slate-500">{total} {total === 1 ? t.article : t.articles}</span>
            </span>
          </SmartLink>
        </Reveal>
        {categories.map((c, i) => (
          <Reveal as="li" key={c.id} delay={(i + 1) * 60}>
            <SmartLink
              href={c.url}
              aria-current={active === c.slug ? 'page' : undefined}
              className={`${base} ${active === c.slug ? 'ring-2 ring-brand-navy' : `ring-slate-200 ${CAT[c.color].ring}`}`}
            >
              <span className={`grid size-11 place-items-center rounded-xl ${CAT[c.color].tile}`}>
                <IconByKey name={c.icon} width={22} height={22} />
              </span>
              <span>
                <span className="block font-display font-semibold text-brand-navy-deep">{c.name}</span>
                <span className="block text-xs text-slate-500">{c.count} {c.count === 1 ? t.article : t.articles}</span>
              </span>
            </SmartLink>
          </Reveal>
        ))}
      </ul>
    </nav>
  )
}
