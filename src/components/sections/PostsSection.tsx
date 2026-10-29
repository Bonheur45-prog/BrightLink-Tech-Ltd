import { CategoryNav } from '@/components/blog/CategoryNav'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { Pagination } from '@/components/blog/Pagination'
import { PostCard, PostRow } from '@/components/blog/PostCard'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SmartLink } from '@/components/ui/SmartLink'
import { localizeHref } from '@/i18n/config'
import { getAllPosts, getBlogCategories } from '@/lib/content'
import { SectionShell, num, text, type SectionProps } from './shared'

/**
 * Latest published articles. On the Blog page it is the whole listing: topics, search, featured article
 * and pages ("Grid with featured article"), or a plain paged grid ("Simple grid"). On any other page it
 * shows the newest articles with a link to the blog.
 */
export async function PostsSection({ section, ctx }: SectionProps) {
  const { locale, t } = ctx
  const perPage = num(section.data.limit, 9)
  const heading = text(section.data.heading, locale)
  const all = await getAllPosts()
  const id = `${ctx.anchor}-heading`
  const onBlog = ctx.page.key === 'blog'

  if (!onBlog) {
    const latest = all.slice(0, perPage)
    if (!latest.length) return null
    return (
      <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
        {(tone) => (
          <div className="container-x">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {heading && <SectionHeading id={id} tone={tone} title={heading} />}
              <Reveal className="shrink-0">
                <SmartLink href="/blog" className={tone === 'dark' ? 'btn btn-ghost' : 'btn btn-outline'}>
                  {t.allArticles}
                  <ArrowRightIcon width={18} height={18} />
                </SmartLink>
              </Reveal>
            </div>
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </SectionShell>
    )
  }

  const categories = await getBlogCategories()
  const q = ctx.page.search?.q ?? ''
  const magazineLayout = section.variant !== 'list'
  const matches = q ? all.filter((p) => [p.title, p.excerpt, p.category?.name ?? '', ...p.tags].join(' ').toLowerCase().includes(q.toLowerCase())) : all
  const lead = magazineLayout && !q ? (matches.find((p) => p.featured) ?? matches[0]) : undefined
  const rest = lead ? matches.filter((p) => p.id !== lead.id) : matches
  const totalPages = Math.max(1, Math.ceil(rest.length / perPage))
  const page = Math.min(Math.max(1, ctx.page.search?.page ?? 1), totalPages)
  const pageItems = rest.slice((page - 1) * perPage, page * perPage)
  const bentoShown = magazineLayout && page === 1 && !q && pageItems.length >= 3
  const bento = bentoShown ? pageItems.slice(0, 3) : []
  const grid = bentoShown ? pageItems.slice(3) : pageItems

  return (
    <SectionShell section={section} ctx={ctx} labelledBy={id} className="pb-20 pt-14 lg:pb-28">
      {(tone) => (
        <div className="container-x">
          {/* browse by topic + search */}
          <div aria-label={t.browseByTopic} role="group">
            <p className={`mb-6 text-center font-display text-sm font-bold uppercase tracking-[0.16em] ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue'}`}>{t.browseByTopic}</p>
            <CategoryNav categories={categories} total={all.length} />
            <form action={localizeHref('/blog', locale)} role="search" className="mx-auto mt-10 flex max-w-xl gap-2">
              <label htmlFor="blog-search" className="sr-only">
                {t.searchArticles}
              </label>
              <input
                id="blog-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder={t.searchPlaceholder}
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-base text-slate-800 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15"
              />
              <button type="submit" className="btn btn-primary">
                {t.search}
              </button>
            </form>
          </div>

          <div className="mt-14">
            {lead && page === 1 && (
              <div className="mb-16">
                <FeaturedPost post={lead} />
              </div>
            )}
            {matches.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-blue/30 bg-slate-50 p-10 text-center">
                <h2 id={id} className="font-display text-xl font-semibold text-brand-navy-deep">
                  {t.noArticles}
                  {q ? ` — “${q}”` : ''}
                </h2>
                <p className="mt-2 text-slate-600">{t.noArticlesHint}</p>
              </div>
            ) : (
              <>
                <SectionHeading id={id} tone={tone} eyebrow={q ? t.searchResults : t.journal} title={q ? `${t.resultsFor} “${q}”` : heading || t.journal} />
                {bento.length === 3 && (
                  <div className="mt-10 grid gap-7 lg:grid-cols-12">
                    <Reveal className="lg:col-span-7">
                      <PostCard post={bento[0]} large />
                    </Reveal>
                    <div className="grid gap-7 lg:col-span-5">
                      <Reveal delay={100}>
                        <PostRow post={bento[1]} />
                      </Reveal>
                      <Reveal delay={200}>
                        <PostRow post={bento[2]} />
                      </Reveal>
                    </div>
                  </div>
                )}
                {grid.length > 0 && (
                  <ul className={`${bento.length ? 'mt-7' : 'mt-10'} grid gap-7 sm:grid-cols-2 lg:grid-cols-3`}>
                    {grid.map((p, i) => (
                      <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                        <PostCard post={p} />
                      </Reveal>
                    ))}
                  </ul>
                )}
                <Pagination page={page} totalPages={totalPages} basePath="/blog" query={q ? { q } : {}} />
              </>
            )}
          </div>
        </div>
      )}
    </SectionShell>
  )
}
